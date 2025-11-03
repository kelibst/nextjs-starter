# Next.js Authentication Starter Kit

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A production-ready Next.js authentication starter with JWT, RBAC, and comprehensive admin panel**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment) • [Tech Stack](#-tech-stack)

</div>

---

## 🎯 Features

### 🔐 Core Authentication
- ✅ **Custom JWT Authentication** - Access & refresh tokens with automatic rotation
- ✅ **Session Management** - Secure httpOnly cookies with 15min/7d expiry
- ✅ **Password Security** - bcrypt hashing (10 rounds) with strength validation
- ✅ **Role-Based Access Control** - 3-tier system (USER, ADMIN, SUPER_ADMIN)
- ✅ **Protected Routes** - Next.js Edge middleware for route protection
- ✅ **Security Headers** - HSTS, CSP, X-Frame-Options, XSS protection
- ✅ **Email Verification** - Secure token-based email verification with 24h expiry
- ✅ **Password Reset** - One-time use reset tokens with 1h expiry
- ✅ **Rate Limiting** - Configurable rate limits with Upstash Redis (optional)
- ✅ **Password Visibility Toggle** - Eye icon on all password fields for better UX

### 👥 User Management
- ✅ **Complete REST API** - 15 endpoints for auth & user operations
- ✅ **User Registration** - Email/username with auto-login
- ✅ **User Profile** - View & update profile, change password
- ✅ **User Search** - Real-time search by username/email
- ✅ **Role Filtering** - Filter users by role with pagination

### 🛡️ Admin Panel (WordPress-Style)
- ✅ **Dashboard** - System statistics & real-time metrics
- ✅ **User Management** - Full CRUD with bulk operations
- ✅ **User Invites** - Token-based invite system with role assignment
- ✅ **Activity Logging** - Complete audit trail for compliance (SOC2, GDPR, HIPAA)
- ✅ **CSV Export** - Export users & activity logs
- ✅ **Admin Settings** - System configuration & security settings
- ✅ **Configurable Path** - Custom admin URL via ADMIN_PATH env var

### 🔒 Security & Compliance
- ✅ **Repository Pattern** - Centralized data access with auto password exclusion
- ✅ **Activity Logging** - Track all auth events, failed logins, user changes
- ✅ **Audit Middleware** - Query logging & performance monitoring
- ✅ **Failed Login Tracking** - Detect brute force attacks
- ✅ **IP & User Agent Capture** - Security event context
- ✅ **Log Retention Management** - Configurable cleanup for compliance

### 🎨 User Experience
- ✅ **Dark Mode** - Light/Dark/System theme with persistence
- ✅ **Responsive Design** - Mobile-first with Tailwind CSS
- ✅ **Form Validation** - Real-time validation with Zod schemas
- ✅ **Toast Notifications** - User-friendly feedback with Sonner
- ✅ **Loading States** - Spinner animations for all async operations
- ✅ **Error Pages** - Custom 404, 500, 401, 403 pages

### 🧪 Developer Experience
- ✅ **TypeScript Strict Mode** - Full type safety throughout
- ✅ **Prisma ORM** - Type-safe database operations
- ✅ **E2E Testing** - Playwright test suite (20+ tests)
- ✅ **API Documentation** - Complete API reference with examples
- ✅ **Health Check** - `/api/health` endpoint for monitoring
- ✅ **CI/CD Ready** - GitHub Actions workflows included

### 📦 Optional Features (Feature Branches)
- ⏳ Two-factor authentication (2FA/TOTP)
- ⏳ OAuth (Google, GitHub)
- ⏳ Magic link login
- ⏳ API key authentication
- ⏳ Enhanced audit logging with Pino

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org))
- Docker & Docker Compose installed ([Download](https://www.docker.com/products/docker-desktop))
- Git installed

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/nextjs-auth-starter.git
cd nextjs-auth-starter
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

**Important:** Update the JWT secrets in `.env` for production:

```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start Database

```bash
docker compose up -d
```

This starts PostgreSQL in a Docker container on port 5432.

### 4. Run Migrations & Seed

```bash
npm run db:migrate
npm run db:seed
```

This creates database tables and the default super admin:

- **Username:** `admin`
- **Email:** `admin@example.com`
- **Password:** `Admin123!`

⚠️ **Change this password immediately after first login!**

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 6. (Optional) Setup Email Features

To enable **email verification** and **password reset**:

```bash
# Get free Resend API key from https://resend.com
# Add to .env:
RESEND_API_KEY=re_xxx
FROM_EMAIL=onboarding@resend.dev  # Use this for testing
```

See [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md) for complete setup instructions, including:
- Resend account setup (free tier: 3,000 emails/month)
- Email template customization
- Production domain configuration
- Rate limiting setup with Upstash Redis
- Testing & troubleshooting

### 7. Login & Explore

1. **Landing Page:** [http://localhost:3000](http://localhost:3000)
2. **Login:** [http://localhost:3000/login](http://localhost:3000/login)
3. **Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
4. **Admin Panel:** [http://localhost:3000/admin](http://localhost:3000/admin)
5. **Profile:** [http://localhost:3000/dashboard/profile](http://localhost:3000/dashboard/profile)
6. **Settings:** [http://localhost:3000/dashboard/settings](http://localhost:3000/dashboard/settings)
7. **Password Reset:** Click "Forgot password?" on login page
8. **Email Verification:** Yellow banner on dashboard for unverified users

---

## 🧪 Testing

### Run E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

See [E2E_TESTING.md](E2E_TESTING.md) for detailed testing guide.

### Test API Endpoints

See [API_TESTING.md](API_TESTING.md) for:
- All 15 API endpoints documented
- Request/response examples
- cURL commands & Postman setup
- Authentication flow

**Quick API Test:**

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin","password":"Admin123!"}' \
  -c cookies.txt

# Get current user
curl -X GET http://localhost:3000/api/auth/me -b cookies.txt
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md) | **Email verification & password reset setup guide** |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Complete deployment guide (Vercel, Railway, Docker, VPS) |
| [API_TESTING.md](API_TESTING.md) | API endpoint documentation & testing |
| [E2E_TESTING.md](E2E_TESTING.md) | Playwright testing guide |
| [CLAUDE.md](CLAUDE.md) | Complete project context for AI assistants |
| [plan/PROJECT_OVERVIEW.md](plan/PROJECT_OVERVIEW.md) | Architecture & philosophy |
| [plan/IMPLEMENTATION_PLAN.md](plan/IMPLEMENTATION_PLAN.md) | Implementation roadmap |
| [plan/TECHNICAL_DECISIONS.md](plan/TECHNICAL_DECISIONS.md) | Technology choices explained |
| [plan/ACTIVITIES.md](plan/ACTIVITIES.md) | Development progress log |

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or use GitHub integration for automatic deployments.

### Docker

```bash
# Build image
docker build -t nextjs-auth-app .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  nextjs-auth-app
```

### Other Platforms

Full deployment guides available for:
- **Railway** - Simple deployments with database included
- **Render** - Free tier available
- **VPS/Cloud** - DigitalOcean, AWS EC2, Google Cloud

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🛠 Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database with super_admin
npm run db:studio        # Open Prisma Studio (DB GUI)
npm run db:reset         # Reset database (drop, migrate, seed)

# Docker
docker compose up -d     # Start PostgreSQL
docker compose down      # Stop PostgreSQL
docker compose down -v   # Stop & delete database data

# Code Quality
npm run type-check       # TypeScript type checking
npm run format           # Format with Prettier

# Testing
npm run test:e2e         # Run Playwright tests
npm run test:e2e:ui      # Run tests with UI
npm run test:e2e:debug   # Debug tests
```

---

## 📁 Project Structure

```
nextjs-starter/
├── app/
│   ├── api/                    # API routes (15 endpoints)
│   │   ├── auth/              # Auth endpoints (login, register, logout, etc.)
│   │   ├── users/             # User management endpoints
│   │   └── admin/             # Admin endpoints (stats, invites, logs)
│   ├── (auth)/                # Auth pages (login, register)
│   ├── (dashboard)/           # Protected user pages
│   └── (admin)/               # Admin panel pages
├── components/
│   ├── ui/                    # Shadcn/ui components (16 components)
│   ├── auth/                  # Auth components (login, register forms)
│   ├── dashboard/             # Dashboard components (navbar, sidebar)
│   └── admin/                 # Admin components (tables, dialogs)
├── lib/
│   ├── auth/                  # Auth utilities (JWT, session, password)
│   ├── repositories/          # Data access layer (user, tokens, invites, logs)
│   ├── validations/           # Zod schemas (10+ schemas)
│   ├── api/                   # API helpers (responses, errors)
│   ├── db/                    # Prisma client & middleware
│   ├── hooks/                 # React hooks (useAuth)
│   ├── providers/             # React providers (Auth, Theme)
│   └── utils/                 # Utility functions
├── prisma/
│   ├── schema.prisma          # Database schema (4 models)
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Migration files
├── tests/
│   └── e2e/                   # Playwright E2E tests (20+ tests)
├── plan/                      # Planning documents (8 files)
├── proxy.ts                   # Next.js Edge middleware
├── next.config.ts             # Security headers
└── package.json               # Dependencies
```

---

## 🏗 Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16 | React framework with App Router |
| **Language** | TypeScript | 5 | Static typing & IntelliSense |
| **Database** | PostgreSQL | 16 | Relational database |
| **ORM** | Prisma | 5.22 | Type-safe database client |
| **Auth** | jose | 5 | JWT generation & verification |
| **Passwords** | bcryptjs | 2.4 | Password hashing |
| **Validation** | Zod | 3 | Schema validation |
| **Forms** | React Hook Form | 7 | Form management |
| **UI** | Shadcn/ui | - | Component library |
| **Styling** | Tailwind CSS | 4 | Utility-first CSS |
| **Theme** | next-themes | 0.4 | Dark mode support |
| **Testing** | Playwright | 1.x | E2E testing |
| **Icons** | Lucide React | - | Icon library |
| **Toasts** | Sonner | - | Toast notifications |

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account (auto-sends verification email)
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End session
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/send-verification` - Send/resend email verification
- `GET /api/auth/verify-email?token=xxx` - Verify email with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Management
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (super_admin only)
- `GET /api/users/me` - Get own profile
- `PATCH /api/users/me` - Update own profile
- `PATCH /api/users/me/password` - Change password

### Admin
- `GET /api/admin/stats` - System statistics (admin only)
- `POST /api/admin/invites` - Create user invite (admin only)
- `GET /api/admin/invites` - List invites (admin only)
- `GET /api/admin/logs` - Activity logs (super_admin only)
- `DELETE /api/admin/logs` - Delete old logs (super_admin only)

### Monitoring
- `GET /api/health` - Health check endpoint

See [API_TESTING.md](API_TESTING.md) for detailed documentation.

---

## 🔐 Security Features

### Implemented
- ✅ **Password Security** - bcrypt with 10 rounds, strength validation
- ✅ **JWT Security** - Short-lived access tokens (15min), long-lived refresh (7d)
- ✅ **Token Rotation** - Refresh tokens rotated on use (prevents reuse attacks)
- ✅ **Cookie Security** - httpOnly, secure, sameSite attributes
- ✅ **RBAC** - Role-based access control (3 tiers)
- ✅ **Security Headers** - HSTS, CSP, X-Frame-Options, XSS protection
- ✅ **Input Validation** - Zod schemas on all inputs
- ✅ **SQL Injection** - Prisma parameterized queries
- ✅ **Password Exclusion** - Repository pattern prevents password leaks
- ✅ **Activity Logging** - Audit trail for compliance
- ✅ **Failed Login Tracking** - Detect brute force attempts
- ✅ **Query Logging** - Performance monitoring & security auditing
- ✅ **Email Verification** - Cryptographically secure tokens with 24h expiry
- ✅ **Password Reset** - One-time use tokens with 1h expiry
- ✅ **Rate Limiting** - Configurable limits with Upstash Redis (optional)

### Coming Soon (Feature Branches)
- ⏳ **2FA/TOTP** - Two-factor authentication
- ⏳ **OAuth** - Social login (Google, GitHub)
- ⏳ **Magic Link** - Passwordless authentication
- ⏳ **CSRF Protection** - Cross-site request forgery prevention

---

## 📊 Current Status

**Overall Progress:** ~98% Complete ⭐

**✅ Completed:**
- Phase 1: Foundation & Infrastructure (100%)
- Phase 2: Core Authentication System (100%)
- Phase 3: API Routes (100%)
- Phase 4: Middleware & Security (100%)
- Phase 5: UI Components (100%)
- Phase 6: Pages & Layouts (100%)
- Phase 7: E2E Testing (100%)
- Phase 8: Documentation (100%)
- Phase 9: Polish & Deployment (95%)
- **NEW:** Email Verification System (100%)
- **NEW:** Password Reset System (100%)
- **NEW:** Rate Limiting System (100%)
- **NEW:** Password Visibility Toggle (100%)
- Admin Panel: Complete (100%)
- Theme System: Complete (100%)
- Activity Logging: Complete (100%)
- Repository Pattern: Complete (100%)

**⏳ Optional (Feature Branches):**
- Two-Factor Authentication (2FA)
- OAuth (Google, GitHub)
- Magic Link Authentication
- API Key System

**🎉 Production Ready!**

See [plan/ACTIVITIES.md](plan/ACTIVITIES.md) for detailed progress.

---

## 🌿 Branch Strategy

### Main Branch (Current)
Contains complete, production-ready authentication:
- JWT authentication with refresh tokens
- Role-based access control (3 roles)
- Email verification system
- Password reset flow
- Rate limiting (optional with Upstash)
- Complete admin panel
- Activity logging & compliance
- Dark mode theme system
- E2E test suite
- Password visibility toggle

### Feature Branches (Coming Soon)
Independent opt-in features:
1. `feature/2fa` - Two-factor authentication (TOTP)
2. `feature/oauth` - Google & GitHub OAuth
3. `feature/magic-link` - Passwordless email login
4. `feature/api-keys` - API key authentication
5. `feature/all` - All optional features combined

**Usage:** Merge only the features you need:
```bash
git merge feature/2fa
git merge feature/oauth
```

---

## 🤝 Contributing

This starter kit is designed to be forked and customized. Feel free to:
- ✅ Fork the repository
- ✅ Customize for your needs
- ✅ Add your own features
- ✅ Share improvements via PR

For major changes, please open an issue first to discuss what you'd like to change.

---

## 📝 License

MIT License - feel free to use in your commercial or personal projects!

See [LICENSE](LICENSE) file for details.

---

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres

# Reset database completely
docker compose down -v && docker compose up -d
```

### Migration Issues

```bash
# Reset database (drop, migrate, seed)
npm run db:reset

# Or manually
docker compose down -v
docker compose up -d
npm run db:migrate
npm run db:seed
```

### JWT Secret Issues

Ensure `.env` has JWT secrets (minimum 32 characters):

```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors

```bash
# Regenerate Prisma Client
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support & Resources

- **Documentation:** Check the `plan/` folder for detailed docs
- **API Testing:** See [API_TESTING.md](API_TESTING.md)
- **E2E Testing:** See [E2E_TESTING.md](E2E_TESTING.md)
- **Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues:** [Create an issue](https://github.com/yourusername/nextjs-auth-starter/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/nextjs-auth-starter/discussions)

---

## 🎉 What's Next?

After you've explored the starter kit:

1. **Change default admin password** at `/dashboard/profile`
2. **Setup email features** using [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md)
3. **Customize theme** at `/dashboard/settings`
4. **Create test users** at `/register`
5. **Test email verification** - register and check inbox
6. **Test password reset** - click "Forgot password?" on login
7. **Explore admin panel** at `/admin`
8. **Test API endpoints** with cURL or Postman
9. **Run E2E tests** to verify everything works
10. **Deploy to production** using [DEPLOYMENT.md](DEPLOYMENT.md)
11. **Add optional features** as needed (2FA, OAuth, etc.)

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Prisma**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/yourusername/nextjs-auth-starter/issues) • [Request Feature](https://github.com/yourusername/nextjs-auth-starter/issues) • [Contribute](https://github.com/yourusername/nextjs-auth-starter/pulls)

</div>
