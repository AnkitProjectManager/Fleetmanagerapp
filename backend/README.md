# Roll and Charge Fleet Manager Portal - Backend

A comprehensive REST API for managing electric vehicle fleets.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 🚗 **Vehicle Management**: Complete CRUD operations for fleet vehicles
- 🔧 **Service Management**: Track maintenance and service requests
- 👥 **User Management**: Admin, fleet manager, and technician roles
- 📊 **Analytics**: Fleet performance and usage statistics
- 🛡️ **Security**: Rate limiting, CORS, helmet security headers
- 📝 **Validation**: Comprehensive input validation and error handling
- 📄 **Logging**: Structured logging with Winston

## Quick Start

1. **Install Dependencies**:
```bash
npm install
```

2. **Environment Setup**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Development Server**:
```bash
npm run dev
```

4. **Start Production Server**:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/logout` - User logout

### Vehicles
- `GET /api/v1/vehicles` - List vehicles
- `POST /api/v1/vehicles` - Create vehicle
- `GET /api/v1/vehicles/:id` - Get vehicle details
- `PUT /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle
- `GET /api/v1/vehicles/:id/service-history` - Get service history

### Service Requests (Coming Soon)
- `GET /api/v1/service-requests` - List service requests
- `POST /api/v1/service-requests` - Create service request
- `GET /api/v1/service-requests/:id` - Get service request details
- `PUT /api/v1/service-requests/:id` - Update service request
- `DELETE /api/v1/service-requests/:id` - Delete service request

### Technicians (Coming Soon)
- `GET /api/v1/technicians` - List technicians
- `POST /api/v1/technicians` - Create technician
- `GET /api/v1/technicians/:id` - Get technician details
- `PUT /api/v1/technicians/:id` - Update technician
- `DELETE /api/v1/technicians/:id` - Delete technician

## Default Users

The system initializes with these default users:

**Admin User**:
- Email: admin@rollcharge.com
- Password: admin123
- Role: admin

**Fleet Manager**:
- Email: manager@rollcharge.com
- Password: manager123
- Role: fleet_manager

## Configuration

Key environment variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Database (currently using in-memory storage)
DATABASE_TYPE=memory
```

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

Visit `/api/health` for API status and health check.

Full API documentation available at: `http://localhost:5000/api/health`

## Architecture

- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **compression** - Response compression
- **morgan** - HTTP request logger

## License

MIT License