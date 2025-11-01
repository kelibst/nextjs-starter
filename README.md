# Next.js Authentication Starter Kit

A production-ready Next.js authentication starter with JWT tokens, role-based access control, and optional feature branches.

## 🎯 Features

### Core (Main Branch)
- ✅ Custom JWT authentication (access + refresh tokens)
- ✅ Role-based access control (USER, ADMIN, SUPER_ADMIN)
- ✅ Complete REST API for auth and user management
- ✅ Password hashing with bcrypt
- ✅ Session management with token rotation
- ✅ Protected routes with Next.js middleware
- ✅ Security headers configured
- ✅ TypeScript strict mode
- ✅ Prisma ORM with PostgreSQL
- ✅ Zod validation schemas
- ✅ Comprehensive error handling

### Optional (Feature Branches - Coming Soon)
- Email verification
- Password reset
- Two-factor authentication (2FA)
- OAuth (Google, GitHub)
- Magic link login
- API key authentication
- Audit logging
- Rate limiting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Docker and Docker Compose installed (for PostgreSQL)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd nextjs-starter
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and update the JWT secrets (or use the defaults for development).

### 3. Start Database

```bash
docker compose up -d
```

This starts PostgreSQL in a Docker container on port 5432.

### 4. Run Database Migrations

```bash
npm run db:migrate
```

This creates the database tables.

### 5. Seed Database

```bash
npm run db:seed
```

This creates the default super admin account:
- **Username:** `admin`
- **Email:** `admin@example.com`
- **Password:** `Admin123!`

⚠️ **Change this password immediately in production!**

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing the API

The backend API is complete and ready to test! See [API_TESTING.md](API_TESTING.md) for:
- All 12 API endpoints documented
- Request/response examples
- cURL commands
- Postman setup instructions
- Testing flow

### Quick Test with cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin","password":"Admin123!"}' \
  -c cookies.txt
```

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Complete project context for AI assistants
- **[API_TESTING.md](API_TESTING.md)** - API endpoint documentation and testing guide
- **[plan/PROJECT_OVERVIEW.md](plan/PROJECT_OVERVIEW.md)** - Project architecture and philosophy
- **[plan/IMPLEMENTATION_PLAN.md](plan/IMPLEMENTATION_PLAN.md)** - Step-by-step implementation guide
- **[plan/TECHNICAL_DECISIONS.md](plan/TECHNICAL_DECISIONS.md)** - Why we chose each technology
- **[plan/ACTIVITIES.md](plan/ACTIVITIES.md)** - Development progress log

## 🗄 Database Commands

```bash
# Start PostgreSQL
docker compose up -d

# Stop PostgreSQL
docker compose down

# Reset database (delete all data)
docker compose down -v && docker compose up -d

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset and seed (during development)
npm run db:reset
```

## 🛠 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Testing (Coming Soon)
npm run test:e2e         # Run Playwright tests
npm run test:e2e:ui      # Run tests with UI
npm run test:e2e:debug   # Debug tests
```

## 📁 Project Structure

```
nextjs-starter/
├── app/
│   ├── api/              # API routes (authentication, users)
│   ├── (auth)/           # Auth pages (login, register) - Coming Soon
│   └── (dashboard)/      # Protected pages - Coming Soon
├── components/
│   ├── ui/               # Shadcn/ui components
│   ├── auth/             # Auth components - Coming Soon
│   └── dashboard/        # Dashboard components - Coming Soon
├── lib/
│   ├── auth/             # ✅ Authentication utilities
│   ├── validations/      # ✅ Zod validation schemas
│   ├── api/              # ✅ API helpers
│   └── db/               # ✅ Prisma client
├── prisma/
│   ├── schema.prisma     # ✅ Database schema
│   └── seed.ts           # ✅ Database seeding
├── plan/                 # ✅ Planning documents
└── tests/                # Playwright tests - Coming Soon
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT with short expiry (15 min access, 7 days refresh)
- ✅ Refresh token rotation (prevents token reuse)
- ✅ httpOnly cookies (XSS protection)
- ✅ Secure cookies in production (HTTPS only)
- ✅ Role-based access control
- ✅ Security headers (HSTS, CSP, X-Frame-Options, etc.)
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma ORM)

## 🏗 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL
- **ORM:** Prisma 5.22.0
- **Authentication:** Custom JWT (jose library)
- **Password:** bcryptjs
- **Validation:** Zod
- **Forms:** React Hook Form
- **UI:** Shadcn/ui + Tailwind CSS v4
- **Testing:** Playwright
- **Icons:** Lucide React

## 🎯 Current Status

**Completed:**
- ✅ Phase 1: Foundation & Infrastructure (100%)
- ✅ Phase 2: Core Authentication System (100%)
- ✅ Phase 3: API Routes (100%)
- ✅ Phase 4: Middleware & Security (100%)

**In Progress:**
- 🔄 Phase 5: UI Components
- 🔄 Phase 6: Pages (Login, Register, Dashboard)

**Overall Progress:** ~50% (Backend complete! 🎉)

See [plan/ACTIVITIES.md](plan/ACTIVITIES.md) for detailed progress.

## 🌿 Branch Strategy

### Main Branch
Minimal working authentication system (currently implemented).

### Feature Branches (Coming Soon)
1. `feature/email-verification` - Email verification on signup
2. `feature/password-reset` - Forgot password flow
3. `feature/2fa` - Two-factor authentication
4. `feature/oauth` - Google & GitHub OAuth
5. `feature/magic-link` - Passwordless login
6. `feature/api-keys` - API key authentication
7. `feature/audit-logging` - Audit trail
8. `feature/rate-limiting` - Rate limiting
9. `feature/all` - All features combined

Users can merge feature branches as needed: `git merge feature/email-verification`

## 🤝 Contributing

This is a starter kit designed to be forked and customized. Feel free to:
- Fork the repository
- Customize for your needs
- Add your own features
- Share improvements

## 📝 License

MIT License - feel free to use in your projects!

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose ps

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Migration Issues
```bash
# Reset database completely
npm run db:reset

# This will:
# 1. Drop database
# 2. Run all migrations
# 3. Seed with default admin
```

### JWT Secret Issues
Make sure your `.env` file has JWT secrets set (minimum 32 characters).

## 📞 Support

- Check [API_TESTING.md](API_TESTING.md) for API documentation
- Check [CLAUDE.md](CLAUDE.md) for development context
- Check [plan/](plan/) folder for detailed documentation

---

**Ready to test the API?** See [API_TESTING.md](API_TESTING.md) to get started!
