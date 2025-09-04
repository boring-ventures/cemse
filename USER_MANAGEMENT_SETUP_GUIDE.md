# User Management System Setup & Testing Guide

## Overview

This guide will help you set up and test the complete user management system for the CEMSE application, including user creation, editing, deletion, and authentication.

## Prerequisites

### 1. Environment Setup

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/cemse_db"
DIRECT_URL="postgresql://username:password@localhost:5432/cemse_db"

# JWT Secret (for authentication)
JWT_SECRET="your-super-secret-jwt-key-here"

# Supabase Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Setup

Ensure your PostgreSQL database is running and accessible. You can use:

- Local PostgreSQL installation
- Docker with the provided `docker-compose.yml`
- Supabase cloud database

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Database Migration

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# (Optional) Seed the database with initial data
pnpm prisma db seed
```

## Testing the System

### 1. Start the Development Server

```bash
pnpm dev
```

### 2. Test Database Connection

Visit: `http://localhost:3000/api/test-db`

Expected response:

```json
{
  "message": "Database connection successful",
  "userCount": 0,
  "profileCount": 0,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Test User Management API

#### Option A: Use the Test Script

```bash
node test-user-management.js
```

#### Option B: Manual Testing with Browser/Postman

**Test User Creation:**

```http
POST http://localhost:3000/api/admin/users
Content-Type: application/json

{
  "username": "testuser1",
  "password": "password123",
  "role": "YOUTH",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@test.com",
  "phone": "+591 700 123 456",
  "department": "Cochabamba",
  "country": "Bolivia"
}
```

**Test User Retrieval:**

```http
GET http://localhost:3000/api/admin/users
```

**Test User Update:**

```http
PUT http://localhost:3000/api/admin/users/{USER_ID}
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "lastName": "Pérez López",
  "email": "juan.carlos.perez@test.com"
}
```

**Test User Deletion:**

```http
DELETE http://localhost:3000/api/admin/users/{USER_ID}
```

### 4. Test the Admin Interface

Navigate to: `http://localhost:3000/admin/users`

## Expected Functionality

### ✅ User Creation

- Creates both User (authentication) and Profile (personal info) records
- Validates required fields (username, password, role, firstName, lastName)
- Checks for duplicate usernames and emails
- Hashes passwords securely with bcrypt
- Uses database transactions for data integrity

### ✅ User Retrieval

- Fetches users with their associated profiles
- Supports filtering by role and search terms
- Returns users ordered by creation date

### ✅ User Updates

- Updates both User and Profile information
- Supports partial updates
- Maintains data consistency

### ✅ User Deletion

- Removes both User and Profile records
- Prevents deletion of superadmin users
- Uses transactions for safe deletion

### ✅ Authentication

- Users can log in with created credentials
- Passwords are properly hashed and verified
- JWT tokens are generated for authenticated sessions

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** "Database connection failed"
**Solution:**

- Check DATABASE_URL in .env file
- Ensure PostgreSQL is running
- Verify database credentials

#### 2. Prisma Schema Errors

**Error:** "Object literal may only specify known properties"
**Solution:**

- Run `pnpm prisma generate` after schema changes
- Check that User-Profile relations are properly defined

#### 3. Authentication Errors

**Error:** "No authentication token found"
**Solution:**

- Authentication is temporarily disabled for testing
- Re-enable by removing the TODO comments in the API routes

#### 4. Port Already in Use

**Error:** "Port 3000 is already in use"
**Solution:**

- Kill the existing process: `npx kill-port 3000`
- Or use a different port: `pnpm dev --port 3001`

## Security Notes

⚠️ **Important:** The current implementation has authentication temporarily disabled for testing purposes. Before deploying to production:

1. Re-enable authentication in all API routes
2. Set a strong JWT_SECRET
3. Implement proper role-based access control
4. Add rate limiting and input validation
5. Enable HTTPS in production

## Next Steps

After successful testing:

1. **Re-enable Authentication:** Remove the TODO comments and re-implement JWT validation
2. **Add Role-Based Access Control:** Ensure only admin users can access user management
3. **Implement Audit Logging:** Track all user management actions
4. **Add Data Validation:** Implement comprehensive input validation
5. **Performance Optimization:** Add pagination for large user lists
6. **Testing:** Add unit tests and integration tests

## Support

If you encounter issues:

1. Check the browser console for client-side errors
2. Check the terminal for server-side errors
3. Verify database connectivity
4. Ensure all environment variables are set correctly

