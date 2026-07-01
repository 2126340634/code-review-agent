# AI Code Review Agent

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?logo=langchain)

---

## 项目简介

一个 AI 代码审查工具，粘贴代码或上传文件，选择审查维度，通过 AI Agent 实时流式获取专业的代码审查结果。

后端基于 LangChain 编排 LLM，将代码按 **安全、性能、风格、最佳实践** 四个维度分别审查，并通过 Server-Sent Events (SSE) 将思考过程和问题结果实时推送到前端。

---

## 快速开始

### 前置

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
pnpm install

# 启动开发服务器（默认端口 8848，vite代理自动请求转发到后端）
pnpm dev
```
