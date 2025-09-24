# YOUTH Authentication System - Technical Specification for Mobile

## Metadata
- **Generated**: 2025-09-10
- **Target Platform**: React Native / Expo SDK 50+
- **User Role**: YOUTH (JOVENES) - This document is EXCLUSIVELY for YOUTH role authentication
- **Purpose**: Exact replication of web login functionality for YOUTH users only

## 1. LOGIN FORM STRUCTURE

### Form Fields
The login form contains exactly 2 fields:

1. **Username Field**
   - Field name: `username`
   - Type: text input
   - Placeholder: "Enter your username"
   - Validation: Required, minimum 3 characters
   - Error message: "El usuario debe tener al menos 3 caracteres"

2. **Password Field**
   - Field name: `password`
   - Type: password input (masked)
   - Placeholder: "Enter your password"
   - Validation: Required (no minimum length)
   - Error message: "Por favor ingresa tu contraseña"

### Form UI Elements
- **Title**: "Login"
- **Subtitle**: "Enter your email and password below to log into your account."
- **Submit Button**: "Sign In" (shows spinner when loading)
- **Links**: 
  - "Don't have an account?" → /sign-up
  - "Sign in with a magic link" → /magic-link
  - Terms of Service → /terms
  - Privacy Policy → /privacy

## 2. API ENDPOINT SPECIFICATION

### Login Endpoint
**POST /api/auth/login**

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Success Response for YOUTH (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "JOVENES",
    "type": "JOVENES"
  },
  "role": "JOVENES",
  "type": "JOVENES",
  "municipality": null,
  "company": null
}
```

**Error Response (401):**
```json
{
  "error": "Invalid username or password. Please check your credentials."
}
```

### Session Validation Endpoint (YOUTH)
**GET /api/auth/me**

**Headers:** Cookies are automatically included by browser

**Success Response for YOUTH (200):**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "role": "JOVENES",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "profilePicture": null,
    "isActive": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Response (401):**
```json
{
  "error": "No authentication token found"
}
```

### Logout Endpoint
**POST /api/auth/logout**

**Request:** No body required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 3. YOUTH AUTHENTICATION FLOW

### Login Process (YOUTH Users Only)
1. **User Input**: Youth user enters username and password
2. **Client Validation**: 
   - Username: minimum 3 characters
   - Password: not empty
3. **API Call**: POST to `/api/auth/login`
4. **Server Processing**:
   - Check database for user with role JOVENES
   - Verify password with bcrypt
   - Generate JWT token with role: "JOVENES"
   - Set HTTP-only cookie
5. **Success Response**: 
   - User data returned with role: "JOVENES"
   - Cookie set: `cemse-auth-token`
6. **Client Actions**:
   - Verify role is "JOVENES"
   - Store user in React state
   - Show success toast: "You have been successfully signed in."
   - Redirect to YOUTH dashboard (/dashboard)

### Error Handling
- **Invalid credentials**: Show toast "Your sign in request failed. Please try again."
- **Non-YOUTH role**: Reject login for mobile app (YOUTH-only app)
- **Network error**: Same error message
- **Validation errors**: Show inline under fields

## 4. TOKEN MANAGEMENT FOR YOUTH

### Cookie Configuration (Web)
- **Name**: `cemse-auth-token`
- **Type**: HTTP-only cookie
- **Expiry**: 24 hours
- **Properties**:
  - httpOnly: true
  - secure: true (production only)
  - sameSite: 'lax'
  - path: '/'

### JWT Token Structure (YOUTH)
```typescript
{
  id: string;      // Youth user ID
  username: string;
  role: "JOVENES"; // Always JOVENES for youth users
  type: "JOVENES";
  iat: number;     // Issued at
  exp: number;     // Expiration (24 hours)
}
```

## 5. STATE MANAGEMENT FOR YOUTH

### Auth Context Structure
```typescript
interface AuthContextType {
  user: YouthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}
```

### Youth User Object Structure
```typescript
interface YouthUser {
  id: string;
  username: string;
  role: "JOVENES";  // Always JOVENES for youth
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 6. MOBILE IMPLEMENTATION FOR YOUTH APP

### React Native Form Implementation (YOUTH-Only)
```typescript
// Login form for YOUTH users
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);

// Validation
const validateForm = () => {
  if (username.length < 3) {
    Alert.alert('Error', 'El usuario debe tener al menos 3 caracteres');
    return false;
  }
  if (!password) {
    Alert.alert('Error', 'Por favor ingresa tu contraseña');
    return false;
  }
  return true;
};

// Login function for YOUTH
const handleLogin = async () => {
  if (!validateForm()) return;
  
  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Verify user is YOUTH role
      if (data.user.role !== 'JOVENES') {
        Alert.alert('Error', 'This app is for youth users only');
        return;
      }
      
      // Store token in SecureStore (mobile equivalent of cookies)
      await SecureStore.setItemAsync('cemse-auth-token', data.token);
      
      // Store youth user data
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      
      // Navigate to YOUTH dashboard
      navigation.replace('YouthDashboard');
    } else {
      Alert.alert('Error', 'Your sign in request failed. Please try again.');
    }
  } catch (error) {
    Alert.alert('Error', 'Your sign in request failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Token Storage for YOUTH Mobile App
```typescript
import * as SecureStore from 'expo-secure-store';

// Store token after YOUTH login
await SecureStore.setItemAsync('cemse-auth-token', token);

// Retrieve token for API calls
const token = await SecureStore.getItemAsync('cemse-auth-token');

// Add token to API requests for YOUTH endpoints
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// Clear on logout
await SecureStore.deleteItemAsync('cemse-auth-token');
await SecureStore.deleteItemAsync('user');
```

### Session Validation for YOUTH
```typescript
// Check YOUTH session on app start
const checkYouthSession = async () => {
  const token = await SecureStore.getItemAsync('cemse-auth-token');
  
  if (!token) {
    navigation.replace('Login');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Verify user is YOUTH
      if (data.user.role === 'JOVENES') {
        setUser(data.user);
      } else {
        // Not a youth user, clear and redirect
        await SecureStore.deleteItemAsync('cemse-auth-token');
        navigation.replace('Login');
      }
    } else {
      // Token invalid/expired
      await SecureStore.deleteItemAsync('cemse-auth-token');
      navigation.replace('Login');
    }
  } catch (error) {
    // Handle offline or network error
    console.error('Session check failed:', error);
  }
};
```

## 7. YOUTH-SPECIFIC SECURITY

### Role Validation
- **Always verify** role === "JOVENES" after login
- **Reject** any non-YOUTH users in mobile app
- **Clear storage** if wrong role detected

### Password Handling for YOUTH
- Passwords are sent as plain text over HTTPS
- Server hashes with bcrypt (12 salt rounds)
- Never store youth passwords locally

### Token Security for YOUTH
- Use SecureStore on mobile (encrypted storage)
- Never store in AsyncStorage or plain storage
- Include in Authorization header for YOUTH API calls
- Clear on logout

## 8. YOUTH DASHBOARD REDIRECT

After successful YOUTH login:
- **Web**: Redirect to `/dashboard`
- **Mobile**: Navigate to `YouthDashboard` screen

YOUTH-specific dashboard features accessible after login:
- My Courses
- Job Offers
- My Applications
- CV Builder
- Profile
- Resources

## 9. TESTING CHECKLIST FOR YOUTH LOGIN

### YOUTH Login Tests
- [ ] Valid YOUTH credentials → Success, redirect to youth dashboard
- [ ] Non-YOUTH credentials → Reject with appropriate message
- [ ] Invalid username → Error toast
- [ ] Invalid password → Error toast
- [ ] Username < 3 chars → Validation error
- [ ] Empty password → Validation error
- [ ] Network error → Error toast

### YOUTH Session Tests
- [ ] Valid YOUTH token → User data retrieved
- [ ] Non-YOUTH token → Reject and clear
- [ ] Expired token → Redirect to login
- [ ] No token → Redirect to login
- [ ] App restart → YOUTH session persists if valid

### YOUTH Logout Tests
- [ ] Logout → Token cleared, redirect to login
- [ ] API fails → Still clear local data

---

**Document Status**: ✅ Verified against actual codebase - YOUTH ROLE ONLY
**Scope**: This document covers ONLY authentication for YOUTH (JOVENES) users
**Last Updated**: 2025-09-10
**Verified Files**: 
- src/app/(auth)/sign-in/page.tsx
- src/components/auth/sign-in/components/user-auth-form.tsx
- src/app/api/auth/login/route.ts
- src/hooks/use-auth.tsx