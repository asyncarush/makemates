# Authentication System

This document explains the authentication and authorization system implemented at the layout level.

## Overview

Authentication checking is now handled centrally at the layout level through the `Providers` component, eliminating the need to implement authentication checks on individual pages.

## How It Works

### 1. Centralized Authentication Checking

The `Providers` component (`frontend/app/components/Providers.tsx`) handles all authentication logic:

- **Route Protection**: Automatically redirects unauthenticated users away from protected routes
- **Public Route Handling**: Redirects authenticated users away from login/register pages
- **Loading States**: Shows loading spinner while checking authentication status

### 2. Protected Routes

The following routes require authentication:

- `/feed`
- `/chat`
- `/profile`
- `/settings`
- `/video-chat`

### 3. Public Routes

The following routes are accessible without authentication:

- `/` (login page)
- `/login`
- `/register`
- `/forgot-password`

## Usage

### For Individual Pages

Most pages don't need any authentication code anymore. However, if you need to access user data or authentication functions:

```tsx
import { useAuth, useUser, useIsAuthenticated } from "@/hooks/useAuth";

export default function MyPage() {
  const { currentUser, userLogout } = useAuth();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={userLogout}>Logout</button>
    </div>
  );
}
```

### For Pages That Need Extra Protection

If a page needs additional authentication checks:

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SensitivePage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>This content is protected</h1>
        {/* Your page content */}
      </div>
    </ProtectedRoute>
  );
}
```

## Authentication Context

The `AuthContext` provides:

- `currentUser`: Current user object
- `setCurrentUser`: Function to update current user
- `userLogin`: Login function
- `userSignUp`: Registration function
- `userLogout`: Logout function

## Storage

Authentication data is stored in localStorage:

- `currentUser`: User object
- `auth_token`: Authentication token

## Error Handling

The system includes comprehensive error handling:

- Invalid/corrupted localStorage data
- Network errors during authentication
- Automatic cleanup of invalid data

## Benefits

1. **Centralized Logic**: All authentication logic is in one place
2. **Automatic Protection**: Routes are protected without manual implementation
3. **Better UX**: Loading states and smooth redirects
4. **Maintainable**: Easy to modify authentication behavior globally
5. **Type Safe**: Full TypeScript support with proper error handling
