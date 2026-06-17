import json
import asyncio
import uuid
from typing import AsyncGenerator
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from config import settings
from schemas.review import ReviewIssue
from services.prompt_templates import SYSTEM_PROMPT, build_review_prompt


def _build_sse_event(event: str, data: str = "") -> str:
    """格式化SSE输出字符串"""
    lines = []
    if event:
        lines.append(f"event: {event}")
    for line in data.strip().split("\n"):
        lines.append(f"data: {line}")
    lines.append("")
    return "\n".join(lines) + "\n"


def _thinking_event(step: str, progress: float, detail: str = "") -> str:
    """SSE输出思考过程"""
    payload = json.dumps(
        {
            "type": "thinking",
            "step": step,
            "progress": round(progress, 2),
            "detail": detail,
        },
        ensure_ascii=False,
    )
    return _build_sse_event("thinking", payload)


def _issue_event(issue: dict) -> str:
    """SSE输出代码检测问题"""
    payload = json.dumps(
        {
            "type": "issue",
            **issue,
        },
        ensure_ascii=False,
    )
    return _build_sse_event("issue", payload)


def _done_event(total_issues: int, summary: str, score: int) -> str:
    """SSE事件执行完成"""
    payload = json.dumps(
        {
            "type": "done",
            "total_issues": total_issues,
            "summary": summary,
            "score": score,
        },
        ensure_ascii=False,
    )
    return _build_sse_event("done", payload)


def _error_event(message: str) -> str:
    """SSE事件执行出错"""
    payload = json.dumps({"type": "error", "message": message}, ensure_ascii=False)
    return _build_sse_event("error", payload)


def _chunk_code(code: str, chunk_size: int = 3000) -> list[tuple[int, str]]:
    """按行分块，返回 [(开始行, 代码块), ...]"""
    lines = code.split("\n")
    chunks: list[tuple[int, str]] = []
    for start in range(0, len(lines), chunk_size):
        end = min(start + chunk_size, len(lines))
        chunks.append((start + 1, "\n".join(lines[start:end])))
    return chunks


def _parse_issues(raw: str, category: str = "", line_offset: int = 0) -> list[dict]:
    """解析llm返回的json，过滤只保留问题列表数据"""
    text = raw.strip()  # 删掉首位空格和换行符
    if text.startswith("```"):
        text = text.lstrip("`")  # 删掉md引号
        if text.lower().startswith("json"):
            text = text[4:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        import re

        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group())
            except json.JSONDecodeError:
                return []
        else:
            return []

    if isinstance(parsed, dict):
        issues = parsed.get("issues", [])
    elif isinstance(parsed, list):
        issues = parsed
    else:
        return []

    result: list[dict[ReviewIssue | bool, bool]] = []
    for item in issues:
        if not isinstance(item, dict):
            continue
        result.append(
            {
                "id": item.get("id", str(uuid.uuid4())[:8]),
                "severity": item.get("severity", "info"),  # 严重程度
                "category": item.get("category", category or "style"),  # 问题分类
                "title": item.get("title", ""),
                "description": item.get("description", ""),
                "suggestion": item.get("suggestion", ""),
                "line_start": int(item.get("line_start", 0))
                + line_offset,  # 问题开始行
                "line_end": int(item.get("line_end", 0)) + line_offset,  # 问题结束行
                "code_snippet": item.get("code_snippet", ""),  # 问题具体代码片段
                "fixed_code": item.get("fixed_code") or None,  # 修复代码
            }
        )

    return result


DIMENSION_LABELS = {
    "security": "安全检查",
    "performance": "性能分析",
    "style": "代码风格",
    "best_practice": "最佳实践",
}


async def review_code_stream(
    code: str,
    dimensions: list[str],
) -> AsyncGenerator[str, None]:
    if not code.strip():
        yield _error_event("代码为空，请提供需要审查的代码")
        return

    valid_dims = [d for d in dimensions if d in settings.available_dimensions]
    if not valid_dims:
        yield _error_event(f"无效的审查维度: {dimensions}")
        return

    # 按行分块
    chunks = _chunk_code(code)
    total_steps = len(valid_dims) * len(chunks) + 2  # 初始 + 解析
    current_step = 0

    current_step += 1
    yield _thinking_event(
        f"初始化审查引擎（代码已分 {len(chunks)} 块）...",
        current_step / total_steps,
    )

    llm = ChatOpenAI(
        model=settings.MODEL_NAME,
        api_key=settings.MODEL_API_KEY,
        base_url=settings.MODEL_BASE_URL,
        temperature=0.1,
        streaming=True,
    )

    all_issues: list[dict] = []
    dimension_responses: dict[str, list[tuple[int, str]]] = {}

    for dim in valid_dims:
        label = DIMENSION_LABELS.get(dim)
        dimension_responses[dim] = []

        for chunk_offset, chunk_text in chunks:
            current_step += 1
            yield _thinking_event(
                f"{label}（块 {chunk_offset} 行起）...",
                current_step / total_steps,
                f"审查维度: {label}，第 {chunk_offset} 行开始",
            )

            prompt_text = build_review_prompt(chunk_text, dim)
            messages = [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=prompt_text),
            ]

            try:
                response = await asyncio.wait_for(llm.ainvoke(messages), timeout=30)
                raw_output = (
                    response.content if hasattr(response, "content") else str(response)
                )
                dimension_responses[dim].append((chunk_offset, str(raw_output)))

            except Exception as e:
                yield _thinking_event(
                    f"{label}块 {chunk_offset} 行审查出错，跳过: {str(e)}",
                    current_step / total_steps,
                    detail=str(e),
                )

    current_step += 1
    yield _thinking_event(
        "正在解析和合并分块审查结果...",
        current_step / total_steps,
    )

    # 解析所有分块结果（带行号偏移）
    for dim in valid_dims:
        chunk_results = dimension_responses.get(dim, [])
        if not chunk_results:
            continue

        for chunk_offset, raw_output in chunk_results:
            try:
                issues = _parse_issues(
                    raw_output, category=dim, line_offset=chunk_offset - 1
                )

                for issue in issues:
                    if not issue["category"]:
                        issue["category"] = dim
                    issue["id"] = f"{dim}-{issue['id']}"

                all_issues.extend(issues)

                for issue in issues:
                    yield _issue_event(issue)
                    await asyncio.sleep(0.05)

            except Exception as e:
                label = DIMENSION_LABELS.get(dim, dim)
                yield _thinking_event(
                    f"{label}块 {chunk_offset} 行结果解析失败: {str(e)}",
                    current_step / total_steps,
                )

    current_step += 1
    yield _thinking_event(
        "正在生成审查报告...",
        current_step / total_steps,
    )

    # 计算评分
    deductions = sum(
        {"error": 15, "warning": 8, "info": 3}.get(i["severity"], 0) for i in all_issues
    )
    score = max(0, 100 - deductions)

    by_category = {}
    for i in all_issues:
        cat = i["category"]
        by_category.setdefault(cat, {"error": 0, "warning": 0, "info": 0})
        by_category[cat][i.get("severity", "info")] += 1

    summary_parts = []
    for cat, counts in by_category.items():
        label = DIMENSION_LABELS.get(cat, cat)
        parts = []
        if counts["error"]:
            parts.append(f"{counts['error']}个错误")
        if counts["warning"]:
            parts.append(f"{counts['warning']}个警告")
        if counts["info"]:
            parts.append(f"{counts['info']}个建议")
        summary_parts.append(f"{label}: {', '.join(parts)}")
    summary = "；".join(summary_parts) if summary_parts else "未发现问题"

    yield _done_event(len(all_issues), summary, score)
