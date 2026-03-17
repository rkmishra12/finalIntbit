# INTBIT Interview Platform

![Demo App](/frontend/public/screenshot-for-readme.png)

## Project Structure

- `frontend/`: React + Vite app, ready to deploy to Vercel
- `backend/`: Express API, ready to deploy to Render

The backend and frontend are now separated for deployment. The backend does not serve the frontend build in production.

## Local Setup

1. Copy `backend/.env.example` to `backend/.env`
2. Copy `frontend/.env.example` to `frontend/.env`
3. Install dependencies in each app

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run Locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- API base URL: `http://localhost:3000/api`

## Deploy Frontend To Vercel

Set the Vercel project root to `frontend`.

Environment variables:

```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=https://your-render-backend.onrender.com/api
VITE_STREAM_API_KEY=your_stream_api_key
```

Notes:

- `frontend/vercel.json` rewrites all routes to `index.html` so React Router works on refresh
- After deploying the frontend, copy the Vercel URL and use it as `CLIENT_URL` in Render

## Deploy Backend To Render

Set the Render service root to `backend`.

Required environment variables:

```bash
PORT=3000
NODE_ENV=production
DB_URL=your_mongodb_connection_url
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLIENT_URL=https://your-vercel-frontend.vercel.app
CODE_EXECUTION_ENABLED=false
CODE_EXECUTION_MAX_SOURCE_BYTES=50000
```

Useful endpoint checks:

- `GET /`
- `GET /health`

## Hosted Code Execution

For a standard Render deployment, code execution is disabled by default. This avoids running untrusted user code directly inside your web service.

If you want hosted code execution later, connect the app to a separate purpose-built sandbox service instead of running interpreters or containers inside the Render web process.
