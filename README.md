<h1 align="center">✨ Full-Stack Interview Platform ✨</h1>

![Demo App](/frontend/public/screenshot-for-readme.png)

✨ Highlights:

- 🧑‍💻 VSCode-Powered Code Editor
- 🔐 Authentication via Clerk
- 🎥 1-on-1 Video Interview Rooms
- 🧭 Dashboard with Live Stats
- 🔊 Mic & Camera Toggle, Screen Sharing & Recording
- 💬 Real-time Chat Messaging
- ⚙️ Secure Code Execution in Isolated Environment
- 🎯 Auto Feedback — Success / Fail based on test cases
- 🎉 Confetti on Success + Notifications on Fail
- 🧩 Practice Problems Page (solo coding mode)
- 🔒 Room Locking — allows only 2 participants
- 🧠 Background Jobs with Inngest (async tasks)
- 🧰 REST API with Node.js & Express
- ⚡ Data Fetching & Caching via TanStack Query
- 🤖 CodeRabbit for PR Analysis & Code Optimization
- 🧑‍💻 Git & GitHub Workflow (branches, PRs, merges)
- 🚀 Deployment on Sevalla (free-tier friendly)

---

## 🧪 .env Setup

### Backend (`/backend`)

```bash
PORT=3000
NODE_ENV=development

DB_URL=your_mongodb_connection_url

INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

CLIENT_URL=http://localhost:5173
```

### Frontend (`/frontend`)

```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

VITE_API_URL=http://localhost:3000/api

VITE_STREAM_API_KEY=your_stream_api_key
```

---

## 🔧 Run the Backend

```bash

cd backend
npm install
npm run dev
```

---

## 🔧 Run the Frontend

```
bash
cd frontend
npm install
npm run dev
```

## Local Code Execution Sandbox

Piston has been removed. Code execution now runs through the backend on your own server.

Backend env vars for the sandbox:

```bash
CODE_EXECUTION_TIMEOUT_MS=5000
CODE_EXECUTION_MEMORY_MB=256
CODE_EXECUTION_CPU_COUNT=1
CODE_EXECUTION_MAX_SOURCE_BYTES=50000
CODE_EXECUTION_MAX_OUTPUT_BYTES=64000
DOCKER_JS_IMAGE=node:20-alpine
DOCKER_PYTHON_IMAGE=python:3.11-alpine
DOCKER_JAVA_IMAGE=eclipse-temurin:21-jdk-alpine
```

Server requirement:

```bash
docker pull node:20-alpine
docker pull python:3.11-alpine
docker pull eclipse-temurin:21-jdk-alpine
```

Sandbox protections enabled by the backend:

- no outbound network access
- read-only container filesystem
- temporary writable `/tmp` only
- non-root container user
- dropped Linux capabilities
- `no-new-privileges`
- CPU, memory, process-count, source-size, output-size, and execution-time limits
- per-user request throttling
