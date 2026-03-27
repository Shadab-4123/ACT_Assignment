# Full Stack Web Application (MVP + JWT)

Simple full stack application with React frontend and Node/Express + MongoDB backend.

## Features

- User registration with validation
- Login with validation (email format + password required)
- JWT-based authentication
- Protected dashboard route
- Logout functionality
- Dashboard CRUD for leads/tasks/users records
- Backend API integration from frontend
- MongoDB user credential validation

## Project Structure

```text
client/
  src/components/Login.jsx
  src/components/Register.jsx
  src/components/Dashboard.jsx
  src/components/ProtectedRoute.jsx
  src/services/api.js
server/
  models/User.js
  models/DashboardItem.js
  controllers/authController.js
  routes/auth.js
  middleware/authMiddleware.js
```

## Setup

### 1) Backend

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 2) Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Demo Credentials

- Email: `demo@example.com`
- Password: `Password123!`

## API Endpoints

- `POST /api/register` - register a new user and return JWT
- `POST /api/login` - authenticate user and return JWT
- `GET /api/dashboard` - protected dashboard data with items and stats
- `POST /api/dashboard/items` - create dashboard record
- `PUT /api/dashboard/items/:id` - update dashboard record
- `DELETE /api/dashboard/items/:id` - delete dashboard record
