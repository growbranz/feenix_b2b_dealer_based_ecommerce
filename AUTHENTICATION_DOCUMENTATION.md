# Authentication & Authorization Documentation

## Overview
Complete production-ready authentication and authorization system for Feenix Repair B2B Marketplace using Supabase Auth, Next.js 15 App Router, and TypeScript.

---

## Authentication Flow

### 1. Login Flow
```
User enters credentials
↓
Client validates with Zod schema
↓
Supabase Auth authenticates user
↓
AuthProvider updates state (user, session, profile)
↓
Middleware checks session and role
↓
Redirect to appropriate dashboard
  - ADMIN → /admin
  - DEALER → /dealer
```

**Implementation**: `app/auth/login/page.tsx`

### 2. Logout Flow
```
User clicks logout
↓
AuthProvider calls authService.logout()
↓
Supabase Auth destroys session
↓
AuthProvider clears state (user, session, profile)
↓
Redirect to /auth/login
```

**Implementation**: `lib/auth/auth.service.ts` → `logout()`

### 3. Forgot Password Flow
```
User enters email
↓
Client validates with Zod schema
↓
Supabase Auth sends reset email
↓
Show success message
↓
User receives email with reset link
↓
User clicks link → /auth/reset-password
```

**Implementation**: `app/auth/forgot-password/page.tsx`

### 4. Reset Password Flow
```
User opens reset link
↓
User enters new password
↓
Client validates with Zod schema
↓
Supabase Auth updates password
↓
Show success message
↓
Redirect to /auth/login
```

**Implementation**: `app/auth/reset-password/page.tsx`

---

## Session Flow

### 1. Session Initialization
```
Application loads
↓
AuthProvider initializes
↓
Supabase Auth gets current session
↓
If session exists:
  - Fetch user profile from database
  - Update AuthProvider state
↓
Listen for auth state changes
```

**Implementation**: `contexts/AuthProvider.tsx`

### 2. Session Refresh
```
Middleware runs on each request
↓
Supabase Auth refreshes session
↓
If session expired:
  - Redirect to /auth/login
↓
Continue to requested route
```

**Implementation**: `middleware.ts`

### 3. Session Persistence
```
Supabase Auth stores session in HTTP-only cookies
↓
Cookies automatically sent with requests
↓
Server-side auth helpers read cookies
↓
Session remains active across page refreshes
```

**Implementation**: `lib/supabase/server.ts` → `createServerClient()`

---

## Middleware Flow

### 1. Route Protection
```
Request received
↓
Middleware executes
↓
Supabase Auth gets session
↓
Check route type:
  - Protected route (/admin, /dealer)
  - Auth route (/auth/*)
  - Public route (/)
```

### 2. Protected Route Logic
```
If protected route AND no session:
  ↓
  Redirect to /auth/login
↓
If protected route AND session exists:
  ↓
  Fetch user profile
  ↓
  Check role-based access
  ↓
  If role mismatch → /unauthorized
  ↓
  Allow access
```

### 3. Auth Route Logic
```
If auth route AND session exists:
  ↓
  Fetch user profile
  ↓
  Redirect based on role:
    - ADMIN → /admin
    - DEALER → /dealer
↓
If auth route AND no session:
  ↓
  Allow access
```

**Implementation**: `middleware.ts`

---

## Role-Based Authorization Flow

### 1. Role Checking
```
User authenticated
↓
Fetch profile from database
↓
Check role field (ADMIN/DEALER)
↓
Apply role-based restrictions
```

### 2. Admin Access Control
```
User attempts to access /admin/*
↓
Middleware checks profile.role === 'ADMIN'
↓
If ADMIN: Allow access
↓
If not ADMIN: Redirect to /unauthorized
```

### 3. Dealer Access Control
```
User attempts to access /dealer/*
↓
Middleware checks profile.role === 'DEALER'
↓
If DEALER: Allow access
↓
If not DEALER: Redirect to /unauthorized
```

### 4. Server-Side Role Helpers
```
requireAuth() - Requires authentication
requireAdmin() - Requires ADMIN role
requireDealer() - Requires DEALER role
hasRole(role) - Checks if user has specific role
```

**Implementation**: `lib/auth/auth.helpers.ts`

---

## Folder Structure

```
lib/
├── auth/
│   ├── auth.types.ts          # TypeScript interfaces
│   ├── auth.service.ts        # Client-side auth functions
│   └── auth.helpers.ts        # Server-side auth helpers
├── validations/
│   └── auth.validation.ts     # Zod validation schemas
├── supabase/
│   ├── client.ts              # Client-side Supabase client
│   ├── server.ts              # Server-side Supabase client
│   └── middleware.ts          # Middleware helper
contexts/
└── AuthProvider.tsx           # React context for auth state
app/
├── auth/
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── forgot-password/
│   │   └── page.tsx          # Forgot password page
│   ├── reset-password/
│   │   └── page.tsx          # Reset password page
│   └── actions.ts            # Server actions for auth
└── layout.tsx                 # Root layout with AuthProvider
middleware.ts                   # Next.js middleware
types/
└── index.ts                   # Database types
```

---

## Files Created

### Authentication Core

**`lib/auth/auth.types.ts`**
- TypeScript interfaces for authentication
- AuthState, LoginCredentials, AuthResponse types
- AuthContextType for React context

**`lib/auth/auth.service.ts`**
- Client-side authentication functions
- login(), logout(), resetPassword(), updatePassword()
- refreshSession(), getCurrentUser()
- Error message translation

**`lib/auth/auth.helpers.ts`**
- Server-side authentication helpers
- getCurrentUser(), getCurrentSession(), getCurrentProfile()
- requireAuth(), requireAdmin(), requireDealer()
- hasRole(), getRoleRedirectPath()
- Client-side helpers

### Validation

**`lib/validations/auth.validation.ts`**
- Zod validation schemas
- loginSchema, forgotPasswordSchema, resetPasswordSchema
- Type-safe form validation

### React Context

**`contexts/AuthProvider.tsx`**
- React context for authentication state
- Manages user, profile, session, loading, error
- Provides login, logout, refresh, resetPassword, updatePassword
- Listens to Supabase auth state changes
- useAuth() hook for consuming context

### Authentication Pages

**`app/auth/login/page.tsx`**
- Login form with email and password
- Form validation with Zod
- Error handling and display
- Role-based redirect after login
- shadcn/ui components (Card, Input, Button, Label)

**`app/auth/forgot-password/page.tsx`**
- Forgot password form with email
- Form validation with Zod
- Success message display
- Link back to login

**`app/auth/reset-password/page.tsx`**
- Reset password form with password confirmation
- Form validation with Zod
- Password strength requirements
- Success message display
- Redirect to login after success

### Server Actions

**`app/auth/actions.ts`**
- Server-side authentication actions
- loginAction(), logoutAction(), resetPasswordAction(), updatePasswordAction()
- getCurrentUserAction(), getCurrentProfileAction()
- Server-side error handling

### Middleware

**`middleware.ts`**
- Route protection logic
- Session refresh
- Role-based access control
- Redirect logic for protected/auth routes
- Profile fetching for role checks

### Root Layout

**`app/layout.tsx`**
- Updated to include AuthProvider
- Wraps entire application with auth context
- Updated metadata

### UI Components

**`components/ui/input.tsx`**
- Reusable input component
- Tailwind CSS styling

**`components/ui/label.tsx`**
- Reusable label component
- Radix UI integration

**`components/ui/card.tsx`**
- Card components (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- shadcn/ui styling

---

## Authentication Features Implemented

### ✅ Login
- Email and password authentication
- Form validation with Zod
- Error handling with user-friendly messages
- Role-based redirect after login
- Loading states

### ✅ Logout
- Session destruction
- State clearing
- Redirect to login

### ✅ Forgot Password
- Email input with validation
- Password reset email via Supabase
- Success message display
- Link to reset page

### ✅ Reset Password
- New password input with validation
- Password confirmation
- Password strength requirements
- Success message display
- Redirect to login

### ✅ Session Management
- Automatic session refresh
- Session persistence via cookies
- Auth state listening
- Client and server session helpers

### ✅ Protected Routes
- Middleware-based route protection
- Automatic redirect to login for unauthenticated users
- Role-based access control

### ✅ Role-Based Access
- ADMIN role restriction to /admin/*
- DEALER role restriction to /dealer/*
- Server-side role helpers
- Unauthorized redirect

### ✅ Middleware Authentication
- Session refresh on each request
- Route type detection
- Profile fetching for role checks
- Redirect logic

### ✅ Server Authentication
- Server-side Supabase client
- Server actions for auth operations
- Protected route helpers (requireAuth, requireAdmin, requireDealer)

### ✅ Client Authentication
- Client-side Supabase client
- AuthProvider for state management
- useAuth hook for consuming auth state
- Real-time auth state updates

### ✅ Form Validation
- Zod schemas for all auth forms
- Client-side validation
- Error display
- Real-time error clearing

### ✅ Error Handling
- User-friendly error messages
- Network error handling
- Session expired handling
- Invalid credentials handling

---

## Code Quality

### TypeScript
- Full type safety across all auth files
- Proper interface definitions
- Type-safe form validation
- Type-safe database queries

### Server Components
- Server-side auth helpers use server components
- Server actions for sensitive operations
- Client components only where necessary (forms)

### SOLID Principles
- Single Responsibility: Each file has one clear purpose
- Open/Closed: Easy to extend without modification
- Liskov Substitution: Proper type hierarchies
- Interface Segregation: Focused interfaces
- Dependency Inversion: Depends on abstractions

### Reusability
- Auth service functions are reusable
- Auth helpers work in any server component
- Validation schemas are reusable
- UI components are reusable

### No Duplicated Code
- Single source of truth for auth logic
- Shared error handling
- Common validation patterns
- Reusable UI components

---

## What Should Be Built in Phase 2.3

### 1. Admin Dashboard
- Admin-specific UI components
- Admin layout with sidebar
- Dashboard overview
- User management
- Dealer management
- Product approval workflow
- Order management
- Reports and analytics

### 2. Dealer Dashboard
- Dealer-specific UI components
- Dealer layout with sidebar
- Dashboard overview
- Product management (CRUD)
- Inventory management
- Order management
- Enquiry management
- Profile management

### 3. Public Website
- Homepage with banners and featured products
- Product catalog
- Product detail pages
- Category browsing
- Brand browsing
- Search functionality
- Contact page

### 4. Additional Auth Features
- Email verification
- Two-factor authentication
- Social login (Google, etc.)
- Remember me functionality
- Session timeout handling
- Account lockout after failed attempts

### 5. API Routes
- REST API endpoints for mobile apps
- API authentication
- Rate limiting
- API documentation

### 6. Real-time Features
- WebSocket integration for real-time updates
- Real-time order status updates
- Real-time chat/messaging
- Real-time notifications

### 7. File Upload
- Product image upload
- Profile image upload
- Document upload
- File storage integration

### 8. Payment Integration
- Razorpay integration completion
- Payment gateway configuration
- Webhook handling
- Refund processing

### 9. Email System
- Transactional emails
- Email templates
- Email notifications
- Email preferences

### 10. Advanced Features
- Advanced search and filtering
- Bulk operations
- Export functionality
- Import functionality
- Audit logging
- Activity tracking

---

## Notes

### Package Dependencies Required
The following packages need to be installed for the authentication system to work properly:

```bash
npm install @supabase/ssr @supabase/supabase-js zod @radix-ui/react-label class-variance-authority
```

### Environment Variables
Update `.env` with actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Setup
Run the SQL migration to create the profiles table:

```bash
supabase db push
```

### RLS Policies
Row Level Security is enabled on all tables but policies need to be implemented in Phase 2.3 for proper data isolation.

---

## Summary

Phase 2.2 successfully implemented a complete production-ready authentication and authorization system with:

- ✅ Login, logout, forgot password, reset password
- ✅ Session management and persistence
- ✅ Protected routes with middleware
- ✅ Role-based access control (ADMIN/DEALER)
- ✅ Server and client authentication
- ✅ Form validation with Zod
- ✅ Error handling
- ✅ Modern UI with shadcn/ui
- ✅ TypeScript throughout
- ✅ Server actions for sensitive operations
- ✅ React context for state management

The authentication system is ready for Phase 2.3 to build the actual dashboard and marketplace features on top of this solid foundation.
