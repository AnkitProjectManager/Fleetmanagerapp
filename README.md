# Roll and Charge Fleet Manager Portal

A modern, scalable electric vehicle fleet management system built with a separated frontend and backend architecture.

## 🏗️ Architecture

This project has been restructured into a clean separation of concerns:

### Frontend (React + Vite)
- **Location**: Root directory
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
roll-charge-fleet-manager/
├── backend/                 # Backend API Server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic & external service integration
│   │   └── app.js         # Express application
│   ├── package.json       # Backend dependencies
│   ├── Dockerfile         # Backend container config
│   └── .env.example       # Backend environment template
├── src/                    # Frontend React Application
│   ├── api/               # API client & services
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── lib/              # Utility libraries
│   └── ...
├── docker-compose.yml     # Production container orchestration
├── docker-compose.dev.yml # Development container orchestration
├── package.json          # Frontend dependencies
├── Dockerfile            # Frontend container config
└── deploy_template.sh    # Deployment script
```

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
VITE_API_URL=http://localhost:5000/api/v1
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
