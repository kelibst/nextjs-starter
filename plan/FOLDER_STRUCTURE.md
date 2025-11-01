# Folder Structure - Next.js Authentication Starter Kit

Complete folder structure with file descriptions for the entire project.

---

## 📁 Complete Directory Tree

```
nextjs-starter/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # GitHub Actions CI pipeline
│   │   └── playwright.yml            # E2E tests workflow
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── app/                               # Next.js 13+ App Router
│   ├── (auth)/                        # Route group: Auth pages
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── register/
│   │   │   └── page.tsx              # Registration page
│   │   └── layout.tsx                # Auth layout (centered card)
│   │
│   ├── (dashboard)/                   # Route group: Protected pages
│   │   ├── dashboard/
│   │   │   └── page.tsx              # User dashboard
│   │   ├── profile/
│   │   │   └── page.tsx              # User profile page
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   ├── page.tsx          # User list (admin)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Edit user (admin)
│   │   │   └── layout.tsx            # Admin layout
│   │   └── layout.tsx                # Dashboard layout (sidebar + navbar)
│   │
│   ├── api/                           # API Routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts          # POST /api/auth/login
│   │   │   ├── register/
│   │   │   │   └── route.ts          # POST /api/auth/register
│   │   │   ├── logout/
│   │   │   │   └── route.ts          # POST /api/auth/logout
│   │   │   ├── refresh/
│   │   │   │   └── route.ts          # POST /api/auth/refresh
│   │   │   └── me/
│   │   │       └── route.ts          # GET /api/auth/me
│   │   │
│   │   └── users/
│   │       ├── route.ts               # GET /api/users (list)
│   │       ├── [id]/
│   │       │   └── route.ts          # GET/PATCH/DELETE /api/users/:id
│   │       └── me/
│   │           ├── route.ts          # GET/PATCH /api/users/me
│   │           └── password/
│   │               └── route.ts      # PATCH /api/users/me/password
│   │
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Home/landing page
│   ├── error.tsx                      # Error boundary
│   ├── not-found.tsx                  # 404 page
│   └── loading.tsx                    # Loading UI
│
├── components/                        # React Components
│   ├── ui/                            # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── card.tsx
│   │   ├── label.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── separator.tsx
│   │   └── alert.tsx
│   │
│   ├── auth/
│   │   ├── auth-provider.tsx         # Auth context provider
│   │   ├── login-form.tsx            # Login form component
│   │   ├── register-form.tsx         # Registration form component
│   │   ├── password-change-form.tsx  # Password change form
│   │   └── protected-route.tsx       # Client-side route protection
│   │
│   ├── dashboard/
│   │   ├── navbar.tsx                # Top navigation bar
│   │   ├── sidebar.tsx               # Side navigation
│   │   ├── user-menu.tsx             # User dropdown menu
│   │   ├── user-profile-card.tsx     # User profile display
│   │   └── stats-card.tsx            # Dashboard stats card
│   │
│   ├── admin/
│   │   ├── user-table.tsx            # User list table
│   │   ├── user-form.tsx             # Create/edit user form
│   │   ├── user-actions.tsx          # User action buttons
│   │   └── role-badge.tsx            # Role display badge
│   │
│   └── providers.tsx                  # All providers wrapper
│
├── lib/                               # Utilities and Configurations
│   ├── auth/
│   │   ├── jwt.ts                    # JWT generation/verification
│   │   ├── password.ts               # Password hashing/verification
│   │   ├── session.ts                # Session management
│   │   ├── middleware.ts             # Auth middleware helpers
│   │   └── constants.ts              # Auth constants (token expiry, etc.)
│   │
│   ├── db/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   └── seed.ts                   # Database seeding script
│   │
│   ├── validations/
│   │   ├── auth.ts                   # Auth schemas (login, register)
│   │   ├── user.ts                   # User schemas (profile update)
│   │   └── index.ts                  # Export all schemas
│   │
│   ├── api/
│   │   ├── response.ts               # API response helpers
│   │   └── errors.ts                 # Custom error classes
│   │
│   ├── hooks/
│   │   ├── use-auth.ts               # useAuth hook
│   │   ├── use-user.ts               # useUser hook
│   │   └── use-toast.ts              # useToast hook (shadcn)
│   │
│   └── utils.ts                       # General utilities (cn, formatDate, etc.)
│
├── prisma/
│   ├── schema.prisma                  # Database schema
│   ├── migrations/                    # Database migrations
│   │   ├── 20250101000000_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── seed.ts                        # Seed script (symlink to lib/db/seed.ts)
│
├── tests/
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── register.spec.ts      # Registration flow tests
│   │   │   ├── login.spec.ts         # Login flow tests
│   │   │   ├── logout.spec.ts        # Logout tests
│   │   │   └── session.spec.ts       # Session management tests
│   │   │
│   │   ├── protected-routes.spec.ts   # Protected route tests
│   │   │
│   │   ├── admin/
│   │   │   └── user-management.spec.ts # Admin user management tests
│   │   │
│   │   └── profile/
│   │       └── profile.spec.ts        # User profile tests
│   │
│   ├── fixtures/
│   │   ├── users.ts                   # Test user data
│   │   └── setup.ts                   # Test setup helpers
│   │
│   └── helpers/
│       ├── auth.ts                    # Test auth helpers
│       └── db.ts                      # Test database helpers
│
├── docs/                              # Context7 Documentation
│   ├── getting-started/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   ├── environment-setup.md
│   │   └── troubleshooting.md
│   │
│   ├── core-features/
│   │   ├── authentication.md
│   │   ├── authorization.md
│   │   ├── user-management.md
│   │   └── session-management.md
│   │
│   ├── optional-features/
│   │   ├── email-verification.md
│   │   ├── password-reset.md
│   │   ├── 2fa.md
│   │   ├── oauth.md
│   │   ├── magic-link.md
│   │   ├── api-keys.md
│   │   ├── audit-logging.md
│   │   └── rate-limiting.md
│   │
│   ├── api-reference/
│   │   ├── auth-endpoints.md
│   │   ├── user-endpoints.md
│   │   └── admin-endpoints.md
│   │
│   ├── guides/
│   │   ├── merging-features.md
│   │   ├── customization.md
│   │   ├── deployment.md
│   │   ├── security-best-practices.md
│   │   └── testing.md
│   │
│   ├── database/
│   │   ├── schema.md
│   │   ├── migrations.md
│   │   └── seeding.md
│   │
│   └── index.md                       # Documentation home
│
├── plan/                              # Project Planning (this folder!)
│   ├── ACTIVITIES.md                  # Activity log
│   ├── PROJECT_OVERVIEW.md            # Project overview
│   ├── IMPLEMENTATION_PLAN.md         # Step-by-step plan
│   ├── TECHNICAL_DECISIONS.md         # Technical decisions
│   └── FOLDER_STRUCTURE.md            # This file
│
├── public/                            # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   └── avatar-placeholder.png
│   └── favicon.ico
│
├── .env.example                       # Environment variables template
├── .env.local                         # Local environment (gitignored)
├── .eslintrc.json                     # ESLint configuration
├── .gitignore                         # Git ignore rules
├── .prettierrc                        # Prettier configuration
├── docker-compose.yml                 # PostgreSQL Docker setup
├── Dockerfile                         # App containerization
├── middleware.ts                      # Next.js middleware (auth check)
├── next.config.ts                     # Next.js configuration
├── package.json                       # Dependencies and scripts
├── playwright.config.ts               # Playwright configuration
├── postcss.config.mjs                 # PostCSS configuration
├── README.md                          # Project README
├── tailwind.config.ts                 # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript configuration
├── CONTRIBUTING.md                    # Contribution guidelines
├── LICENSE                            # Project license
└── SECURITY.md                        # Security policy
```

---

## 📄 Key File Descriptions

### Configuration Files

**`next.config.ts`**
- Next.js configuration
- Security headers
- Redirects and rewrites
- Environment variables (public)

**`tsconfig.json`**
- TypeScript configuration
- Path aliases (@/components, etc.)
- Strict mode enabled

**`tailwind.config.ts`**
- Tailwind CSS configuration
- Custom colors, fonts
- Shadcn/ui integration

**`playwright.config.ts`**
- Playwright test configuration
- Test database setup
- Browser configurations

**`docker-compose.yml`**
- PostgreSQL container setup
- Database credentials
- Port mappings

---

### Core Files

**`middleware.ts`** (Root)
- Next.js Edge middleware
- JWT verification on protected routes
- Role-based access control
- Automatic token refresh

**`app/layout.tsx`**
- Root layout component
- Global providers
- Font setup
- Metadata

**`components/providers.tsx`**
- All provider wrappers
- AuthProvider
- Toaster (notifications)

---

### Authentication Files

**`lib/auth/jwt.ts`**
```typescript
export function generateAccessToken(payload: TokenPayload): Promise<string>
export function generateRefreshToken(payload: TokenPayload): Promise<string>
export function verifyAccessToken(token: string): Promise<TokenPayload>
export function verifyRefreshToken(token: string): Promise<TokenPayload>
```

**`lib/auth/password.ts`**
```typescript
export function hashPassword(password: string): Promise<string>
export function verifyPassword(password: string, hash: string): Promise<boolean>
```

**`lib/auth/session.ts`**
```typescript
export function createSession(userId: string, role: Role): Promise<void>
export function destroySession(): Promise<void>
export function getCurrentUser(): Promise<User | null>
export function refreshSession(): Promise<void>
```

---

### API Route Structure

All API routes follow this pattern:

```typescript
// app/api/[resource]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Handle GET request
}

export async function POST(req: NextRequest) {
  // Handle POST request
}

// etc.
```

---

### Component Structure

All components follow this pattern:

```typescript
// components/[category]/[component-name].tsx

import { FC } from 'react';

interface ComponentProps {
  // Props
}

export const ComponentName: FC<ComponentProps> = ({ ...props }) => {
  // Component logic
  return (
    // JSX
  );
};
```

---

## 🌿 Feature Branch Additions

Each feature branch adds files to this structure:

### `feature/email-verification`
```
├── app/api/auth/
│   ├── send-verification/route.ts
│   └── verify-email/route.ts
├── app/(auth)/verify-email/page.tsx
├── components/auth/
│   └── email-verification-banner.tsx
├── lib/email/
│   ├── client.ts
│   └── templates/
│       └── verification-email.tsx
└── docs/optional-features/email-verification.md
```

### `feature/password-reset`
```
├── app/api/auth/
│   ├── forgot-password/route.ts
│   └── reset-password/route.ts
├── app/(auth)/
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
├── components/auth/
│   ├── forgot-password-form.tsx
│   └── reset-password-form.tsx
├── lib/email/templates/
│   └── reset-password-email.tsx
└── docs/optional-features/password-reset.md
```

### `feature/2fa`
```
├── app/api/auth/2fa/
│   ├── setup/route.ts
│   ├── verify-setup/route.ts
│   ├── verify/route.ts
│   ├── disable/route.ts
│   └── backup-codes/route.ts
├── app/(auth)/2fa/
│   ├── setup/page.tsx
│   └── verify/page.tsx
├── app/(dashboard)/profile/2fa/page.tsx
├── components/auth/
│   ├── 2fa-setup-wizard.tsx
│   ├── 2fa-verify-form.tsx
│   └── 2fa-backup-codes.tsx
├── lib/auth/
│   └── totp.ts
└── docs/optional-features/2fa.md
```

### `feature/oauth`
```
├── app/api/auth/oauth/
│   ├── google/route.ts
│   ├── google/callback/route.ts
│   ├── github/route.ts
│   └── github/callback/route.ts
├── components/auth/
│   ├── oauth-buttons.tsx
│   └── oauth-account-card.tsx
├── app/(dashboard)/profile/connections/page.tsx
├── lib/auth/
│   └── oauth.ts
└── docs/optional-features/oauth.md
```

### `feature/magic-link`
```
├── app/api/auth/magic-link/
│   ├── request/route.ts
│   └── verify/route.ts
├── app/(auth)/magic-link/
│   ├── page.tsx
│   └── verify/page.tsx
├── components/auth/
│   └── magic-link-form.tsx
├── lib/email/templates/
│   └── magic-link-email.tsx
└── docs/optional-features/magic-link.md
```

### `feature/api-keys`
```
├── app/api/users/api-keys/
│   └── route.ts (GET, POST)
├── app/api/users/api-keys/[id]/
│   └── route.ts (DELETE)
├── app/(dashboard)/profile/api-keys/page.tsx
├── components/admin/
│   ├── api-key-list.tsx
│   ├── api-key-create-form.tsx
│   └── api-key-display.tsx
├── lib/auth/
│   └── api-key.ts
└── docs/optional-features/api-keys.md
```

### `feature/audit-logging`
```
├── app/api/admin/audit-logs/
│   └── route.ts
├── app/(dashboard)/admin/audit-logs/page.tsx
├── components/admin/
│   ├── audit-log-table.tsx
│   └── audit-log-filters.tsx
├── lib/logging/
│   ├── logger.ts
│   └── audit.ts
└── docs/optional-features/audit-logging.md
```

### `feature/rate-limiting`
```
├── lib/rate-limit/
│   ├── index.ts
│   ├── redis.ts
│   └── in-memory.ts
├── middleware/
│   └── rate-limit.ts
└── docs/optional-features/rate-limiting.md
```

---

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:reset": "docker-compose down -v && docker-compose up -d"
  }
}
```

---

## 🔒 .gitignore

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
/coverage
/playwright-report
/test-results

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Prisma
prisma/dev.db
prisma/dev.db-journal

# IDE
.vscode/
.idea/
*.swp
*.swo
```

---

## 📋 Checklist: Files to Create

### Phase 1: Foundation
- [ ] docker-compose.yml
- [ ] .env.example
- [ ] prisma/schema.prisma
- [ ] lib/db/prisma.ts
- [ ] lib/utils.ts

### Phase 2: Authentication
- [ ] lib/auth/jwt.ts
- [ ] lib/auth/password.ts
- [ ] lib/auth/session.ts
- [ ] lib/auth/middleware.ts
- [ ] lib/validations/auth.ts
- [ ] middleware.ts (root)

### Phase 3: API Routes
- [ ] app/api/auth/register/route.ts
- [ ] app/api/auth/login/route.ts
- [ ] app/api/auth/logout/route.ts
- [ ] app/api/auth/refresh/route.ts
- [ ] app/api/auth/me/route.ts
- [ ] app/api/users/route.ts
- [ ] app/api/users/[id]/route.ts
- [ ] app/api/users/me/route.ts
- [ ] app/api/users/me/password/route.ts

### Phase 4: Components
- [ ] components/providers.tsx
- [ ] components/auth/auth-provider.tsx
- [ ] components/auth/login-form.tsx
- [ ] components/auth/register-form.tsx
- [ ] components/ui/* (all shadcn components)
- [ ] components/dashboard/navbar.tsx
- [ ] components/dashboard/sidebar.tsx
- [ ] components/admin/user-table.tsx

### Phase 5: Pages
- [ ] app/(auth)/layout.tsx
- [ ] app/(auth)/login/page.tsx
- [ ] app/(auth)/register/page.tsx
- [ ] app/(dashboard)/layout.tsx
- [ ] app/(dashboard)/dashboard/page.tsx
- [ ] app/(dashboard)/profile/page.tsx
- [ ] app/(dashboard)/admin/users/page.tsx

### Phase 6: Tests
- [ ] playwright.config.ts
- [ ] tests/e2e/auth/register.spec.ts
- [ ] tests/e2e/auth/login.spec.ts
- [ ] tests/e2e/protected-routes.spec.ts
- [ ] tests/fixtures/users.ts

### Phase 7: Documentation
- [ ] All docs files listed above
- [ ] README.md (comprehensive)
- [ ] CONTRIBUTING.md
- [ ] SECURITY.md

---

**Last Updated**: 2025-11-01
**Status**: Complete Structure Defined
