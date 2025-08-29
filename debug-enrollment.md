# Course Enrollment 404 Error - Debug Guide

## Problem
Getting `POST http://localhost:3000/api/course-enrollments 404 (Not Found)` when trying to enroll in courses.

## Root Cause Analysis

### 1. Authentication Flow Issue
The API endpoint `/api/course-enrollments` exists but requires JWT authentication:
- **Expected**: Bearer JWT token in Authorization header
- **Current**: Token retrieval from `/api/auth/get-token` may be failing

### 2. Token Requirements
- API expects: `Authorization: Bearer <jwt-token>`
- Cookie format: `cemse-auth-token` with valid JWT (3 parts: header.payload.signature)

## Debugging Steps

### Step 1: Check Authentication Status
Open browser console and run:
```javascript
// Check if auth cookie exists
console.log('All cookies:', document.cookie);

// Test token endpoint
fetch('/api/auth/get-token', { credentials: 'include' })
  .then(res => res.json())
  .then(data => console.log('Token response:', data))
  .catch(err => console.error('Token error:', err));
```

### Step 2: Test Course Enrollment API Directly
```javascript
// Test enrollment with proper auth
fetch('/api/auth/get-token', { credentials: 'include' })
  .then(res => res.json())
  .then(tokenData => {
    if (tokenData.token) {
      return fetch('/api/course-enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`
        },
        credentials: 'include',
        body: JSON.stringify({ courseId: 'your-course-id' })
      });
    }
    throw new Error('No token available');
  })
  .then(res => res.json())
  .then(data => console.log('Enrollment response:', data))
  .catch(err => console.error('Enrollment error:', err));
```

## Quick Fixes

### Option 1: Ensure User is Logged In
- Check if user is properly authenticated
- Verify `cemse-auth-token` cookie exists and contains valid JWT

### Option 2: Check Cookie Settings
- Ensure cookies are set with correct domain/path
- Check if httpOnly settings allow client access

### Option 3: Test Authentication Endpoint
- Verify `/api/auth/get-token` returns valid JWT
- Check server logs for authentication errors

## Expected Resolution
Once authentication is properly established, the enrollment should work correctly.