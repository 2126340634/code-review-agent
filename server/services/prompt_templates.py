# system
SYSTEM_PROMPT = """你是一位资深代码审查专家，拥有10年以上软件开发经验。
你的审查风格：精准、务实、不挑无关紧要的毛病。
每条问题必须附带具体的行号范围和修改建议代码。
只返回JSON，不要任何额外文字。"""

# 安全检查
SECURITY_PROMPT = """审查以下代码的**安全问题**。只关注真正有风险的，不报无关紧要的。

检查项：
- XSS（innerHTML、dangerouslySetInnerHTML、未转义的用户输入）
- SQL/NoSQL 注入（字符串拼接查询、未参数化）
- 敏感信息泄露（硬编码密钥、token、密码）
- 路径穿越、任意文件读取
- eval / new Function / 动态代码执行
- 不安全的反序列化
- CSRF / 缺失鉴权检查
- 不安全的依赖调用

代码：
{code}"""

# 性能分析
PERFORMANCE_PROMPT = """审查以下代码的**性能问题**。只关注真正影响性能的，不报无关紧要的。

检查项：
- 不必要的重渲染/重复计算（缺少 memo、循环内创建函数）
- 内存泄漏（未清理的定时器、事件监听、闭包引用）
- O(n^2) 或更高复杂度可优化的操作
- 大循环中的低效操作（频繁 DOM 操作、重复正则编译）
- 未使用懒加载/代码分割
- 大对象深拷贝的性能隐患
- 接口请求未防抖/节流
- 列表渲染缺少 key 或 key 使用不当

代码：
{code}"""

# 代码风格
STYLE_PROMPT = """审查以下代码的**代码风格和可读性**。只关注真正影响可维护性的，不报无关紧要的。

检查项：
- 命名不规范（单字母变量、拼音命名、含义不清）
- 函数过长（超过50行需拆分）
- 嵌套过深（超过4层）
- 魔法数字/硬编码常量
- 注释缺失或过时的注释
- 重复代码（可抽取为函数/组件）
- 文件过大（超过300行建议拆分）
- 不一致的代码风格

代码：
{code}"""

# 最佳实践
BEST_PRACTICE_PROMPT = """审查以下代码的**最佳实践**。只关注真正影响健壮性的，不报无关紧要的。

检查项：
- 错误处理缺失（try-catch、Promise rejection、边界条件）
- 类型安全问题（TypeScript any 滥用、缺少类型守卫）
- 违背 SOLID 原则
- 异步处理不当（竞态条件、Promise.all vs 串行）
- 状态管理混乱（props drilling 过深、全局状态滥用）
- 组件耦合过紧，难以复用
- 未处理 loading / empty / error 三种状态
- 可访问性（a11y）缺失

代码：
{code}"""

# 输出结果
OUTPUT_SCHEMA = """
返回严格的 JSON 数组（不要外层对象包裹）：

[
  {
    "severity": "error" | "warning" | "info",
    "category": "security" | "performance" | "style" | "best_practice",
    "title": "简短的问题标题（中文，10字以内）",
    "description": "为什么这是问题（中文，简洁）",
    "line_start": 起始行号（数字）,
    "line_end": 结束行号（数字）,
    "code_snippet": "有问题的原始代码片段",
    "suggestion": "修复建议（中文）",
    "fixed_code": "修改后的代码片段"
  }
]

如果没有发现问题，返回空数组 []。
只返回JSON数组，不要任何Markdown包裹、不要解释。
"""

DIMENSION_PROMPTS = {
    "security": SECURITY_PROMPT,
    "performance": PERFORMANCE_PROMPT,
    "style": STYLE_PROMPT,
    "best_practice": BEST_PRACTICE_PROMPT,
}


def build_review_prompt(code: str, dimension: str) -> str:
    """构建review提示词"""
    template = DIMENSION_PROMPTS.get(dimension)
    return template.format(code=code) + "\n" + OUTPUT_SCHEMA
