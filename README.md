# Roll and Charge Fleet Manager Portal

A modern, scalable electric vehicle fleet management system built with a separated frontend and backend architecture.

## 🏗️ Architecture

This project has been restructured into a clean separation of concerns:

### Frontend (React + Vite)
- **Location**: `./frontend/`
- **Technology**: React 18, Vite, TailwindCSS, Radix UI
- **Purpose**: User interface and client-side logic

### Backend (Node.js + Express)
- **Location**: `./backend/` directory  
- **Technology**: Node.js, Express, External SDK
- **Purpose**: API server, business logic, external service integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose (for containerized deployment)
- External service account and API credentials (if using external integrations)

### 1. Environment Setup

Copy environment files and configure them:
```bash
# Frontend environment
cp .env.example .env

# Backend environment  
cp backend/.env.example backend/.env
```

Edit the environment files with your external service credentials and configuration.

### 2. Development Setup

#### Option A: Local Development (Recommended for development)
```bash
# Setup local environment
./deploy_template.sh local

# Start backend (in one terminal)
cd backend
npm run dev

# Start frontend (in another terminal)  
npm run dev
```

#### Option B: Docker Development
```bash
# Start development environment with Docker
./deploy_template.sh dev
```

#### Option C: Production Docker
```bash
# Deploy production environment
./deploy_template.sh prod
```

## 📁 Project Structure

```
Fleetmanagerapp/
├── backend/                 # Backend API Server (Node + Express)
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic & integrations
│   │   ├── models/         # Mongoose models
│   │   ├── utils/          # Helpers
│   │   ├── app.js          # Express application
│   │   └── server.js       # Server bootstrap
│   ├── scripts/            # Local tooling & smoke tests
│   ├── package.json        # Backend dependencies & scripts
│   ├── Dockerfile          # Backend container config
│   └── .env.example        # Backend environment template
├── frontend/               # Frontend React Application (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── main.jsx
│   ├── package.json        # Frontend dependencies & scripts
│   ├── vite.config.js      # Vite config
│   └── tailwind.config.js  # Tailwind config
├── .env.example            # Frontend env template (optional)
├── README.md               # Monorepo guide (this file)
└── deploy_template.sh      # Deployment script (optional)
```

> Note: We intentionally removed legacy duplicate sources and archived copies to keep the repository clean. Only `backend/` and `frontend/` contain live code.

## 🧪 Local Development (Monorepo)

Open two terminals and run each app independently.

### Backend

```powershell
cd backend
npm install
copy .env.example .env   # then edit values
npm run dev              # starts at http://localhost:5000
```

### Frontend

```powershell
cd frontend
npm install
# Configure Vite env (create .env if not present)
echo VITE_API_URL=http://localhost:5000/api > .env
echo VITE_API_VERSION=v1 >> .env
echo VITE_NODE_ENV=development >> .env
npm run dev -- --port 5173    # http://localhost:5173
```

Ensure CORS on the backend allows your chosen frontend port. The backend already enables 3000, 3001, and 5173.

## 🔐 Environment Configuration

## 🔌 API Endpoints

### Authentication
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Vehicles
- `GET /api/v1/vehicles` - List vehicles (requires `fleet_id` query param)
- `GET /api/v1/vehicles/:id` - Get specific vehicle
- `POST /api/v1/vehicles` - Create vehicle
- `PUT /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle

### Service Requests
- `GET /api/v1/service-requests` - List service requests (requires `fleet_id` query param)
- `GET /api/v1/service-requests/:id` - Get specific service request
- `POST /api/v1/service-requests` - Create service request
- `PUT /api/v1/service-requests/:id` - Update service request
- `POST /api/v1/service-requests/:id/assign` - Assign technician
- `POST /api/v1/service-requests/:id/complete` - Complete service request
- `DELETE /api/v1/service-requests/:id` - Delete service request

### Technicians
- `GET /api/v1/technicians` - List all technicians
- `GET /api/v1/technicians/available` - List available technicians
- `GET /api/v1/technicians/:id` - Get specific technician
- `POST /api/v1/technicians` - Create technician
- `PUT /api/v1/technicians/:id` - Update technician
- `DELETE /api/v1/technicians/:id` - Delete technician

## 🔧 Configuration

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_VERSION=v1
VITE_NODE_ENV=development
```

### Backend Environment Variables
```env
PORT=5000
NODE_ENV=development
EXTERNAL_APP_ID=your_app_id_here
EXTERNAL_BACKEND_URL=your_backend_url_here
EXTERNAL_ACCESS_TOKEN=your_access_token_here
EXTERNAL_FUNCTIONS_VERSION=v1
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
```

## 🚀 Deployment Guide (End-to-End)

You can deploy the backend and frontend separately. Below are three reliable options.

### Option A: Docker (Recommended)

Build and run each service in its own container.

Backend:
```powershell
cd backend
docker build -t fleet-backend:latest .
docker run -d -p 5000:5000 --env-file .env --name fleet-backend fleet-backend:latest
```

Frontend (static build served by a minimal Node adapter or any static host):
```powershell
cd frontend
npm ci
npm run build         # outputs to dist/
# Serve with a static server (example using npm package 'serve')
npm i -g serve
serve -s dist -l 5173
```

Optional: Compose both together. Create a `docker-compose.yml` at the repo root:

```yaml
version: "3.9"
services:
	api:
		build: ./backend
		container_name: fleet-backend
		env_file: ./backend/.env
		ports:
			- "5000:5000"
	web:
		build:
			context: ./frontend
			dockerfile: Dockerfile
		container_name: fleet-frontend
		ports:
			- "5173:5173"
		depends_on:
			- api
```

Then run:

```powershell
docker compose up -d --build
```

### Option B: Traditional VM/Server

Backend:
```bash
cd backend
npm ci
pm2 start src/server.js --name fleet-backend
```

Frontend:
```bash
cd frontend
npm ci
npm run build
# Copy dist/ to your web server (Nginx/Apache/S3+CloudFront/etc.)
```

Nginx example for serving the frontend and proxying API:

```nginx
server {
	listen 80;
	server_name yourdomain.com;

	location /api/ {
		proxy_pass http://localhost:5000/api/;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
	}

	location / {
		root /var/www/fleet-frontend;  # path to dist/
		try_files $uri /index.html;
	}
}
```

### Option C: Managed Platforms

- Backend: Render/Heroku/Fly.io (Node service).
- Frontend: Vercel/Netlify/Cloudflare Pages (static site).

Configure the frontend environment `VITE_API_URL` to point to the deployed backend URL.

## 🧹 Repository Hygiene & Maintenance

- Keep live code only under `backend/` and `frontend/`.
- Prefer feature branches and Pull Requests; protect `main`.
- Use semantic commit messages (feat:, fix:, chore:, docs:).
- Add `.env.example` files and never commit real secrets.
- Run `npm ci` in CI for reproducible installs.
- Consider npm workspaces for shared tooling:

```json
{
	"name": "fleetmanagerapp",
	"private": true,
	"workspaces": ["backend", "frontend"]
}
```

- Optional CI (GitHub Actions) skeleton:

```yaml
name: CI
on: [push, pull_request]
jobs:
	backend:
		runs-on: ubuntu-latest
		defaults:
			run:
				working-directory: backend
		steps:
			- uses: actions/checkout@v4
			- uses: actions/setup-node@v4
				with:
					node-version: 18
			- run: npm ci
			- run: npm run lint --if-present
			- run: npm test --if-present

	frontend:
		runs-on: ubuntu-latest
		defaults:
			run:
				working-directory: frontend
		steps:
			- uses: actions/checkout@v4
			- uses: actions/setup-node@v4
				with:
					node-version: 18
			- run: npm ci
			- run: npm run build
```

## ✅ Summary

- Repository is now a clean monorepo with `backend/` and `frontend/` only.
- Legacy duplicates removed to simplify deployment.
- Use the guides above to run locally or deploy via Docker/VM/managed hosts.

## 🐳 Docker Deployment

### Production
```bash
docker-compose up -d
```

### Development
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 🔄 Migration from Original Structure

The application has been migrated from a direct external SDK integration to a backend API architecture:

1. **API Layer**: Direct external SDK calls moved to backend controllers
2. **Compatibility**: Frontend maintains the same API interface through a compatibility layer
3. **Separation**: Clean separation between frontend UI logic and backend business logic
4. **Scalability**: Backend can now be scaled independently and support multiple frontends

## 🛠️ Development

### Adding New Features
1. **Backend**: Add routes in `backend/src/routes/`, controllers in `backend/src/controllers/`
2. **Frontend**: Add API calls in `src/api/`, components in `src/components/`

### Testing
```bash
# Backend tests (when implemented)
cd backend && npm test

# Frontend tests (when implemented)  
npm test
```

### Code Quality
```bash
# Lint frontend
npm run lint

# Format code (if prettier is configured)
npm run format
```

## 🚀 Deployment

The system supports multiple deployment strategies:

1. **Docker Production**: Full containerized deployment
2. **Docker Development**: Development with hot reload
3. **Local Development**: Direct Node.js execution

Choose based on your environment needs and use the `deploy_template.sh` script accordingly.

## 📝 API Documentation

Full API documentation is available at `http://localhost:5000/api/v1/health` when running the backend server.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
