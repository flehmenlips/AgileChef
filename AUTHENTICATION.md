# Authentication Setup Guide

## Clerk Authentication

This application uses Clerk for authentication. Follow these steps to set up authentication properly.

### 1. Clerk Dashboard Setup

1. Create an account at [Clerk.com](https://clerk.com)
2. Create a new application in the Clerk dashboard
3. Navigate to the API Keys section in your dashboard

### 2. Important Configuration Steps

#### Finding Your API URLs
1. In the Clerk Dashboard, go to the "API Keys" tab
2. Click the "Show API URLs" button
3. You will see two important URLs:
   - Frontend API URL
   - Backend API URL

> **Critical Step**: Make sure to use the Backend API URL provided by Clerk in your frontend `.env` file. This is instance-specific and required for proper authentication.

### 3. Environment Variables Setup

Create or update your `.env` file with the following variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
VITE_CLERK_SECRET_KEY=your_secret_key
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up

# API Configuration - IMPORTANT!
VITE_API_URL=your_clerk_backend_api_url  # Get this from Clerk Dashboard > API Keys > Show API URLs
```

### 4. Additional Configuration

#### Development URLs
Make sure these URLs are added to your Clerk application's allowed URLs:
- `http://localhost:3000`
- `http://localhost:3000/sign-in`
- `http://localhost:3000/sign-up`

#### Production URLs
When deploying to production, add your production URLs to Clerk's allowed URLs list:
- `https://your-domain.com`
- `https://your-domain.com/sign-in`
- `https://your-domain.com/sign-up`

### 5. Troubleshooting

Common issues and their solutions:

1. **Authentication Not Working**
   - Verify you're using the correct Backend API URL from Clerk
   - Check that your environment variables are properly loaded
   - Ensure your allowed URLs are correctly configured

2. **Redirect Issues**
   - Confirm sign-in and sign-up URLs match your environment variables
   - Check for any conflicting route configurations

### 6. Security Best Practices

1. Never commit your `.env` file to version control
2. Use test keys for development and live keys for production
3. Regularly rotate your API keys
4. Implement proper CORS policies
5. Use environment-specific configurations 