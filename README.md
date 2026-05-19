# ⚡ Team PM — Project Management System

A full-stack **Team Project Management System** built with the MERN stack and modern DevOps practices (Docker, Kubernetes, GitHub Actions CI/CD).

---

## 📐 Architecture

```
┌─────────────┐      ┌─────────────────┐      ┌────────────────┐
│  React.js   │─────▶│  Express + Node │─────▶│  MongoDB Atlas │
│  (Vite)     │ HTTP │  REST API       │      │                │
│  Port 5173  │      │  Port 5000      │      │                │
└─────────────┘      └─────────────────┘      └────────────────┘
```

## 🗂 Project Structure

```
project-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth middleware (JWT)
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express route definitions
│   │   └── index.js         # Server entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios config & interceptors
│   │   ├── components/      # Shared UI (Layout, etc.)
│   │   ├── context/         # React AuthContext
│   │   └── pages/           # Login, Register, Dashboard, Projects, Tasks
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── k8s/
│   ├── namespace-and-secrets.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── docker-compose.yml
└── README.md
```

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| Containerization | Docker |
| Orchestration | Kubernetes (Minikube) |
| CI/CD | GitHub Actions |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 🚀 Task 1 — Run Locally (MERN)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Visit **http://localhost:5173**

### API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/projects` | Yes | List my projects |
| POST | `/api/projects` | Yes | Create project |
| GET | `/api/projects/:id` | Yes | Get project |
| PUT | `/api/projects/:id` | Yes | Update project |
| DELETE | `/api/projects/:id` | Yes | Delete project |
| GET | `/api/tasks` | Yes | List tasks |
| POST | `/api/tasks` | Yes | Create task |
| GET | `/api/tasks/:id` | Yes | Get task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

---

## 🐳 Task 2 — Docker

### Build & Run with Docker Compose

```bash
# Copy and fill environment (JWT_SECRET is the main one to set)
export JWT_SECRET="your_strong_secret_here"

# Start all services (MongoDB + Backend + Frontend)
docker compose up --build

# Run in background
docker compose up -d --build

# Stop everything
docker compose down

# Stop and remove volumes (wipe data)
docker compose down -v
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017 |

### Docker Volumes

Three named volumes provide persistent storage:

| Volume | Purpose |
|---|---|
| `team-pm-mongo-data` | MongoDB data files |
| `team-pm-mongo-config` | MongoDB config |
| `team-pm-backend-logs` | Backend log files |

```bash
# Inspect volumes
docker volume ls
docker volume inspect team-pm-mongo-data
```

### Build Images Individually

```bash
# Backend
docker build -t team-pm-backend ./backend

# Frontend
docker build -t team-pm-frontend ./frontend
```

---

## ☸️ Task 3 — Kubernetes (Minikube)

### Prerequisites

```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl
```

### Deploy Steps

```bash
# Start Minikube
minikube start

# 1. Create namespace
kubectl apply -f k8s/namespace-and-secrets.yaml

# 2. Edit secrets FIRST — add your real MongoDB URI
kubectl edit secret team-pm-secrets -n team-pm

# 3. Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# 4. Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# 5. Check status
kubectl get all -n team-pm

# 6. Access the frontend
minikube service frontend-service -n team-pm
```

### Kubernetes Concepts Demonstrated

| Concept | Where |
|---|---|
| Deployments | `*-deployment.yaml` |
| Services (ClusterIP + NodePort) | `*-service.yaml` |
| Namespaces | `namespace-and-secrets.yaml` |
| Secrets | `namespace-and-secrets.yaml` |
| Health Probes (liveness + readiness) | Both deployments |
| Rolling Update strategy | Both deployments |
| Resource limits | Both deployments |
| Multiple replicas | replicas: 2 |

---

## ⚙️ Task 4 — CI/CD with GitHub Actions

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** in your repo:

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `RENDER_BACKEND_DEPLOY_HOOK` | Render deploy hook URL |
| `VERCEL_TOKEN` | Vercel CLI token |
| `VERCEL_ORG_ID` | From `vercel link` |
| `VERCEL_PROJECT_ID` | From `vercel link` |
| `VITE_API_URL` | Render backend URL + `/api` |

### Pipeline Flow

```
push to main
     │
     ▼
┌─────────────┐
│  Test job   │  npm ci + lint
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Build & Push     │  Docker images → Docker Hub
│ (backend+front)  │  Tagged: latest + git SHA
└──────┬───────────┘
       │
   ┌───┴───┐
   ▼       ▼
Render   Vercel
deploy   deploy
```

### Deployment Platforms (Free Tier)

**Backend → Render**
1. Create a new Web Service at https://render.com
2. Connect your GitHub repo, set root to `backend`
3. Set environment variables in Render dashboard
4. Copy the **Deploy Hook URL** into GitHub secrets

**Frontend → Vercel**
1. Run `vercel login && vercel link` locally in `frontend/`
2. Copy the generated `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
3. Set `VERCEL_TOKEN` from https://vercel.com/account/tokens

---

## 🌟 Features

- ✅ User Registration & Login (JWT auth)
- ✅ Create / Edit / Delete Projects with status tracking
- ✅ Kanban board per project (To Do → In Progress → Review → Done)
- ✅ Task priority levels (Low / Medium / High)
- ✅ My Tasks view with status filter
- ✅ Dashboard with stats overview
- ✅ Error handling & loading states throughout
- ✅ Responsive UI with Tailwind CSS
- ✅ Role-based user model (admin / member)

---

## 📋 Environment Variables Reference

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/team-pm
JWT_SECRET=your_very_strong_secret_key
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Evaluation Checklist

| Criteria | Status |
|---|---|
| MERN Application Functionality (30%) | ✅ Full CRUD, Auth, Dashboard |
| Docker & Volumes (20%) | ✅ Multi-stage Dockerfiles, Compose, 3 volumes |
| Kubernetes Deployment (20%) | ✅ Deployments, Services, Secrets, Probes |
| CI/CD Automation (20%) | ✅ GitHub Actions → Docker Hub → Render + Vercel |
| Code Structure & Best Practices (10%) | ✅ MVC, modular, env vars, error handling |
