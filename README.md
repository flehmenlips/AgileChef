# AgileChef - Modern Recipe Management System

A full-stack recipe and kitchen management application designed for professional chefs and home cooks.

## Features

- 📝 Recipe Management
- 📊 Meal Planning
- 📈 Inventory Tracking
- 🔄 Scaling & Conversion
- 👥 User Management System
- 📱 Responsive Dashboard
- 🔒 Secure Authentication

## Tech Stack

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router
- Chart.js

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Jest

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd agilechef
```

2. Install dependencies:
```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
cd frontend
pnpm install

# Install backend dependencies
cd ../backend
pnpm install
```

3. Set up environment variables:
```bash
# Backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend
cd ../frontend
cp .env.example .env
```

4. Start development servers:
```bash
# Start backend (from root directory)
pnpm run dev:backend

# Start frontend (in another terminal)
pnpm run dev:frontend
```

## Development

For detailed information about the development workflow, server management, and best practices, please see our [Development Guide](DEVELOPMENT.md).

- Frontend runs on: `http://localhost:5173`
- Backend runs on: `http://localhost:3000`

## License

MIT 