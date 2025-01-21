# AgileChef - Modern Recipe Management System

A full-stack recipe and kitchen management application designed for professional chefs and home cooks.

## Features

- 📝 Recipe Management
- 📊 Meal Planning
- 📈 Inventory Tracking
- 🔄 Scaling & Conversion
- 👥 User Management System
- 📱 Responsive Dashboard
- 🔒 Secure Authentication with Clerk

## Tech Stack

### Frontend
- React with TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router
- Clerk Authentication
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
- Clerk Account (for authentication)

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

4. Configure Clerk Authentication:
   - Create a Clerk account and application
   - In Clerk Dashboard, go to API Keys tab
   - Click "Show API URLs" button to get your Backend API URL
   - Update `.env` with your Clerk keys and Backend API URL
   - See [Authentication Guide](AUTHENTICATION.md) for detailed setup

5. Start development servers:
```bash
# Start backend (from root directory)
pnpm run dev:backend

# Start frontend (in another terminal)
pnpm run dev:frontend
```

## Development

For detailed information about the development workflow, server management, and best practices, please see our [Development Guide](DEVELOPMENT.md).

### Important Documentation
- [Authentication Setup](AUTHENTICATION.md) - Complete guide for setting up Clerk authentication
- [Development Guide](DEVELOPMENT.md) - Development workflow and best practices

### Development Servers
- Frontend runs on: `http://localhost:3000`
- Backend runs on: `http://localhost:3000`

## License

MIT 