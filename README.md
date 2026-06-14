# AI Code Review Agent

> 基于 AI Agent 的多维度代码审查工具 — 粘贴代码即可获得专业级的代码质量分析。

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?logo=langchain)

---

## 项目简介

AI Code Review Agent 是一个全栈 AI 代码审查工具，用户只需粘贴代码（或上传文件），选择审查维度，即可通过 AI Agent 实时流式获取专业的代码审查结果。

后端基于 LangChain 编排 LLM，将代码按 **安全、性能、风格、最佳实践** 四个维度分别审查，并通过 Server-Sent Events (SSE) 将思考过程和问题结果实时推送到前端。

---

## 核心功能

### 多维度审查
| 维度 | 说明 |
|------|------|
| 🔴 **安全检查** | XSS、SQL注入、敏感信息泄露、路径穿越、动态代码执行、CSRF 等 |
| 🟠 **性能分析** | 不必要的重渲染、内存泄漏、O(n²) 复杂度、大循环低效操作、缺少防抖节流 |
| 🟣 **代码风格** | 命名规范、函数长度、嵌套深度、魔法数字、重复代码、注释质量 |
| 🟢 **最佳实践** | 错误处理缺失、类型安全、SOLID 原则、异步处理、状态管理、a11y |

### 交互特性
- **代码输入**：支持粘贴代码或拖拽上传文件，自动识别语言
- **语言选择**：支持 JavaScript / TypeScript / Python / Java / Go / Rust / C++ / HTML / CSS / SQL / JSON 等
- **维度选择**：灵活勾选需要审查的维度，支持多选
- **实时流式输出**：审查过程 Agent 思考链实时展示，问题逐条推送
- **问题卡片**：严重程度标签（错误/警告/建议）、问题代码片段、行号定位、修复建议代码
- **综合评分**：基于问题数量和严重程度自动计算代码质量评分（0-100）
- **代码预览**：集成 Monaco Editor 展示代码，支持问题行号跳转
- **分栏布局**：上下分栏 + 左右分栏可拖拽调整

### 技术亮点
- **SSE 实时流**：后端逐条推送审查结果，前端增量渲染，零等待
- **多 Agent 编排**：每个维度独立调用 LLM，并行分析，结果汇总
- **LangChain 集成**：基于 LangChain 框架编排模型调用、Prompt 管理
- **容错设计**：单维度超时/失败不影响其他维度，解析异常优雅降级
- **重试机制**：前端 SSE 连接中断自动重试（最多 3 次，指数退避）

---

## 技术栈

### 前端
| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript 6.0 | 类型安全 |
| Vite 8 | 开发/构建工具 |
| Monaco Editor | 代码编辑器与预览 |
| CSS Modules | 组件级样式隔离 |
| SSE (EventSource) | 实时数据流 |

### 后端
| 技术 | 用途 |
|------|------|
| Python 3.12+ | 运行时 |
| FastAPI | RESTful API + SSE 流式响应 |
| LangChain 0.3 | LLM 编排框架 |
| LangChain-OpenAI | OpenAI 兼容接口适配 |
| Pydantic | 数据验证模型 |
| Uvicorn | ASGI 服务器 |

---

## 快速开始

### 前置条件
- Node.js 18+
- Python 3.12+
- 一个兼容 OpenAI API 的大模型服务（如 DeepSeek）

### 1. 启动后端

```bash
cd server

# 创建虚拟环境
python -m venv .venv

# 进入虚拟环境并安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 API Key 和模型配置等

# 启动服务（默认端口 8921）
python main.py
```

### 2. 启动前端

```bash
cd client

# 安装依赖
npm install

# 启动开发服务器（默认端口 8848，vite代理自动请求转发到后端）
npm run dev
```

---

## 项目结构

```
├── client/                      # 前端 (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeInput/          # 代码输入面板（粘贴/上传）
│   │   │   ├── CodeViewer/         # Monaco 代码预览
│   │   │   ├── DimensionSelector/  # 维度选择器
│   │   │   ├── Layout/             # 布局组件（Header、SplitPane）
│   │   │   └── ReviewPanel/        # 审查结果面板
│   │   │       ├── IssueCard.tsx       # 问题卡片（展开/收起、代码片段）
│   │   │       ├── IssueList.tsx       # 问题列表
│   │   │       ├── ReviewSummary.tsx   # 评分摘要
│   │   │       ├── SeverityBadge.tsx   # 严重程度标签
│   │   │       └── ThinkingChain.tsx   # Agent 思考链
│   │   ├── hooks/
│   │   │   ├── useCodeReview.ts    # 审查状态管理（useReducer）
│   │   │   └── useSSE.ts           # SSE 连接管理（含重试逻辑）
│   │   ├── types/                  # TypeScript 类型定义
│   │   ├── styles/                 # CSS Modules 样式
│   │   └── App.tsx                 # 主应用组件
│   └── vite.config.ts              # Vite 配置（含 API 代理）
│
├── server/                      # 后端 (Python + FastAPI)
│   ├── main.py                  # FastAPI 应用入口
│   ├── config.py                # 配置管理（环境变量）
│   ├── routers/
│   │   └── review.py            # 审查 API 路由
│   ├── schemas/
│   │   └── review.py            # 请求/响应 Pydantic 模型
│   └── services/
│       ├── review_agent.py      # 审查 Agent 核心逻辑（SSE 流、评分、解析）
│       └── prompt_templates.py  # 维度 Prompt 模板
│
└── README.md
```

---

## 配置说明

### 后端环境变量 (`server/.env`)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MODEL_API_KEY` | 大模型 API 密钥 | (必填) |
| `MODEL_BASE_URL` | API 地址 | `https://api.deepseek.com` |
| `MODEL_NAME` | 模型名称 | `deepseek-v4-flash` |
| `MAX_CODE_LENGTH` | 单次最大审查代码字符数 | `15000` |
| `PORT` | 后端服务端口 | `8921` |

---
