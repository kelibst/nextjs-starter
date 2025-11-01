# Next.js Authentication Starter Kit - Project Overview

## 🎯 Project Goal

Create a production-ready Next.js authentication starter project with a **core minimal setup** and **opt-in feature branches** that users can clone and merge based on their needs.

## 📋 Architecture Philosophy

### Core Principle: "Start Simple, Add What You Need"

- **Main Branch**: Minimal working authentication (username/password + JWT + RBAC)
- **Feature Branches**: Each advanced feature in its own branch
- **User Experience**: Clone repo → Use main → Merge feature branches as needed

## 🛠 Technology Stack

### Core Stack (Main Branch)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Custom JWT implementation
- **UI**: Shadcn/ui + Tailwind CSS v4
- **Validation**: Zod
- **Forms**: React Hook Form
- **Testing**: Playwright (E2E)
- **Documentation**: Context7

### Additional Dependencies (Feature Branches)
- **Email**: Resend + React Email (email verification, password reset)
- **2FA**: speakeasy + qrcode
- **OAuth**: Arctic (lightweight OAuth library)
- **Rate Limiting**: upstash/ratelimit or custom middleware
- **Logging**: Pino (structured logging)

## 📦 Project Structure

```
nextjs-starter/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Auth pages group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected pages group
│   │   ├── dashboard/
│   │   ├── admin/
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── logout/
│   │   │   └── refresh/
│   │   └── users/
│   └── layout.tsx
├── components/                   # React components
│   ├── ui/                       # Shadcn components
│   ├── auth/                     # Auth-specific components
│   └── dashboard/                # Dashboard components
├── lib/                          # Utilities and configs
│   ├── auth/                     # Auth utilities
│   │   ├── jwt.ts               # JWT generation/verification
│   │   ├── password.ts          # Password hashing (bcrypt)
│   │   ├── session.ts           # Session management
│   │   └── middleware.ts        # Auth middleware
│   ├── db/                       # Database utilities
│   │   ├── prisma.ts            # Prisma client
│   │   └── seed.ts              # Database seeding
│   ├── validations/              # Zod schemas
│   └── utils.ts
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed script
├── tests/
│   ├── e2e/                     # Playwright tests
│   └── fixtures/                # Test data
├── docs/                         # Context7 documentation
├── docker-compose.yml           # PostgreSQL setup
├── .env.example                 # Environment variables template
└── plan/                        # Project planning docs
```

## 🌿 Branch Strategy

### Main Branch: `main`
**Minimal Authentication System**

Features:
- ✅ User registration (username/email/password)
- ✅ Login/logout with JWT (httpOnly cookies)
- ✅ Role-based access control (RBAC) - 3 roles: user, admin, super_admin
- ✅ Protected routes middleware
- ✅ Basic user dashboard
- ✅ Admin user management panel
- ✅ Password hashing (bcrypt)
- ✅ JWT refresh token mechanism
- ✅ Form validation (client + server)
- ✅ Default super_admin account creation on first run
- ✅ Responsive UI with Shadcn/ui
- ✅ Docker Compose for PostgreSQL
- ✅ Basic Playwright tests

### Feature Branches

#### 1. `feature/email-verification`
- Email verification on registration
- Resend integration
- React Email templates
- Verification token management
- Email verification required middleware

**Merge Command:**
```bash
git merge feature/email-verification
```

#### 2. `feature/password-reset`
- Forgot password flow
- Password reset token generation
- Email with reset link
- Password reset form
- Token expiration handling

**Merge Command:**
```bash
git merge feature/password-reset
```

#### 3. `feature/2fa`
- TOTP-based 2FA (Google Authenticator, Authy)
- QR code generation
- Backup codes
- 2FA setup wizard
- 2FA enforcement per user
- Recovery flow

**Merge Command:**
```bash
git merge feature/2fa
```

#### 4. `feature/oauth`
- Google OAuth
- GitHub OAuth
- OAuth account linking
- Social login buttons
- Profile data sync

**Merge Command:**
```bash
git merge feature/oauth
```

#### 5. `feature/magic-link`
- Passwordless magic link login
- Email-based authentication
- Token generation and validation
- Link expiration
- Magic link request rate limiting

**Merge Command:**
```bash
git merge feature/magic-link
```

#### 6. `feature/api-keys`
- API key generation for users
- API key authentication middleware
- Key rotation
- Scoped permissions for API keys
- Usage tracking per key

**Merge Command:**
```bash
git merge feature/api-keys
```

#### 7. `feature/audit-logging`
- Comprehensive audit trail
- Login/logout events
- Permission changes
- Data modifications
- Admin actions log
- Audit log viewer UI
- Structured logging with Pino

**Merge Command:**
```bash
git merge feature/audit-logging
```

#### 8. `feature/rate-limiting`
- Login attempt rate limiting
- API endpoint rate limiting
- Per-user rate limits
- IP-based rate limiting
- Configurable limits
- Rate limit headers

**Merge Command:**
```bash
git merge feature/rate-limiting
```

#### 9. `feature/all` (Optional)
- Includes ALL features merged together
- For users who want everything
- Fully tested integration

**Merge Command:**
```bash
git merge feature/all
```

## 🔐 Core Authentication Flow (Main Branch)

### Registration Flow
1. User submits registration form (username, email, password)
2. Server validates input (Zod schema)
3. Check if username/email already exists
4. Hash password with bcrypt (10 rounds)
5. Create user in database with default role: `user`
6. Generate JWT access token (15 min expiry) + refresh token (7 days)
7. Set httpOnly cookies
8. Redirect to dashboard

### Login Flow
1. User submits login form (email/username + password)
2. Server validates input
3. Find user by email or username
4. Verify password with bcrypt
5. Generate JWT access + refresh tokens
6. Set httpOnly cookies
7. Redirect to dashboard

### Session Management
- **Access Token**: Short-lived (15 min), contains user ID + role
- **Refresh Token**: Long-lived (7 days), rotates on use
- **Storage**: httpOnly, secure, sameSite cookies
- **Middleware**: Validates tokens on protected routes
- **Refresh Endpoint**: `/api/auth/refresh` - issues new access token

### Protected Routes
- Middleware checks for valid access token
- Decodes JWT and attaches user to request
- Role-based access control checks
- Redirects to login if unauthorized

## 👥 Role-Based Access Control (RBAC)

### Default Roles

#### 1. **super_admin**
- Full system access
- Can manage all users
- Can assign/revoke admin roles
- Can access all admin panels
- **Default Account**: Created on first database seed
  - Username: `admin`
  - Email: `admin@example.com`
  - Password: `Admin123!` (must be changed on first login)

#### 2. **admin**
- Can manage regular users
- Can view user list
- Can delete/suspend users
- Cannot manage other admins
- Cannot assign roles

#### 3. **user** (default)
- Access to own dashboard
- Can update own profile
- Can change own password
- No access to admin panels

### Permission Implementation
```typescript
// Middleware example
export function requireRole(...roles: Role[]) {
  return async (req: Request) => {
    const user = await getCurrentUser(req);
    if (!user || !roles.includes(user.role)) {
      throw new UnauthorizedException();
    }
    return user;
  };
}
```

## 🗄 Database Schema (Prisma)

### Core Models (Main Branch)

```prisma
model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  password      String    // bcrypt hashed
  role          Role      @default(USER)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations (added by feature branches)
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}
```

### Extended Models (Feature Branches)

Each feature branch extends the schema:
- `feature/email-verification`: Adds `emailVerified`, `verificationToken`
- `feature/password-reset`: Adds `passwordResetToken`, `passwordResetExpires`
- `feature/2fa`: Adds `twoFactorEnabled`, `twoFactorSecret`, `backupCodes`
- `feature/oauth`: Adds `Account` model for OAuth connections
- `feature/api-keys`: Adds `ApiKey` model
- `feature/audit-logging`: Adds `AuditLog` model

## 🎨 UI/UX Design Principles

1. **Clean & Minimal**: Focus on functionality, not fancy animations
2. **Responsive**: Mobile-first design
3. **Accessible**: WCAG 2.1 AA compliance
4. **Dark Mode Ready**: Using Tailwind + Shadcn theming
5. **Loading States**: Clear feedback on all actions
6. **Error Handling**: User-friendly error messages
7. **Toast Notifications**: Success/error feedback

## 🧪 Testing Strategy

### Playwright E2E Tests (Main Branch)
- ✅ User registration flow
- ✅ Login/logout flow
- ✅ Protected route access
- ✅ Role-based access control
- ✅ Password change
- ✅ Admin user management
- ✅ Token refresh mechanism

### Additional Tests (Feature Branches)
Each feature branch includes its own Playwright tests:
- Email verification flow
- Password reset flow
- 2FA setup and login
- OAuth login flows
- Magic link authentication
- API key usage
- Rate limiting behavior

## 📚 Documentation Structure (Context7)

```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── environment-setup.md
├── core-features/
│   ├── authentication.md
│   ├── authorization.md
│   ├── user-management.md
│   └── session-management.md
├── optional-features/
│   ├── email-verification.md
│   ├── password-reset.md
│   ├── 2fa.md
│   ├── oauth.md
│   ├── magic-link.md
│   ├── api-keys.md
│   ├── audit-logging.md
│   └── rate-limiting.md
├── api-reference/
│   ├── auth-endpoints.md
│   ├── user-endpoints.md
│   └── admin-endpoints.md
├── guides/
│   ├── merging-features.md
│   ├── customization.md
│   ├── deployment.md
│   └── security-best-practices.md
└── database/
    ├── schema.md
    ├── migrations.md
    └── seeding.md
```

## 🚀 User Experience Flow

### For Developers Using This Starter

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/nextjs-starter.git my-app
cd my-app
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Setup Environment
```bash
cp .env.example .env
# Edit .env with your values
```

#### Step 4: Start Database
```bash
docker-compose up -d
```

#### Step 5: Run Migrations & Seed
```bash
npx prisma migrate dev
npx prisma db seed
```

#### Step 6: Start Development Server
```bash
npm run dev
```

#### Step 7: (Optional) Add Features
```bash
# View available feature branches
git branch -r | grep feature

# Merge a feature
git merge feature/email-verification

# Run migrations for the new feature
npx prisma migrate dev

# Install any new dependencies
npm install
```

#### Step 8: (Optional) Run Tests
```bash
npm run test:e2e
```

## 🔧 Environment Variables

### Core (.env.example)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/authdb?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your-super-secret-access-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Default Admin (change immediately in production)
DEFAULT_ADMIN_USERNAME="admin"
DEFAULT_ADMIN_EMAIL="admin@example.com"
DEFAULT_ADMIN_PASSWORD="Admin123!"
```

### Feature-Specific Variables
Each feature branch adds its own environment variables:

**Email Features:**
```env
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
```

**OAuth:**
```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

**Rate Limiting (Upstash):**
```env
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

## 🎯 Success Criteria

### Main Branch MVP
- [ ] User can register with username/email/password
- [ ] User can login and logout
- [ ] JWT tokens work correctly with refresh
- [ ] Protected routes redirect to login
- [ ] RBAC works (user/admin/super_admin)
- [ ] Admin can manage users
- [ ] Default super_admin account created on seed
- [ ] User can change password
- [ ] All Playwright tests pass
- [ ] Docker Compose PostgreSQL works
- [ ] Documentation is complete and clear

### Feature Branches
- [ ] Each feature branch works independently
- [ ] Features can be merged without conflicts
- [ ] Each feature has its own tests
- [ ] Each feature has documentation
- [ ] Database migrations work correctly
- [ ] `feature/all` branch includes everything and is tested

## 📈 Future Enhancements (Post-MVP)

- [ ] WebAuthn/Passkeys support
- [ ] Session management UI (view/revoke sessions)
- [ ] User profile customization
- [ ] Email templates customization
- [ ] Advanced RBAC (custom permissions)
- [ ] Tenant/organization support (multi-tenancy)
- [ ] Blockchain wallet authentication
- [ ] SMS-based 2FA
- [ ] Biometric authentication
- [ ] Advanced audit log filtering and export

## 🤝 Contribution Guidelines

This starter kit is designed to be:
1. **Simple by default** - Don't add complexity to main branch
2. **Feature-complete in branches** - Each feature should be production-ready
3. **Well-documented** - Every feature needs docs
4. **Well-tested** - Every feature needs E2E tests
5. **Type-safe** - Full TypeScript coverage
6. **Secure by default** - Security best practices enforced

---

**Last Updated**: 2025-11-01
**Status**: Planning Phase
