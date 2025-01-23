# Development Documentation

## Syncing Clerk Users with Database

If you need to sync existing Clerk users with the database (for example, after a database reset or when setting up a new environment), follow these steps:

1. Ensure your environment variables are set up correctly in `backend/.env`:
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL` (points to your PostgreSQL database)

2. Run the import script:
   ```bash
   cd backend
   npm run import-users
   ```

The script will:
- Fetch all users from Clerk
- Create or update corresponding records in the PostgreSQL database
- Use Clerk IDs as the primary identifiers
- Sync email, name, and profile image information

### Troubleshooting

- If you have multiple instances of Prisma Studio running, you can check the ports with:
  ```bash
  lsof -i :5555
  lsof -i :5556
  ```
  Kill any unnecessary instances with:
  ```bash
  kill -9 <PID>
  ```

- To verify the sync worked:
  1. Start Prisma Studio: `npx prisma studio`
  2. Navigate to http://localhost:5555 (or the port shown in the console)
  3. Check the User table for the imported records

### Notes

- The sync is one-way (Clerk → Database)
- New users are automatically synced via webhooks during signup
- This script is mainly needed for:
  - Initial setup
  - Database resets
  - Recovering from sync issues 