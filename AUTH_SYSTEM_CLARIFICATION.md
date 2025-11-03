# Authentication System Clarification

**Important:** This project uses **Custom JWT Authentication**, NOT NextAuth.js

---

## 🔑 Our Authentication System

### What We're Using: **Custom JWT with jose library**

```typescript
// lib/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";

// We handle JWT generation and verification ourselves
```

### What We're NOT Using: ~~NextAuth.js~~

We are **NOT** using NextAuth.js (next-auth package). This is a completely custom authentication implementation.

---

## 📋 Key Components

### 1. JWT Generation & Verification
- **Library:** `jose` (not `jsonwebtoken`, not NextAuth)
- **Files:**
  - `lib/auth/jwt.ts` - JWT creation and verification
  - `lib/auth/constants.ts` - JWT secrets and configuration

### 2. Session Management
- **Custom implementation** using cookies
- **Files:**
  - `lib/auth/session.ts` - Session creation, refresh, destruction
  - Stores refresh tokens in PostgreSQL database

### 3. Password Security
- **Library:** `bcryptjs` (10 rounds)
- **Files:**
  - `lib/auth/password.ts` - Hashing and verification

### 4. Database
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Models:** User, RefreshToken, Invite, ActivityLog

---

## 🚫 Why Not NextAuth?

We chose custom JWT implementation for:

1. **Full Control:** Complete control over authentication flow
2. **Learning:** Understand how authentication works under the hood
3. **Flexibility:** Easy to customize and extend
4. **No Magic:** Explicit code, no hidden abstractions
5. **Simpler:** No adapter configuration, direct database access

See [plan/TECHNICAL_DECISIONS.md](plan/TECHNICAL_DECISIONS.md) for detailed reasoning.

---

## 📦 Dependencies

### Authentication Dependencies:
```json
{
  "jose": "^5.x",           // JWT generation/verification
  "bcryptjs": "^2.4.3",     // Password hashing
  "@prisma/client": "^5.x"  // Database ORM
}
```

### NOT using:
- ❌ `next-auth` / `@auth/core`
- ❌ `jsonwebtoken`
- ❌ `passport`
- ❌ Any other auth library

---

## 🔧 Environment Variables

### Correct Variable Names:

```bash
# JWT Configuration (Custom)
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# App URL (for email links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # ✅ Correct

# Database
DATABASE_URL="postgresql://..."
```

### ❌ NOT using:
```bash
NEXTAUTH_SECRET  # This is NextAuth.js
NEXTAUTH_URL     # This is NextAuth.js (we use NEXT_PUBLIC_APP_URL instead)
```

---

## 📝 Recent Fix

### Issue:
Initially used `NEXTAUTH_URL` environment variable (NextAuth.js convention)

### Fix:
Changed to `NEXT_PUBLIC_APP_URL` (which was already defined in .env.example)

### Files Updated:
- ✅ `lib/email/resend.ts` - Changed to use `NEXT_PUBLIC_APP_URL`
- ✅ `.env.example` - Removed duplicate `NEXTAUTH_URL`, using existing `NEXT_PUBLIC_APP_URL`
- ✅ Documentation files - Updated all references

---

## 🎯 Authentication Flow

### Our Custom Implementation:

1. **Login:**
   ```typescript
   // User submits credentials
   → Find user in database (Prisma)
   → Verify password (bcryptjs)
   → Generate JWT access token (jose)
   → Generate JWT refresh token (jose)
   → Store refresh token in database (Prisma)
   → Set httpOnly cookies
   → Return success
   ```

2. **Protected Routes:**
   ```typescript
   // User accesses protected route
   → Read access token from cookie
   → Verify JWT (jose)
   → Extract user ID and role
   → Allow or deny access
   ```

3. **Token Refresh:**
   ```typescript
   // Access token expired
   → Read refresh token from cookie
   → Verify JWT (jose)
   → Check token exists in database
   → Generate new access token
   → Rotate refresh token (delete old, create new)
   → Set new cookies
   → Return success
   ```

---

## 📂 Authentication File Structure

```
lib/auth/
├── constants.ts          # JWT secrets, expiry times
├── jwt.ts               # JWT generation & verification (jose)
├── password.ts          # Password hashing (bcryptjs)
├── session.ts           # Session management (cookies)
├── middleware.ts        # Auth middleware helpers
└── tokens.ts            # Email verification & reset tokens

app/api/auth/
├── register/route.ts    # Registration endpoint
├── login/route.ts       # Login endpoint
├── logout/route.ts      # Logout endpoint
├── refresh/route.ts     # Token refresh endpoint
├── me/route.ts          # Get current user
├── verify-email/        # Email verification (NEW)
├── send-verification/   # Send verification email (NEW)
├── forgot-password/     # Password reset request (NEW)
└── reset-password/      # Password reset (NEW)
```

---

## ✅ Summary

| Feature | Implementation | Library |
|---------|---------------|---------|
| JWT | Custom | `jose` |
| Passwords | Custom | `bcryptjs` |
| Sessions | Custom cookies | Native Node.js |
| Database | Prisma ORM | `@prisma/client` |
| Email | Resend | `resend` |
| Rate Limiting | Upstash Redis | `@upstash/ratelimit` |

**Key Point:** Everything is **custom built**, no NextAuth.js involved!

---

## 🔍 How to Verify

### Check imports in auth files:
```typescript
// ✅ You'll see:
import { SignJWT, jwtVerify } from "jose";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";

// ❌ You'll NEVER see:
import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
```

### Check environment variables:
```bash
# ✅ You'll see:
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
NEXT_PUBLIC_APP_URL

# ❌ You'll NEVER see:
NEXTAUTH_SECRET
NEXTAUTH_URL (removed - was a mistake)
```

---

## 💡 Why This Matters

Using the correct terminology and variable names:
1. **Avoids confusion** for developers
2. **Clearer documentation** and examples
3. **Easier to understand** what's happening
4. **No misleading** implications about using NextAuth
5. **Consistent** with the rest of the codebase

---

## 🎓 Learning Resources

### Our Stack:
- **jose:** https://github.com/panva/jose
- **bcryptjs:** https://github.com/dcodeIO/bcrypt.js
- **Prisma:** https://www.prisma.io/docs
- **Resend:** https://resend.com/docs

### NOT using:
- ~~NextAuth.js~~ - https://next-auth.js.org

---

**Updated:** 2025-11-03
**Status:** All NextAuth references removed from code, only remains in project name
