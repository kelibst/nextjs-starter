# Technical Decisions - Next.js Authentication Starter Kit

This document records all major technical decisions made for this project, along with the reasoning behind them.

---

## Authentication & Security

### 1. Custom JWT Implementation (vs NextAuth.js)

**Decision**: Build custom JWT authentication using the `jose` library

**Reasoning**:
- **Full control**: Can customize every aspect of auth flow
- **Lightweight**: No large library overhead (~100KB saved)
- **Learning value**: Users understand exactly how auth works
- **Flexibility**: Easy to extend with custom features
- **No black box**: All code is visible and modifiable

**Trade-offs**:
- More implementation time upfront
- Must handle security ourselves (but we follow best practices)
- No built-in OAuth (but we add it in feature branch)

**Implementation Details**:
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry, stored in database
- httpOnly, secure, sameSite cookies
- Token rotation on refresh

---

### 2. Password Hashing with bcrypt

**Decision**: Use `bcryptjs` library with 10 rounds

**Reasoning**:
- Industry standard for password hashing
- Adaptive (can increase rounds as computers get faster)
- Built-in salt generation
- Pure JavaScript (no native dependencies)

**Why not alternatives**:
- ❌ Argon2: Requires native dependencies (harder to deploy)
- ❌ scrypt: Node.js built-in but less widely tested
- ✅ bcrypt: Battle-tested, widely used, well-documented

---

### 3. JWT Library: jose

**Decision**: Use `jose` library for JWT operations

**Reasoning**:
- Modern, lightweight JWT library
- Web Crypto API based (fast, secure)
- TypeScript-first
- Better than `jsonwebtoken` (uses deprecated crypto)
- Supports JWE (encrypted JWTs) if needed later

---

### 4. Session Storage: httpOnly Cookies

**Decision**: Store JWT tokens in httpOnly cookies (not localStorage)

**Reasoning**:
- **Security**: httpOnly prevents XSS attacks
- **Secure flag**: HTTPS-only in production
- **sameSite**: CSRF protection
- **Automatic**: Browser sends cookies automatically

**Why not localStorage**:
- ❌ Vulnerable to XSS attacks
- ❌ Accessible by any JavaScript code
- ❌ No built-in CSRF protection

---

### 5. Refresh Token Strategy

**Decision**: Store refresh tokens in database, rotate on use

**Reasoning**:
- **Revocability**: Can invalidate sessions instantly
- **Security**: Rotation prevents token reuse attacks
- **Tracking**: Can see all active sessions per user
- **Logout everywhere**: Can clear all refresh tokens

**Implementation**:
- Refresh token in database (RefreshToken table)
- Delete old token, create new one on refresh
- Link to user (cascade delete when user deleted)

---

## Database

### 6. PostgreSQL with Prisma ORM

**Decision**: Use PostgreSQL as database with Prisma as ORM

**Reasoning**:

**PostgreSQL**:
- Robust, production-ready RDBMS
- ACID compliant
- Great for relational data (users, roles, sessions)
- Free and open-source
- Excellent TypeScript support

**Prisma**:
- TypeScript-first ORM (fully type-safe)
- Intuitive schema definition
- Auto-generated migrations
- Great developer experience
- Client is auto-generated (no manual types)

**Why not alternatives**:
- ❌ Drizzle: Less mature, smaller ecosystem (though excellent)
- ❌ TypeORM: More boilerplate, less type-safe
- ❌ Raw SQL: Too much manual work, SQL injection risks

---

### 7. Database Schema Design

**Decision**: Normalize data, use UUIDs for IDs

**Reasoning**:
- **cuid() for IDs**: Collision-resistant, sortable, URL-safe
- **Normalized**: Separate RefreshToken table (not in User model)
- **Enums for roles**: Type-safe, enforced at DB level
- **Timestamps**: createdAt, updatedAt for all models
- **Cascade deletes**: Clean up related data automatically

---

## Frontend

### 8. Shadcn/ui Component Library

**Decision**: Use Shadcn/ui for UI components

**Reasoning**:
- **Copy-paste philosophy**: Code lives in your project (no npm package)
- **Customizable**: Full control over components
- **Tailwind-based**: Consistent with our stack
- **Accessible**: Built on Radix UI (WCAG compliant)
- **Modern**: Beautiful default styling

**Why not alternatives**:
- ❌ MUI/Chakra: Too heavy, opinionated
- ❌ DaisyUI: Less flexible
- ❌ Headless UI: More work to style

---

### 9. Form Handling: React Hook Form + Zod

**Decision**: Use React Hook Form for forms, Zod for validation

**Reasoning**:

**React Hook Form**:
- Performance: Re-renders only when needed
- TypeScript support
- Easy integration with Zod
- Less boilerplate than Formik

**Zod**:
- TypeScript-first validation
- Schema reusable on client + server
- Great error messages
- Infer TypeScript types from schemas

**Example**:
```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginInput = z.infer<typeof loginSchema>;
```

---

### 10. State Management: React Context

**Decision**: Use React Context for auth state (not Zustand/Redux)

**Reasoning**:
- Auth state is simple (current user + loading)
- Context is built-in (no extra dependencies)
- Server components + client components work well
- Can upgrade to Zustand later if needed

**Auth Context Provides**:
- `user`: Current user object or null
- `loading`: Boolean for initial load
- `login()`: Function to set user after login
- `logout()`: Function to clear user

---

## Architecture

### 11. Next.js App Router (vs Pages Router)

**Decision**: Use Next.js 13+ App Router

**Reasoning**:
- **Modern**: Latest Next.js paradigm
- **Server Components**: Better performance
- **Layouts**: Nested layouts are cleaner
- **Server Actions**: Simplified data mutations (optional use)
- **Future-proof**: Pages Router is legacy

---

### 12. Monolithic Repo (vs Monorepo)

**Decision**: Single repository, not a monorepo

**Reasoning**:
- Simpler for starter kit users
- No need for workspace management
- Easy to clone and start
- Can be converted to monorepo if needed

---

### 13. Branch-Based Feature Opt-In

**Decision**: Use Git branches for optional features

**Reasoning**:
- **Clear separation**: Core vs optional features
- **Easy to adopt**: `git merge feature/email-verification`
- **No configuration needed**: No feature flags or config files
- **Version controlled**: All features tracked in Git
- **Independent development**: Features don't block each other

**Alternative Considered**:
- ❌ Feature flags: Complex, runtime overhead
- ❌ CLI tool: Extra tool to maintain, harder to customize
- ✅ Git branches: Simple, powerful, no extra tooling

---

## Testing

### 14. Playwright for E2E Testing

**Decision**: Use Playwright for end-to-end tests

**Reasoning**:
- **Modern**: Best-in-class E2E testing (2024)
- **Fast**: Parallel execution, fast traces
- **Cross-browser**: Chromium, Firefox, WebKit
- **Developer experience**: Great debugging tools
- **Auto-wait**: Less flaky tests

**Why not alternatives**:
- ❌ Cypress: Slower, no native multi-tab support
- ❌ Selenium: Outdated, clunky API
- ✅ Playwright: Best choice for modern apps

---

### 15. No Unit Tests (Initially)

**Decision**: Focus on E2E tests, skip unit tests for MVP

**Reasoning**:
- E2E tests provide more value for auth flows
- Limited time, prioritize high-impact testing
- Integration tests catch more real bugs
- Can add unit tests later for utilities

**What We Test**:
- ✅ Full auth flows (register, login, logout)
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Session management
- ❌ Individual function unit tests (not yet)

---

## DevOps

### 16. Docker Compose for Local Development

**Decision**: Provide docker-compose.yml for PostgreSQL

**Reasoning**:
- **Easy setup**: `docker-compose up -d` and you're running
- **Consistent**: Everyone has same database version
- **Isolated**: Doesn't affect local machine
- **Production-like**: Closer to real deployment

**Configuration**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: authuser
      POSTGRES_PASSWORD: authpassword
      POSTGRES_DB: authdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

### 17. Environment Variables Management

**Decision**: Use `.env.example` with inline comments

**Reasoning**:
- Clear documentation of required variables
- Easy to copy and customize
- Next.js has built-in .env support
- No extra libraries needed (no dotenv-safe, etc.)

**Structure**:
```env
# Database
DATABASE_URL="postgresql://..."

# JWT Secrets (CHANGE THESE!)
JWT_ACCESS_SECRET="your-secret-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Documentation

### 18. Context7 for Documentation

**Decision**: Use Context7 for project documentation

**Reasoning**:
- **User's preference**: Specifically requested
- **Modern**: Good for technical docs
- **Search**: Built-in search functionality
- **Markdown-based**: Easy to write and maintain

---

### 19. Documentation Structure

**Decision**: Organize docs by user journey, not by technical layer

**Structure**:
```
docs/
├── getting-started/     # New users start here
├── core-features/       # What's included
├── optional-features/   # Feature branches
├── api-reference/       # API docs
├── guides/              # How-to guides
└── database/            # Schema and migrations
```

**Reasoning**:
- Users find what they need faster
- Follows documentation best practices
- Clear separation of concerns

---

## Code Quality

### 20. TypeScript Strict Mode

**Decision**: Enable TypeScript strict mode

**Reasoning**:
- Catch more bugs at compile time
- Better IDE autocomplete
- Forces good type discipline
- Industry best practice

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

---

### 21. ESLint Configuration

**Decision**: Use Next.js recommended ESLint config + custom rules

**Custom Rules**:
- No console.logs in production
- Enforce consistent import order
- Prefer const over let
- No unused variables (error, not warning)

---

### 22. Path Aliases

**Decision**: Use `@/` prefix for absolute imports

**Configuration**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"]
    }
  }
}
```

**Reasoning**:
- Cleaner imports: `@/components/Button` vs `../../components/Button`
- Easier refactoring
- Standard in Next.js projects

---

## Security

### 23. Security Headers in next.config.ts

**Decision**: Add security headers via Next.js config

**Headers Added**:
```typescript
{
  headers: async () => [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
    ],
  }],
}
```

**Reasoning**:
- Clickjacking protection (X-Frame-Options)
- MIME type sniffing prevention
- XSS attack mitigation
- Referrer leakage prevention

---

### 24. No Sensitive Data in Tokens

**Decision**: JWT payload contains only user ID + role

**What's Included**:
```typescript
{
  userId: string,
  role: Role,
  iat: number,
  exp: number
}
```

**What's NOT Included**:
- ❌ Email
- ❌ Username
- ❌ Password hash
- ❌ Personal information

**Reasoning**:
- Tokens can be decoded by anyone
- Smaller token size
- Fetch full user data from database when needed

---

### 25. Password Requirements

**Decision**: Enforce minimum password requirements

**Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Reasoning**:
- Balance between security and usability
- Prevents weak passwords
- Industry standard
- Can be customized by users

---

## Feature-Specific Decisions

### 26. Email Service: Resend

**Decision**: Use Resend for email features

**Reasoning**:
- Modern, developer-friendly API
- Generous free tier (100 emails/day)
- React Email integration
- Good deliverability
- No credit card required for free tier

**Why not alternatives**:
- ❌ SendGrid: Complex setup, poor free tier
- ❌ AWS SES: Requires AWS account, complicated
- ❌ Nodemailer: Need SMTP server

---

### 27. 2FA: TOTP (Not SMS)

**Decision**: Use TOTP (Google Authenticator) for 2FA, not SMS

**Reasoning**:
- **More secure**: SMS can be intercepted (SIM swapping)
- **No cost**: TOTP is free, SMS costs money
- **Works offline**: Authenticator app doesn't need internet
- **Privacy**: No phone number required

**Library**: `speakeasy` for TOTP generation/verification

---

### 28. OAuth Library: Arctic

**Decision**: Use Arctic for OAuth implementation

**Reasoning**:
- Lightweight, modern OAuth library
- TypeScript-first
- Supports Google, GitHub, and many providers
- Less abstraction than NextAuth (more control)
- Easy to understand and customize

---

### 29. Rate Limiting: Upstash Redis

**Decision**: Use Upstash for rate limiting (optional: in-memory fallback)

**Reasoning**:
- **Upstash**: Serverless Redis, generous free tier
- **Fast**: Redis is perfect for rate limiting
- **Scalable**: Works in distributed environments
- **Fallback**: In-memory rate limiting if no Redis (single server only)

**Alternative**: Custom middleware with in-memory Map (for simple deployments)

---

### 30. Audit Logging: Pino

**Decision**: Use Pino for structured logging

**Reasoning**:
- Fast (benchmarked fastest Node.js logger)
- Structured JSON logs (easy to parse)
- Low overhead
- Production-ready
- Great for audit trails

**Log Format**:
```json
{
  "level": "info",
  "time": 1699889234567,
  "userId": "abc123",
  "action": "LOGIN",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

---

## Deployment

### 31. Vercel-Ready (with Postgres)

**Decision**: Optimize for Vercel deployment

**Reasoning**:
- Next.js creators (best support)
- Zero-config deployment
- Edge functions support
- Easy environment variables
- Free tier for hobby projects

**Database Options**:
- Vercel Postgres (Neon)
- Supabase Postgres
- Railway
- Self-hosted

---

### 32. Docker Support

**Decision**: Provide Dockerfile for containerized deployment

**Reasoning**:
- Works anywhere (AWS, GCP, Azure, self-hosted)
- Consistent environment
- Easy to scale
- CI/CD friendly

---

## Future-Proofing

### 33. Database Schema Extensibility

**Decision**: Design schema to be extended by feature branches

**How**:
- Core models in main branch (User, RefreshToken)
- Feature branches add fields and models
- Migrations are additive (no destructive changes)
- Optional fields are nullable

**Example**:
```prisma
model User {
  id       String  @id
  email    String
  password String

  // Added by feature/email-verification
  emailVerified DateTime?

  // Added by feature/2fa
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?
}
```

---

### 34. API Versioning Strategy

**Decision**: No API versioning in v1 (for simplicity)

**Reasoning**:
- Starter kit, not production SaaS
- Users will modify API anyway
- Can add versioning later if needed (`/api/v1/...`)

**If Versioning Needed**:
```
/api/v1/auth/login
/api/v2/auth/login
```

---

### 35. Internationalization (i18n)

**Decision**: Not included in v1, but structure supports it

**Why Not Included**:
- Adds complexity
- Most auth messages are English
- Users can add it if needed

**How to Add Later**:
- Use `next-intl` or similar
- Extract hardcoded strings
- Add locale support

---

## Decisions NOT Made (Intentionally Open)

### 36. Frontend Styling Approach

**Decision**: Provide Tailwind + Shadcn/ui, but users can swap

**Reasoning**:
- Tailwind is default, but easy to remove
- Shadcn components can be replaced
- No CSS-in-JS lock-in

---

### 37. Deployment Target

**Decision**: Support multiple deployment targets

**Supported**:
- ✅ Vercel
- ✅ Docker (any provider)
- ✅ VPS (Nginx + PM2)
- ✅ Netlify (with caveats)

---

### 38. Database Choice (Flexibility)

**Decision**: PostgreSQL is default, but Prisma supports others

**Easy to Switch To**:
- MySQL
- SQLite (dev/small projects)
- CockroachDB
- PlanetScale

**Prisma Makes It Easy**:
- Change `provider` in schema.prisma
- Update DATABASE_URL
- Run migrations

---

## Summary

These technical decisions prioritize:
1. **Security**: Industry best practices
2. **Developer Experience**: Modern tools, clear code
3. **Flexibility**: Easy to customize and extend
4. **Simplicity**: Start small, add what you need
5. **Type Safety**: TypeScript throughout
6. **Performance**: Fast, optimized
7. **Maintainability**: Clear structure, good documentation

---

**Last Updated**: 2025-11-01
**Status**: Finalized
