# AgileChef Development Guide

## Development Environment Setup

### Required Tools
- VS Code or Cursor IDE
- Node.js 18+
- PostgreSQL 14+
- pnpm package manager
- Git

### Recommended VS Code Extensions
- ESLint
- Prettier
- Prisma
- GitLens
- Tailwind CSS IntelliSense

## Project Structure

```
agilechef/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and constants
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   └── types/        # TypeScript type definitions
│   └── public/           # Static assets
├── backend/              # Express backend application
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API route definitions
│   │   └── utils/        # Utility functions
│   └── prisma/          # Database schema and migrations
├── docs/                # Documentation
└── scripts/             # Development and deployment scripts
```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `release/*` - Release preparation

### Commit Messages
Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write unit tests for new features
- Document complex functions and components
- Use meaningful variable and function names

## Database Management

### Prisma Workflow
1. Edit schema in `backend/prisma/schema.prisma`
2. Generate migration:
   ```bash
   cd backend
   pnpm prisma migrate dev --name description_of_changes
   ```
3. Apply migration:
   ```bash
   pnpm prisma migrate deploy
   ```

### Data Seeding
- Seed data is in `backend/prisma/seed.ts`
- Run seeding:
  ```bash
  pnpm prisma db seed
  ```

## Testing

### Frontend Testing
```bash
cd frontend
pnpm test
```

### Backend Testing
```bash
cd backend
pnpm test
```

## Deployment

### Production Build
```bash
# Build frontend
cd frontend
pnpm build

# Build backend
cd ../backend
pnpm build
```

### Environment Variables
Required environment variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `PORT`

## Troubleshooting

### Common Issues
1. Database connection errors
   - Check PostgreSQL service is running
   - Verify database credentials
   - Ensure database exists

2. Build errors
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify dependencies are up to date

### Getting Help
1. Check existing documentation
2. Search issue tracker
3. Ask in team chat
4. Create new issue with details 