# Implementation Plan - Next.js Authentication Starter Kit

## 📋 Overview

This document outlines the step-by-step implementation plan for building the authentication starter kit with opt-in feature branches.

## 🎯 Implementation Phases

### Phase 1: Foundation & Infrastructure (Days 1-2)

#### 1.1 Project Setup & Dependencies
**Branch**: `main`
**Estimated Time**: 2-3 hours

- [ ] Update package.json with all core dependencies
- [ ] Install dependencies:
  ```json
  {
    "dependencies": {
      "next": "16.0.1",
      "react": "19.2.0",
      "react-dom": "19.2.0",
      "@prisma/client": "^5.x",
      "bcryptjs": "^2.4.3",
      "jose": "^5.x",
      "zod": "^3.x",
      "react-hook-form": "^7.x",
      "@hookform/resolvers": "^3.x"
    },
    "devDependencies": {
      "@playwright/test": "^1.x",
      "@types/bcryptjs": "^2.4.6",
      "prisma": "^5.x"
    }
  }
  ```
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Setup Tailwind CSS v4 (already done)
- [ ] Install Shadcn/ui CLI and components

#### 1.2 Docker & Database Setup
**Estimated Time**: 1 hour

- [ ] Create docker-compose.yml for PostgreSQL
- [ ] Create .env.example with all required variables
- [ ] Setup Prisma:
  - [ ] Initialize Prisma
  - [ ] Create initial schema (User, RefreshToken, Role enum)
  - [ ] Create first migration
  - [ ] Setup Prisma client singleton

#### 1.3 Project Structure
**Estimated Time**: 1 hour

- [ ] Create folder structure (app, components, lib, tests, docs)
- [ ] Setup path aliases in tsconfig.json (@/components, @/lib, etc.)
- [ ] Create base layout structure
- [ ] Setup middleware.ts file

---

### Phase 2: Core Authentication System (Days 3-5)

#### 2.1 Authentication Utilities
**Branch**: `main`
**Estimated Time**: 4-5 hours

**Files to create:**

**`lib/auth/password.ts`**
- [ ] Password hashing function (bcrypt, 10 rounds)
- [ ] Password verification function
- [ ] Password strength validation

**`lib/auth/jwt.ts`**
- [ ] JWT generation (access + refresh tokens)
- [ ] JWT verification with jose library
- [ ] Token payload types
- [ ] Error handling for expired/invalid tokens

**`lib/auth/session.ts`**
- [ ] Cookie management (get, set, delete)
- [ ] Session creation/destruction
- [ ] Current user retrieval
- [ ] Refresh token storage in database

**`lib/auth/middleware.ts`**
- [ ] Auth middleware for protected routes
- [ ] Role-based access control helper
- [ ] Request user attachment

**`lib/validations/auth.ts`**
- [ ] Zod schemas for:
  - Registration form
  - Login form
  - Password change form
  - User role validation

#### 2.2 Database Models & Seeding
**Estimated Time**: 2 hours

**`prisma/schema.prisma`**
- [ ] User model (id, username, email, password, role, timestamps)
- [ ] RefreshToken model (id, token, userId, expiresAt)
- [ ] Role enum (USER, ADMIN, SUPER_ADMIN)
- [ ] Indexes and relations

**`prisma/seed.ts`**
- [ ] Seed script to create default super_admin
- [ ] Use environment variables for default credentials
- [ ] Check if super_admin exists before creating
- [ ] Add package.json seed command

#### 2.3 API Routes - Authentication
**Estimated Time**: 6-8 hours

**`app/api/auth/register/route.ts`**
- [ ] POST endpoint
- [ ] Validate input with Zod
- [ ] Check for existing username/email
- [ ] Hash password
- [ ] Create user with default role: USER
- [ ] Generate tokens
- [ ] Set httpOnly cookies
- [ ] Return success response

**`app/api/auth/login/route.ts`**
- [ ] POST endpoint
- [ ] Validate input
- [ ] Find user by email or username
- [ ] Verify password
- [ ] Generate tokens
- [ ] Store refresh token in database
- [ ] Set httpOnly cookies
- [ ] Return user data (without password)

**`app/api/auth/logout/route.ts`**
- [ ] POST endpoint
- [ ] Verify current session
- [ ] Delete refresh token from database
- [ ] Clear cookies
- [ ] Return success response

**`app/api/auth/refresh/route.ts`**
- [ ] POST endpoint
- [ ] Get refresh token from cookie
- [ ] Verify refresh token
- [ ] Check token exists in database
- [ ] Generate new access token
- [ ] Rotate refresh token (delete old, create new)
- [ ] Set new cookies
- [ ] Return success response

**`app/api/auth/me/route.ts`**
- [ ] GET endpoint
- [ ] Verify access token
- [ ] Return current user data
- [ ] Handle unauthenticated requests

#### 2.4 API Routes - User Management
**Estimated Time**: 3-4 hours

**`app/api/users/route.ts`**
- [ ] GET endpoint (list users, admin only)
- [ ] Pagination support
- [ ] Role filtering
- [ ] Search by username/email

**`app/api/users/[id]/route.ts`**
- [ ] GET endpoint (get single user)
- [ ] PATCH endpoint (update user, admin only)
- [ ] DELETE endpoint (delete user, super_admin only)

**`app/api/users/me/route.ts`**
- [ ] GET endpoint (current user profile)
- [ ] PATCH endpoint (update own profile)

**`app/api/users/me/password/route.ts`**
- [ ] PATCH endpoint (change password)
- [ ] Verify current password
- [ ] Validate new password
- [ ] Hash and update password

---

### Phase 3: UI Components & Pages (Days 6-8)

#### 3.1 Shadcn/ui Setup
**Estimated Time**: 2 hours

- [ ] Initialize Shadcn/ui
- [ ] Install required components:
  - [ ] Button
  - [ ] Input
  - [ ] Form
  - [ ] Card
  - [ ] Label
  - [ ] Toast/Sonner
  - [ ] Dialog
  - [ ] Table
  - [ ] Dropdown Menu
  - [ ] Badge
  - [ ] Avatar

#### 3.2 Auth Components
**Estimated Time**: 6-8 hours

**`components/auth/login-form.tsx`**
- [ ] React Hook Form + Zod validation
- [ ] Email/username and password fields
- [ ] Submit handler with API call
- [ ] Loading state
- [ ] Error display
- [ ] Link to register page

**`components/auth/register-form.tsx`**
- [ ] React Hook Form + Zod validation
- [ ] Username, email, password, confirm password fields
- [ ] Password strength indicator
- [ ] Submit handler
- [ ] Loading state
- [ ] Error display
- [ ] Link to login page

**`components/auth/password-change-form.tsx`**
- [ ] React Hook Form
- [ ] Current password, new password, confirm new password
- [ ] Submit handler
- [ ] Success/error feedback

**`components/auth/auth-provider.tsx`**
- [ ] React Context for current user
- [ ] useAuth hook
- [ ] Login/logout functions
- [ ] User state management

#### 3.3 Auth Pages
**Estimated Time**: 3-4 hours

**`app/(auth)/layout.tsx`**
- [ ] Auth layout (centered card)
- [ ] Redirect to dashboard if already authenticated
- [ ] Responsive design

**`app/(auth)/login/page.tsx`**
- [ ] Login page
- [ ] LoginForm component
- [ ] Redirect to dashboard after login
- [ ] Link to register

**`app/(auth)/register/page.tsx`**
- [ ] Register page
- [ ] RegisterForm component
- [ ] Redirect to dashboard after registration
- [ ] Link to login

#### 3.4 Dashboard Components
**Estimated Time**: 6-8 hours

**`components/dashboard/navbar.tsx`**
- [ ] User avatar/menu
- [ ] Logout button
- [ ] Navigation links
- [ ] Role-based menu items

**`components/dashboard/sidebar.tsx`**
- [ ] Navigation menu
- [ ] Role-based navigation items
- [ ] Active link highlighting

**`components/dashboard/user-profile-card.tsx`**
- [ ] Display user info
- [ ] Edit profile button
- [ ] Change password button

**`components/admin/user-table.tsx`**
- [ ] Shadcn Table component
- [ ] User list display
- [ ] Role badges
- [ ] Actions column (edit, delete)
- [ ] Pagination

**`components/admin/user-form.tsx`**
- [ ] Create/edit user form
- [ ] Role selection (admin/super_admin only)
- [ ] Form validation

#### 3.5 Dashboard Pages
**Estimated Time**: 4-5 hours

**`app/(dashboard)/layout.tsx`**
- [ ] Dashboard layout (sidebar + navbar)
- [ ] Protected route (redirect to login if not authenticated)
- [ ] Responsive layout

**`app/(dashboard)/dashboard/page.tsx`**
- [ ] User dashboard
- [ ] Welcome message
- [ ] User profile card
- [ ] Basic stats

**`app/(dashboard)/profile/page.tsx`**
- [ ] User profile page
- [ ] Display user info
- [ ] Edit profile form
- [ ] Change password form

**`app/(dashboard)/admin/users/page.tsx`**
- [ ] Admin-only page (role check)
- [ ] User table component
- [ ] Search and filters
- [ ] Pagination

**`app/(dashboard)/admin/users/[id]/page.tsx`**
- [ ] Edit user page
- [ ] User form component
- [ ] Delete user button (super_admin only)

---

### Phase 4: Middleware & Security (Day 9)

#### 4.1 Next.js Middleware
**Estimated Time**: 3-4 hours

**`middleware.ts`**
- [ ] Verify JWT access token from cookies
- [ ] Refresh token logic if access token expired
- [ ] Protected route patterns
- [ ] Role-based route protection
- [ ] Redirect logic (auth pages, protected pages)
- [ ] Public routes whitelist

#### 4.2 Security Enhancements
**Estimated Time**: 2-3 hours

- [ ] CSRF protection (Next.js built-in)
- [ ] Secure cookie configuration
- [ ] XSS prevention (React escaping + CSP headers)
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] next.config.ts security headers:
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Referrer-Policy
  - [ ] Permissions-Policy
  - [ ] Content-Security-Policy

#### 4.3 Error Handling
**Estimated Time**: 2 hours

- [ ] Global error boundary
- [ ] API error responses (standardized format)
- [ ] Client-side error handling
- [ ] Toast notifications for errors
- [ ] 404 page
- [ ] 500 page
- [ ] Unauthorized/Forbidden pages

---

### Phase 5: Testing (Days 10-11)

#### 5.1 Playwright Setup
**Estimated Time**: 2 hours

- [ ] Initialize Playwright
- [ ] Configure playwright.config.ts
- [ ] Setup test database
- [ ] Create test fixtures
- [ ] Setup test helpers

#### 5.2 E2E Tests - Authentication
**Estimated Time**: 6-8 hours

**`tests/e2e/auth/register.spec.ts`**
- [ ] Test successful registration
- [ ] Test duplicate username/email
- [ ] Test validation errors
- [ ] Test automatic login after registration

**`tests/e2e/auth/login.spec.ts`**
- [ ] Test successful login
- [ ] Test invalid credentials
- [ ] Test validation errors
- [ ] Test redirect to dashboard

**`tests/e2e/auth/logout.spec.ts`**
- [ ] Test logout functionality
- [ ] Test redirect to login
- [ ] Test cookies cleared

**`tests/e2e/auth/session.spec.ts`**
- [ ] Test access token expiry
- [ ] Test refresh token mechanism
- [ ] Test invalid token handling

#### 5.3 E2E Tests - Protected Routes
**Estimated Time**: 4-5 hours

**`tests/e2e/protected-routes.spec.ts`**
- [ ] Test unauthenticated access (redirect to login)
- [ ] Test authenticated access (successful)
- [ ] Test role-based access (user cannot access admin)
- [ ] Test role-based access (admin can access admin panel)

#### 5.4 E2E Tests - User Management
**Estimated Time**: 4-5 hours

**`tests/e2e/admin/user-management.spec.ts`**
- [ ] Test admin can view user list
- [ ] Test admin can edit user
- [ ] Test admin cannot delete user (super_admin only)
- [ ] Test super_admin can delete user
- [ ] Test regular user cannot access admin panel

**`tests/e2e/profile/profile.spec.ts`**
- [ ] Test user can view profile
- [ ] Test user can edit profile
- [ ] Test user can change password
- [ ] Test password change requires current password

---

### Phase 6: Documentation (Days 12-13)

#### 6.1 Setup Context7
**Estimated Time**: 2 hours

- [ ] Install Context7 or setup documentation structure
- [ ] Configure documentation site
- [ ] Setup navigation
- [ ] Create documentation templates

#### 6.2 Core Documentation
**Estimated Time**: 6-8 hours

**Getting Started:**
- [ ] Installation guide
- [ ] Quick start guide
- [ ] Environment setup
- [ ] Docker setup
- [ ] Database setup

**Core Features:**
- [ ] Authentication overview
- [ ] Authorization & RBAC
- [ ] User management
- [ ] Session management
- [ ] Security best practices

**API Reference:**
- [ ] Auth endpoints documentation
- [ ] User endpoints documentation
- [ ] Admin endpoints documentation
- [ ] Error responses

**Guides:**
- [ ] Merging feature branches
- [ ] Customization guide
- [ ] Deployment guide
- [ ] Testing guide

**Database:**
- [ ] Schema documentation
- [ ] Migrations guide
- [ ] Seeding guide

#### 6.3 README & Setup Docs
**Estimated Time**: 2-3 hours

- [ ] Update README.md with comprehensive guide
- [ ] Create CONTRIBUTING.md
- [ ] Create LICENSE
- [ ] Create SECURITY.md
- [ ] Create .env.example with comments

---

### Phase 7: Feature Branches (Days 14-30)

Each feature branch will be implemented independently and can be worked on in parallel or sequentially.

#### 7.1 Feature: Email Verification
**Branch**: `feature/email-verification`
**Estimated Time**: 1-2 days

**Tasks:**
- [ ] Install dependencies (resend, react-email)
- [ ] Update Prisma schema (add emailVerified, verificationToken fields)
- [ ] Create migration
- [ ] Create email templates with React Email
- [ ] Create `/api/auth/send-verification` endpoint
- [ ] Create `/api/auth/verify-email` endpoint
- [ ] Update registration flow to send verification email
- [ ] Add email verification check middleware
- [ ] Create verification UI page
- [ ] Add resend verification email option
- [ ] Update tests
- [ ] Write documentation

#### 7.2 Feature: Password Reset
**Branch**: `feature/password-reset`
**Estimated Time**: 1-2 days

**Tasks:**
- [ ] Update Prisma schema (passwordResetToken, passwordResetExpires)
- [ ] Create migration
- [ ] Create password reset email template
- [ ] Create `/api/auth/forgot-password` endpoint
- [ ] Create `/api/auth/reset-password` endpoint
- [ ] Create forgot password page
- [ ] Create reset password page
- [ ] Token expiration handling (1 hour)
- [ ] Update tests
- [ ] Write documentation

#### 7.3 Feature: 2FA/MFA
**Branch**: `feature/2fa`
**Estimated Time**: 2-3 days

**Tasks:**
- [ ] Install dependencies (speakeasy, qrcode)
- [ ] Update Prisma schema (twoFactorEnabled, twoFactorSecret, backupCodes)
- [ ] Create migration
- [ ] Create `/api/auth/2fa/setup` endpoint (generate secret, QR code)
- [ ] Create `/api/auth/2fa/verify-setup` endpoint
- [ ] Create `/api/auth/2fa/verify` endpoint (during login)
- [ ] Create `/api/auth/2fa/disable` endpoint
- [ ] Create `/api/auth/2fa/backup-codes` endpoint
- [ ] Update login flow to check for 2FA
- [ ] Create 2FA setup wizard UI
- [ ] Create 2FA verification page (during login)
- [ ] Create 2FA management in profile
- [ ] Generate and display backup codes
- [ ] Update tests
- [ ] Write documentation

#### 7.4 Feature: OAuth
**Branch**: `feature/oauth`
**Estimated Time**: 2-3 days

**Tasks:**
- [ ] Install dependencies (arctic for OAuth)
- [ ] Update Prisma schema (add Account model for OAuth connections)
- [ ] Create migration
- [ ] Create `/api/auth/oauth/google` endpoint
- [ ] Create `/api/auth/oauth/google/callback` endpoint
- [ ] Create `/api/auth/oauth/github` endpoint
- [ ] Create `/api/auth/oauth/github/callback` endpoint
- [ ] OAuth account linking logic
- [ ] Social login buttons on login/register pages
- [ ] Profile data sync from OAuth providers
- [ ] Handle OAuth errors
- [ ] Account connection management in profile
- [ ] Update tests
- [ ] Write documentation

#### 7.5 Feature: Magic Link
**Branch**: `feature/magic-link`
**Estimated Time**: 1-2 days

**Tasks:**
- [ ] Update Prisma schema (magicLinkToken, magicLinkExpires)
- [ ] Create migration
- [ ] Create magic link email template
- [ ] Create `/api/auth/magic-link/request` endpoint
- [ ] Create `/api/auth/magic-link/verify` endpoint
- [ ] Create magic link request page
- [ ] Create magic link verification page
- [ ] Token expiration (15 minutes)
- [ ] Rate limiting for magic link requests
- [ ] Update tests
- [ ] Write documentation

#### 7.6 Feature: API Keys
**Branch**: `feature/api-keys`
**Estimated Time**: 2 days

**Tasks:**
- [ ] Update Prisma schema (add ApiKey model)
- [ ] Create migration
- [ ] Create `/api/users/api-keys` endpoint (CRUD)
- [ ] API key generation (secure random)
- [ ] API key authentication middleware
- [ ] Scoped permissions for API keys
- [ ] Usage tracking per key
- [ ] Key rotation functionality
- [ ] API key management UI (profile page)
- [ ] Display key only once after creation
- [ ] Update tests
- [ ] Write documentation

#### 7.7 Feature: Audit Logging
**Branch**: `feature/audit-logging`
**Estimated Time**: 2-3 days

**Tasks:**
- [ ] Install dependencies (pino, pino-pretty)
- [ ] Update Prisma schema (add AuditLog model)
- [ ] Create migration
- [ ] Setup structured logging with Pino
- [ ] Create audit log utility functions
- [ ] Log authentication events (login, logout, failed attempts)
- [ ] Log permission changes (role assignments)
- [ ] Log data modifications (user updates, deletions)
- [ ] Create `/api/admin/audit-logs` endpoint
- [ ] Create audit log viewer UI (admin only)
- [ ] Filtering and search
- [ ] Export functionality (CSV/JSON)
- [ ] Update tests
- [ ] Write documentation

#### 7.8 Feature: Rate Limiting
**Branch**: `feature/rate-limiting`
**Estimated Time**: 1-2 days

**Tasks:**
- [ ] Install dependencies (upstash/ratelimit or custom)
- [ ] Setup Redis (Docker or Upstash)
- [ ] Create rate limiting middleware
- [ ] Apply rate limits to auth endpoints:
  - [ ] Login (5 attempts per 15 min)
  - [ ] Register (3 attempts per hour)
  - [ ] Password reset (3 attempts per hour)
- [ ] Per-user API rate limits
- [ ] IP-based rate limiting
- [ ] Rate limit headers (X-RateLimit-*)
- [ ] Rate limit exceeded error responses
- [ ] Configurable limits via environment variables
- [ ] Update tests
- [ ] Write documentation

#### 7.9 Feature: All (Integration)
**Branch**: `feature/all`
**Estimated Time**: 2-3 days

**Tasks:**
- [ ] Create branch from main
- [ ] Merge all feature branches sequentially
- [ ] Resolve any merge conflicts
- [ ] Update Prisma schema (all features combined)
- [ ] Create comprehensive migration
- [ ] Integration testing (all features working together)
- [ ] Performance testing
- [ ] Update documentation for complete setup
- [ ] Create example .env with all variables

---

### Phase 8: Final Polish & Release (Days 31-32)

#### 8.1 Code Quality
**Estimated Time**: 4 hours

- [ ] ESLint configuration and fixes
- [ ] Prettier configuration
- [ ] TypeScript strict mode enabled
- [ ] Remove console.logs
- [ ] Add JSDoc comments to utilities
- [ ] Code cleanup and refactoring

#### 8.2 Performance Optimization
**Estimated Time**: 3 hours

- [ ] Next.js bundle analysis
- [ ] Optimize images
- [ ] Code splitting review
- [ ] Database query optimization
- [ ] Add caching where appropriate

#### 8.3 Deployment Preparation
**Estimated Time**: 3 hours

- [ ] Create deployment guides:
  - [ ] Vercel deployment
  - [ ] Docker deployment
  - [ ] VPS deployment
  - [ ] Environment variables setup
  - [ ] Database migration in production
- [ ] Create CI/CD examples (GitHub Actions)
- [ ] Add health check endpoint

#### 8.4 Repository Setup
**Estimated Time**: 2 hours

- [ ] Create GitHub repository
- [ ] Push all branches
- [ ] Create branch protection rules
- [ ] Setup issues templates
- [ ] Create pull request template
- [ ] Add repository tags
- [ ] Create releases for each feature

#### 8.5 Final Testing
**Estimated Time**: 4 hours

- [ ] Run all tests on main branch
- [ ] Test each feature branch individually
- [ ] Test feature/all branch
- [ ] Test fresh installation process
- [ ] Test feature merging process
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

#### 8.6 Documentation Review
**Estimated Time**: 2 hours

- [ ] Review all documentation
- [ ] Check for broken links
- [ ] Verify code examples work
- [ ] Add screenshots/videos where helpful
- [ ] Proofread everything

---

## 📊 Time Estimation Summary

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1: Foundation | 2 days | Infrastructure, Docker, Prisma |
| Phase 2: Core Auth | 3 days | JWT, API routes, utilities |
| Phase 3: UI/UX | 3 days | Components, pages, forms |
| Phase 4: Security | 1 day | Middleware, security headers |
| Phase 5: Testing | 2 days | Playwright E2E tests |
| Phase 6: Documentation | 2 days | Context7 setup, docs writing |
| Phase 7: Features | 14 days | 8 feature branches + integration |
| Phase 8: Polish | 2 days | QA, deployment, final review |
| **Total** | **29 days** | **Full implementation** |

**Note**: This is for one developer working full-time. Can be parallelized with multiple developers.

---

## 🎯 Success Metrics

### Main Branch Success
- [ ] Can register, login, logout without issues
- [ ] JWT refresh works seamlessly
- [ ] RBAC works correctly (3 roles tested)
- [ ] Admin panel functional
- [ ] Default super_admin created
- [ ] All 20+ Playwright tests pass
- [ ] Docker Compose starts PostgreSQL
- [ ] Documentation complete

### Feature Branches Success
- [ ] Each feature works independently
- [ ] No merge conflicts between features
- [ ] Tests pass for each feature
- [ ] Documentation for each feature
- [ ] feature/all branch includes everything
- [ ] All tests pass on feature/all

### Overall Project Success
- [ ] Clear, concise README
- [ ] Easy setup process (< 10 minutes)
- [ ] Comprehensive documentation
- [ ] Production-ready code quality
- [ ] Security best practices implemented
- [ ] Type-safe throughout
- [ ] Mobile responsive
- [ ] Accessible (WCAG AA)

---

## 📝 Development Notes

### Git Workflow
1. All work starts on `main` branch for core features
2. Create feature branches from `main` when core is stable
3. Feature branches should not depend on each other
4. `feature/all` is created last, merging all features
5. Use conventional commits for clear history

### Branch Naming
- `main` - Core minimal auth
- `feature/email-verification`
- `feature/password-reset`
- `feature/2fa`
- `feature/oauth`
- `feature/magic-link`
- `feature/api-keys`
- `feature/audit-logging`
- `feature/rate-limiting`
- `feature/all`

### Testing Strategy
- Write tests alongside features (not after)
- Test on main branch first, then features
- Each feature branch has its own test file
- Integration tests on feature/all branch

### Documentation Strategy
- Document as you build (not after)
- Use clear, concise language
- Include code examples
- Add troubleshooting sections

---

**Last Updated**: 2025-11-01
**Status**: Ready for Implementation
