# Support Desk – Backend

A backend application for a Support Desk / Ticket Management System built using Node.js, Express, TypeScript, and MongoDB.

The project is being developed to demonstrate practical backend engineering concepts, including authentication, database integration, middleware, API development, and scalable application architecture.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | Backend framework |
| TypeScript | Type-safe development |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |
| bcryptjs | Password hashing |
| CORS | Cross-origin resource sharing |
| dotenv | Environment configuration |

## Current Features

- Express server configuration
- TypeScript backend setup
- MongoDB integration using Mongoose
- JWT-based authentication foundation
- Password hashing using bcryptjs
- Authentication route registration
- Authentication middleware
- Health-check API
- Environment variable configuration

## Project Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   └── database.ts
│   │
│   ├── controllers/
│   │   └── auth.controller.ts
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts
│   │
│   ├── models/
│   │   └── User.ts
│   │
│   ├── routes/
│   │   └── auth.route.ts
│   │
│   ├── utils/
│   │   └── jwt.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Abhishikth12345/support-desk.git
```

### 2. Navigate to the backend

```bash
cd support-desk/backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the backend root directory.

Configure your MongoDB connection string, JWT secret, and server port according to the variables expected by the application.

Never commit your actual `.env` file or expose database credentials.

### 5. Start the development server

```bash
npm run dev
```

### 6. Build the application

```bash
npm run build
```

### 7. Start the production build

```bash
npm start
```

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API and database connection status |

### Authentication

Base route:

`/api/auth`

Authentication endpoints are being developed.

## Development Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with automatic restart |
| `npm run build` | Compile TypeScript |
| `npm start` | Start compiled application |
| `npm test` | Tests not configured yet |

## Security Practices

- Password hashing using bcryptjs.
- JWT-based authentication.
- Environment variables for sensitive configuration.
- CORS configuration.
- Authentication middleware for protected routes.
- Database credentials are not committed to GitHub.

## Planned Enhancements

- Complete authentication and authorization.
- User roles and role-based access control.
- Support ticket creation and management.
- Ticket assignment and status tracking.
- Ticket priorities and categories.
- Pagination, filtering, and search.
- Request validation and centralized error handling.
- Unit and integration testing.
- API documentation.
- Logging and monitoring.
- Docker and cloud deployment.

## Learning Objectives

This project is also being developed as a practical backend engineering learning project, focusing on:

- REST API architecture.
- Middleware and request lifecycle.
- Authentication and authorization.
- Database modeling and relationships.
- Error handling and validation.
- Clean code and modular architecture.
- Testing and deployment.

---

**Project:** Support Desk  
**Repository:** [GitHub – Support Desk](https://github.com/Abhishikth12345/support-desk)  
**Status:** In Development