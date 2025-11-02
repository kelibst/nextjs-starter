# CLAUDE.md - Project Context for AI Assistants

This file provides context for AI assistants working on this Next.js Authentication Starter Kit project.

## 🎯 Project Overview

**Project Name:** Next.js Authentication Starter Kit
**Purpose:** A production-ready Next.js authentication starter with opt-in feature branches
**Architecture:** Main branch with minimal auth + feature branches for optional enhancements
**Status:** In Development (Phase 2 Complete, Phase 3 In Progress)

## 📋 Important Guidelines

### 1. **Always Update ACTIVITIES.md**
- **Location:** [plan/ACTIVITIES.md](plan/ACTIVITIES.md)
- Keep the update to maximum 3 lines for each new update.
- After every significant changes commit and remind the user to push to the branch.
- **When:** After completing any significant task or feature
- **Format:** Follow the existing structure with date, description, technical notes
- **Example Entry:**
  ```markdown
  ### ✅ Feature Name
  **Time:** Date/Time
  **Description:** Brief description
  **Technical Notes:**
  - Key implementation details
  - Files created/modified
  ```

### 2. **Docker Command**
⚠️ **IMPORTANT:** Use `docker compose up -d` (NOT `docker-compose`)
- The correct command is: `docker compose up -d`
- Similarly: `docker compose down`, `docker compose down -v`
- Update npm scripts if needed to use the correct command

### 3. **Development Workflow**
Follow this order when implementing features:
1. Create/update validation schemas (Zod)
2. Create API routes
3. Create UI components
4. Create pages
5. Add tests
6. Update ACTIVITIES.md

### 4. **Repository Pattern - Database Access**
⚠️ **CRITICAL SECURITY REQUIREMENT:** Never use Prisma directly in API routes or components!

**Why:**
- Prevents accidental password exposure
- Centralizes security policies
- Enables audit logging
- Makes testing easier
- Provides single source of truth

**Rules:**
1. ✅ **DO:** Import from `@/lib/repositories`
2. ❌ **DON'T:** Import from `@/lib/db/prisma` or `@prisma/client` in API routes
3. ✅ **DO:** Use repository methods (automatically exclude passwords)
4. ❌ **DON'T:** Write direct Prisma queries in routes

**Available Repositories:**
- `userRepository` - User operations (auto-excludes password)
- `refreshTokenRepository` - Token management
- `inviteRepository` - Invite operations

**Example - CORRECT:**
```typescript
import { userRepository } from "@/lib/repositories";

// Safe - password automatically excluded
const user = await userRepository.findById(userId);

// For authentication only - includes password
const user = await userRepository.findByIdWithPassword(userId);
```

**Example - WRONG:**
```typescript
import prisma from "@/lib/db/prisma"; // ❌ DON'T DO THIS

// Dangerous - password included!
const user = await prisma.user.findUnique({ where: { id: userId } });
```

**Repository Features:**
- Automatic password field exclusion on all User queries
- Query logging in development (set `LOG_QUERIES=true`)
- Consistent error handling
- Type-safe operations
- Transaction support

**When to Create New Repositories:**
- When adding new Prisma models
- When complex queries need centralization
- When field-level security is needed

**Repository Location:** `lib/repositories/`

## 📚 Key Documentation Files

Read these files to understand the project:

### Planning Documents
- [plan/PROJECT_OVERVIEW.md](plan/PROJECT_OVERVIEW.md) - Complete project architecture and philosophy
- [plan/IMPLEMENTATION_PLAN.md](plan/IMPLEMENTATION_PLAN.md) - Step-by-step implementation guide (8 phases)
- [plan/TECHNICAL_DECISIONS.md](plan/TECHNICAL_DECISIONS.md) - Why we chose each technology (38 decisions documented)
- [plan/FOLDER_STRUCTURE.md](plan/FOLDER_STRUCTURE.md) - Complete directory tree and file purposes
- [plan/ACTIVITIES.md](plan/ACTIVITIES.md) - **READ THIS FIRST** - Current progress and what's been done

### Configuration Files
- [.env.example](.env.example) - All environment variables (copy to .env for local dev)
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema (User, RefreshToken, Role)
- [components.json](components.json) - Shadcn/ui configuration
- [tsconfig.json](tsconfig.json) - TypeScript config with path aliases

## 🛠 Technology Stack

### Core Stack (Main Branch)
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL
- **ORM:** Prisma 5.22.0
- **Auth:** Custom JWT (using `jose` library)
- **Password:** bcryptjs (10 rounds)
- **Validation:** Zod
- **Forms:** React Hook Form
- **UI:** Shadcn/ui + Tailwind CSS v4
- **Testing:** Playwright (E2E)
- **Icons:** Lucide React
- **Toasts:** Sonner

### Dependencies Installed
```json
{
  "dependencies": [
    "@prisma/client", "bcryptjs", "jose", "zod",
    "react-hook-form", "@hookform/resolvers",
    "class-variance-authority", "clsx", "tailwind-merge",
    "lucide-react", "sonner"
  ],
  "devDependencies": [
    "prisma", "@playwright/test", "tsx", "prettier",
    "@types/bcryptjs"
  ]
}
```

## 🏗 Project Structure

```
nextjs-starter/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected pages (dashboard, profile, admin)
│   └── api/               # API routes (auth, users)
├── components/
│   ├── ui/                # Shadcn/ui components
│   ├── auth/              # Auth-specific components
│   ├── dashboard/         # Dashboard components
│   └── admin/             # Admin components
├── lib/
│   ├── auth/              # ✅ COMPLETE - Auth utilities
│   ├── validations/       # ✅ COMPLETE - Zod schemas
│   ├── api/               # ✅ COMPLETE - API helpers
│   ├── db/                # ✅ COMPLETE - Prisma client + middleware
│   ├── repositories/      # ✅ COMPLETE - Data access layer (USE THIS!)
│   └── hooks/             # React hooks
├── prisma/
│   ├── schema.prisma      # ✅ COMPLETE - Database schema
│   └── seed.ts            # ✅ COMPLETE - Seed script
├── tests/
│   └── e2e/               # Playwright tests
└── plan/                  # ✅ COMPLETE - Planning docs
```

## ✅ What's Been Completed

### Phase 1: Foundation (100% Complete)
- ✅ Package.json with all dependencies
- ✅ Docker Compose for PostgreSQL
- ✅ Prisma schema (User, RefreshToken, Role enum)
- ✅ Prisma client singleton
- ✅ Database seed script (default super_admin)
- ✅ Folder structure
- ✅ Shadcn/ui components installed
- ✅ TypeScript configuration (strict mode + path aliases)
- ✅ Environment configuration (.env.example)

### Phase 2: Core Authentication (100% Complete)
- ✅ [lib/auth/password.ts](lib/auth/password.ts) - Password hashing (bcrypt) + validation
- ✅ [lib/auth/constants.ts](lib/auth/constants.ts) - Auth configuration
- ✅ [lib/auth/jwt.ts](lib/auth/jwt.ts) - JWT generation/verification
- ✅ [lib/auth/session.ts](lib/auth/session.ts) - Session management
- ✅ [lib/auth/middleware.ts](lib/auth/middleware.ts) - Auth middleware helpers
- ✅ [lib/validations/auth.ts](lib/validations/auth.ts) - Auth schemas
- ✅ [lib/validations/user.ts](lib/validations/user.ts) - User schemas
- ✅ [lib/api/response.ts](lib/api/response.ts) - API response helpers
- ✅ [lib/api/errors.ts](lib/api/errors.ts) - Custom error classes
- ✅ [lib/utils.ts](lib/utils.ts) - Utility functions (cn, formatDate, etc.)

## 🔄 Current Status: Phase 3 - API Routes

### What Needs to Be Built Next

#### API Routes to Create (In Order)

1. **app/api/auth/register/route.ts**
   - POST endpoint for user registration
   - Validate with `registerSchema`
   - Check for existing username/email
   - Hash password with `hashPassword()`
   - Create user in database
   - Call `createSession()` to log in
   - Return success with user data

2. **app/api/auth/login/route.ts**
   - POST endpoint for user login
   - Validate with `loginSchema`
   - Find user by email or username
   - Verify password with `verifyPassword()`
   - Call `createSession()` to create tokens
   - Return success with user data

3. **app/api/auth/logout/route.ts**
   - POST endpoint for logout
   - Call `destroySession()` to clear tokens
   - Return success

4. **app/api/auth/refresh/route.ts**
   - POST endpoint to refresh access token
   - Call `refreshSession()` to rotate tokens
   - Return success or unauthorized

5. **app/api/auth/me/route.ts**
   - GET endpoint to get current user
   - Call `getCurrentUser()`
   - Return user data or unauthorized

6. **app/api/users/route.ts**
   - GET: List users (admin only)
   - Use `requireRole(Role.ADMIN, Role.SUPER_ADMIN)`

7. **app/api/users/[id]/route.ts**
   - GET: Get user by ID
   - PATCH: Update user (admin only)
   - DELETE: Delete user (super_admin only)

8. **app/api/users/me/route.ts**
   - GET: Get current user profile
   - PATCH: Update own profile

9. **app/api/users/me/password/route.ts**
   - PATCH: Change password
   - Validate with `changePasswordSchema`
   - Verify current password
   - Hash and update new password

## 🔐 Authentication Flow

### Registration Flow
```typescript
1. User submits form (username, email, password, confirmPassword)
2. Validate with registerSchema (Zod)
3. Check if username/email already exists
4. Hash password: await hashPassword(password)
5. Create user in database (default role: USER)
6. Create session: await createSession(user.id, user.role)
7. Return success (user auto-logged in)
```

### Login Flow
```typescript
1. User submits form (emailOrUsername, password)
2. Validate with loginSchema
3. Find user by email OR username
4. Verify password: await verifyPassword(password, user.password)
5. Create session: await createSession(user.id, user.role)
6. Return success with user data
```

### Session Management
- **Access Token:** 15 minutes (httpOnly cookie)
- **Refresh Token:** 7 days (httpOnly cookie + stored in DB)
- **Token Rotation:** On refresh, delete old token and create new one
- **Logout:** Delete refresh token from DB and clear cookies

### Protected Routes
```typescript
// Check if authenticated
const user = await getCurrentUser();
if (!user) return unauthorizedResponse();

// Check role
const user = await requireRole(Role.ADMIN, Role.SUPER_ADMIN);
```

## 🗄 Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String   // bcrypt hashed
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  refreshTokens RefreshToken[]
}
```

### RefreshToken Model
```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Role Enum
```prisma
enum Role {
  USER          // Default role for new users
  ADMIN         // Can manage users, view admin panel
  SUPER_ADMIN   // Full access, can manage admins
}
```

### Default Super Admin
- **Username:** admin
- **Email:** admin@example.com
- **Password:** Admin123!
- **Created by:** `npm run db:seed`

## 🎨 UI Design Principles

1. **Shadcn/ui Style:** Using "new-york" variant
2. **Responsive:** Mobile-first design
3. **Dark Mode Ready:** Tailwind theming configured
4. **Accessible:** WCAG 2.1 AA compliance
5. **Type-Safe:** Full TypeScript coverage
6. **Clean & Minimal:** Focus on functionality

## 🧪 Testing Strategy

### Playwright E2E Tests (To Be Created)
- Registration flow
- Login/logout flow
- Protected route access
- Role-based access control
- Password change
- Admin user management
- Token refresh mechanism

## 🌿 Branch Strategy

### Main Branch
Contains minimal working authentication:
- Username/password auth
- JWT with refresh tokens
- Role-based access control (3 roles)
- User dashboard
- Admin panel
- Default super_admin account

### Feature Branches (To Be Created)
1. `feature/email-verification` - Email verification on signup
2. `feature/password-reset` - Forgot password flow
3. `feature/2fa` - Two-factor authentication (TOTP)
4. `feature/oauth` - Google & GitHub OAuth
5. `feature/magic-link` - Passwordless email login
6. `feature/api-keys` - API key authentication
7. `feature/audit-logging` - Audit trail with Pino
8. `feature/rate-limiting` - Rate limiting with Upstash
9. `feature/all` - All features combined

## 🚀 Development Commands

### Database
```bash
# Start PostgreSQL (CORRECT COMMAND!)
docker compose up -d

# Stop PostgreSQL
docker compose down

# Reset database (delete data)
docker compose down -v && docker compose up -d

# Run migrations
npm run db:migrate

# Seed database (create super_admin)
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database (migrations + seed)
npm run db:reset
```

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format
```

### Testing
```bash
# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug
```

## 📝 Code Style Guidelines

### TypeScript
- Use strict mode (enabled)
- Use path aliases (`@/lib`, `@/components`)
- Prefer `const` over `let`
- Always define types/interfaces
- Use `async/await` over promises

### Error Handling
```typescript
// API Routes
try {
  // ... logic
  return successResponse(data);
} catch (error) {
  return handleApiError(error);
}

// Use custom error classes
throw new UnauthorizedError("Please log in");
throw new NotFoundError("User not found");
```

### API Response Format
```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: "Error message"
}

// Validation Error
{
  success: false,
  error: "Validation failed",
  errors: {
    "field": ["Error message 1", "Error message 2"]
  }
}
```

### Validation
```typescript
// Always validate input with Zod
const body = await request.json();
const data = loginSchema.parse(body); // Throws ZodError if invalid

// Or use safeParse for custom error handling
const result = loginSchema.safeParse(body);
if (!result.success) {
  return validationErrorResponse(result.error);
}
```

## 🔒 Security Best Practices

### Already Implemented
- ✅ bcrypt password hashing (10 rounds)
- ✅ JWT with short expiry (15min access, 7d refresh)
- ✅ Refresh token rotation (prevents reuse)
- ✅ httpOnly cookies (XSS protection)
- ✅ Secure cookies in production (HTTPS)
- ✅ Password strength validation
- ✅ Role-based access control

### To Be Implemented (Future Phases)
- ⏳ CSRF protection (Next.js middleware)
- ⏳ Rate limiting (login attempts, API calls)
- ⏳ Security headers (CSP, X-Frame-Options, etc.)
- ⏳ Input sanitization
- ⏳ Audit logging

## 🐛 Known Issues / Notes

### Docker Command
- ❌ User's system uses `docker compose` (NOT `docker-compose`)
- ⚠️ npm scripts use old `docker-compose` command
- 🔧 Need to update package.json scripts:
  ```json
  {
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:reset": "docker compose down -v && docker compose up -d"
  }
  ```

### Environment Setup
- User needs to install Docker/Docker Desktop
- User needs to create `.env` file from `.env.example`
- Database needs to be running before migrations

## 📊 Progress Tracking

### Completed (Phases 1-2): ~25%
- ✅ Foundation & Infrastructure
- ✅ Core Authentication System (utilities, validation, helpers)

### In Progress (Phase 3): API Routes
- 🔄 Creating authentication endpoints
- 🔄 Creating user management endpoints

### Upcoming (Phases 4-8):
- ⏳ UI Components & Pages
- ⏳ Next.js Middleware (route protection)
- ⏳ Security Headers
- ⏳ Playwright Tests
- ⏳ Documentation (Context7)
- ⏳ Feature Branches (8 optional features)

## 💡 Tips for AI Assistants

1. **Always read ACTIVITIES.md first** to understand what's been done
2. **Update ACTIVITIES.md** after completing tasks
3. **Follow the implementation plan** in [plan/IMPLEMENTATION_PLAN.md](plan/IMPLEMENTATION_PLAN.md)
4. **Use existing patterns** - check completed files for code style
5. **Test as you go** - verify each piece works before moving on
6. **Use docker compose** (not docker-compose) for database
7. **Keep code type-safe** - leverage TypeScript fully
8. **Follow security best practices** - see Technical Decisions doc
9. **Write clean, readable code** - this is a starter kit others will use
10. **Document complex logic** - add comments for non-obvious code

## 🎯 Next Immediate Tasks

When you resume working on this project:

1. **Update package.json** - Fix Docker commands to use `docker compose`
2. **Create API routes** in this order:
   - `app/api/auth/register/route.ts`
   - `app/api/auth/login/route.ts`
   - `app/api/auth/logout/route.ts`
   - `app/api/auth/refresh/route.ts`
   - `app/api/auth/me/route.ts`
3. **Test API routes** with Postman or similar
4. **Create UI components** (auth forms, dashboard layout)
5. **Create pages** (login, register, dashboard)
6. **Update ACTIVITIES.md** with progress

## 📞 Getting Help

If you need clarification:
- Check [plan/IMPLEMENTATION_PLAN.md](plan/IMPLEMENTATION_PLAN.md) for detailed steps
- Check [plan/TECHNICAL_DECISIONS.md](plan/TECHNICAL_DECISIONS.md) for "why" explanations
- Check [plan/FOLDER_STRUCTURE.md](plan/FOLDER_STRUCTURE.md) for file locations
- Look at completed files in `lib/auth/` for code patterns

---

**Last Updated:** 2025-11-01
**Current Phase:** Phase 3 - API Routes (In Progress)
**Overall Progress:** ~25% Complete
**Next Milestone:** Complete all authentication API endpoints
