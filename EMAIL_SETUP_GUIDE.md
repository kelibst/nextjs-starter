# Email Verification & Password Reset Setup Guide

This guide will help you set up email verification and password reset features in your Next.js Authentication Starter Kit.

---

## 📋 Overview

The starter kit includes two powerful email-based features:

1. **Email Verification** - Verify user email addresses on signup
2. **Password Reset** - Allow users to reset forgotten passwords via email

Both features use:
- ✅ **Resend** - Modern email API (3,000 emails/month free)
- ✅ **React Email** - Beautiful, responsive email templates
- ✅ **Secure tokens** - Cryptographically secure with automatic expiry
- ✅ **Rate limiting** - Protection against abuse (optional Upstash Redis)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Resend API Key

1. Go to https://resend.com
2. Click **"Sign Up"** (free tier: 3,000 emails/month)
3. Verify your email address
4. Go to **"API Keys"** in the dashboard
5. Click **"Create API Key"**
6. Copy the API key (starts with `re_`)

### Step 2: Configure Environment Variables

Open your `.env` file and add:

```bash
# Email Service (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxx"  # Paste your API key here
FROM_EMAIL="onboarding@resend.dev"      # For testing (see below for production)
```

**Note:** `NEXT_PUBLIC_APP_URL` is already defined in your `.env` file. This is used for email links.

### Step 3: Restart Development Server

```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

### Step 4: Test It!

1. **Register a new user:** http://localhost:3000/register
2. **Check your email** for the verification link
3. **Click the link** to verify your account
4. **Test password reset:** Click "Forgot password?" on the login page

✅ **That's it! Your email features are now working.**

---

## 📧 Email Configuration

### For Testing (Development)

Use Resend's test sender address:

```bash
FROM_EMAIL="onboarding@resend.dev"
```

This works immediately without domain verification. Perfect for development!

**Limitations:**
- Only sends to the email address associated with your Resend account
- Not suitable for production

### For Production (Custom Domain)

To send emails to any email address, verify your domain:

#### Option A: Verify Domain with Resend

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides:
   - **MX Record**
   - **TXT Record** (for DKIM)
   - **TXT Record** (for SPF)
5. Wait for verification (usually 5-30 minutes)
6. Update `.env`:

```bash
FROM_EMAIL="noreply@yourdomain.com"  # Use your verified domain
```

#### Option B: Use a Subdomain

Recommended for better email deliverability:

```bash
FROM_EMAIL="noreply@mail.yourdomain.com"  # Subdomain for emails
```

Add DNS records for `mail.yourdomain.com` instead of the root domain.

---

## 🎨 Email Templates

The starter kit includes beautiful, responsive email templates:

### Verification Email Template

**Location:** `emails/verification-email.tsx`

**Features:**
- Professional design with your branding
- Clear call-to-action button
- Fallback plain-text link
- Mobile-responsive
- Dark mode support

**Preview:**
```
┌────────────────────────────────┐
│  Verify your email address    │
│                                │
│  Hi username,                  │
│                                │
│  Thank you for signing up!     │
│  Please verify your email...   │
│                                │
│  [Verify Email Address] ←─ Blue button
│                                │
│  Or copy this link:            │
│  http://localhost:3000/...     │
│                                │
│  Expires in 24 hours           │
└────────────────────────────────┘
```

### Password Reset Email Template

**Location:** `emails/password-reset-email.tsx`

**Features:**
- Professional design
- Clear security messaging
- One-hour expiry notice
- Mobile-responsive

**Preview:**
```
┌────────────────────────────────┐
│  Reset your password           │
│                                │
│  Hi username,                  │
│                                │
│  We received a password reset  │
│  request. Click below:         │
│                                │
│  [Reset Password] ←─ Red button
│                                │
│  Or copy this link:            │
│  http://localhost:3000/...     │
│                                │
│  Expires in 1 hour             │
│  Link can only be used once    │
└────────────────────────────────┘
```

### Customizing Email Templates

Edit the template files to customize:

```typescript
// emails/verification-email.tsx
export function VerificationEmail({
  username,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Customize this content */}
          <Heading style={h1}>Verify your email address</Heading>
          <Text style={text}>Hi {username},</Text>
          {/* ... */}
        </Container>
      </Body>
    </Html>
  );
}

// Customize styles at the bottom of the file
const button = {
  backgroundColor: "#0ea5e9",  // Change button color
  borderRadius: "6px",
  color: "#fff",
  // ...
};
```

---

## 🔐 Security Features

### Token Security

**Email Verification Tokens:**
- 32-byte cryptographically secure random tokens
- 24-hour expiry
- One-time use (cleared after verification)
- Unique per user

**Password Reset Tokens:**
- 32-byte cryptographically secure random tokens
- 1-hour expiry (shorter for security)
- One-time use (cleared after reset)
- Cannot be reused

### Rate Limiting (Optional)

Protect against abuse with rate limiting:

**Without Upstash (Default):**
- Rate limiting is gracefully disabled
- Perfect for development
- No additional setup needed

**With Upstash (Production Recommended):**

1. Go to https://upstash.com
2. Sign up (free tier: 10,000 requests/day)
3. Click **"Create Database"**
4. Choose **"Global"** for best performance
5. Copy the **REST URL** and **REST Token**
6. Add to `.env`:

```bash
# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL="https://xxx-xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXxxx..."
```

7. Restart your server

**Rate Limits (Generous):**
- Email verification: 5 requests per hour per IP
- Password reset: 5 requests per hour per IP
- Login: 10 attempts per 15 minutes per IP
- Registration: 5 attempts per hour per IP

**Rate limit headers in API responses:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1699999999
```

---

## 🎯 Features Overview

### Email Verification

**How it works:**

1. **User registers** at `/register`
2. **System sends verification email** automatically
3. **User clicks link** in email → redirected to `/verify-email?token=xxx`
4. **Token validated** and email marked as verified
5. **User can now access all features**

**User sees:**
- ⚠️ Yellow banner on dashboard: "Email Not Verified"
- 📧 "Resend Verification Email" button
- ✅ Success message after verification

**Code locations:**
- API: `app/api/auth/send-verification/route.ts`
- API: `app/api/auth/verify-email/route.ts`
- Page: `app/(auth)/verify-email/page.tsx`
- Component: `components/auth/verification-notice.tsx`
- Template: `emails/verification-email.tsx`

### Password Reset

**How it works:**

1. **User clicks** "Forgot password?" on login page
2. **User enters email** at `/forgot-password`
3. **System sends reset email** with secure token
4. **User clicks link** in email → redirected to `/reset-password?token=xxx`
5. **User sets new password** with confirmation
6. **Token cleared** and user can login with new password

**User sees:**
- 🔗 "Forgot password?" link on login page
- 📧 Professional email with reset link
- 🔒 Secure password reset form with visibility toggle
- ✅ Success message and redirect to login

**Code locations:**
- API: `app/api/auth/forgot-password/route.ts`
- API: `app/api/auth/reset-password/route.ts`
- Page: `app/(auth)/forgot-password/page.tsx`
- Page: `app/(auth)/reset-password/page.tsx`
- Template: `emails/password-reset-email.tsx`

---

## 🧪 Testing

### Test Email Verification

```bash
# 1. Start the app
npm run dev

# 2. Register a new user (use your real email)
# Go to: http://localhost:3000/register
# Fill in the form and submit

# 3. Check your email inbox
# Look for: "Verify your email address"

# 4. Click the verification button
# Should redirect to: /verify-email?token=xxx
# Should show: "Email Verified!" with green checkmark

# 5. Login and check dashboard
# Verification banner should NOT appear
```

### Test Password Reset

```bash
# 1. Go to login page
# http://localhost:3000/login

# 2. Click "Forgot password?"
# Should redirect to: /forgot-password

# 3. Enter your email and submit
# Should show: "Check Your Email"

# 4. Check your email inbox
# Look for: "Reset your password"

# 5. Click "Reset Password" button
# Should redirect to: /reset-password?token=xxx

# 6. Enter new password (twice)
# Must meet requirements:
# - At least 8 characters
# - Uppercase letter
# - Lowercase letter
# - Number
# - Special character

# 7. Submit and wait for redirect
# Should show: "Password Reset Successful!"
# Auto-redirects to: /login after 3 seconds

# 8. Login with new password
# Should work!
```

### Test Rate Limiting (with Upstash)

```bash
# Test verification rate limit
# 1. Go to: http://localhost:3000/verify-email
# 2. Click "Resend Verification Email" 6 times
# 3. 6th attempt should be blocked with error:
#    "Too many requests. Please try again later."

# Test password reset rate limit
# 1. Go to: http://localhost:3000/forgot-password
# 2. Submit the form 6 times
# 3. 6th attempt should be blocked
```

### Test Email Templates Locally

Preview emails without sending them:

```bash
# Install React Email dev tools
npm install -D @react-email/dev-server

# Start email preview server
npx email dev

# Open: http://localhost:3000
# You'll see all your email templates with live preview
```

---

## 🐛 Troubleshooting

### Problem: Emails Not Sending

**Check 1: API Key**
```bash
# Verify RESEND_API_KEY is set in .env
cat .env | grep RESEND_API_KEY

# Should output:
# RESEND_API_KEY="re_xxxxxxxxxx"
```

**Check 2: Server Logs**
```bash
# Start dev server and watch console
npm run dev

# Register a user and look for:
# - "Failed to send verification email:" (error)
# - No error = email sent successfully
```

**Check 3: Resend Dashboard**
- Go to https://resend.com/emails
- Check **"Logs"** tab
- Look for delivery status:
  - ✅ Delivered
  - ⏳ Queued
  - ❌ Failed (click for details)

**Common causes:**
- API key not set or incorrect
- Using wrong FROM_EMAIL (not verified in production)
- Resend account not verified
- Free tier limit exceeded (3,000/month)
- Email in spam folder

### Problem: Rate Limiting Not Working

This is **expected behavior** if Upstash is not configured!

Rate limiting is **optional** and gracefully disables in development mode when Upstash Redis is not setup.

**To enable rate limiting:**
1. Setup Upstash account (https://upstash.com)
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env`
3. Restart server

### Problem: Verification Link Expired

Verification tokens expire after **24 hours** for security.

**Solution:**
1. Go to dashboard
2. Click **"Resend Verification Email"** in the yellow banner
3. Check email for new verification link
4. Click link within 24 hours

### Problem: Reset Link Expired

Reset tokens expire after **1 hour** for security.

**Solution:**
1. Go to `/forgot-password`
2. Enter your email again
3. Check email for new reset link
4. Click link within 1 hour

### Problem: "Invalid token" Error

**Causes:**
- Token already used (one-time use)
- Token expired
- Token doesn't exist in database
- URL parameter corrupted

**Solution:**
- Request a new verification/reset email
- Copy the full URL from the email
- Make sure you're using the latest email link

### Problem: Verification Banner Still Showing

**Possible causes:**
1. Email not actually verified (check database)
2. Browser cache showing old data
3. User object not updated in session

**Solution:**
```bash
# Check database
npm run db:studio

# Go to User model
# Find your user
# Check: emailVerified = true

# If false, user needs to verify email
# If true but banner still shows:
# - Clear browser cache
# - Logout and login again
```

### Problem: Can't Send to Other Email Addresses

You're using the test sender `onboarding@resend.dev` which only sends to your Resend account email.

**Solution:**
1. Verify your domain with Resend (see **Email Configuration** section above)
2. Update `FROM_EMAIL` in `.env` to your verified domain
3. Restart server

---

## 📊 Monitoring & Analytics

### Check Email Delivery

**Resend Dashboard:**
1. Go to https://resend.com/emails
2. View all sent emails
3. Check delivery status
4. View open/click rates (if enabled)

### Check Rate Limit Usage

**Upstash Dashboard:**
1. Go to https://console.upstash.com
2. Select your database
3. View **"Metrics"** tab
4. Monitor:
   - Total commands
   - Daily requests
   - Storage usage

### Check Activity Logs

**Admin Panel:**
1. Login as admin/super_admin
2. Go to `/admin/logs`
3. Filter by action:
   - `SEND_VERIFICATION_EMAIL`
   - `VERIFY_EMAIL`
   - `REQUEST_PASSWORD_RESET`
   - `RESET_PASSWORD`
4. Export to CSV for analysis

---

## 🔧 Advanced Configuration

### Enforce Email Verification

Require users to verify email before accessing the app:

```bash
# Add to .env
REQUIRE_EMAIL_VERIFICATION="true"
```

Then update your middleware (`proxy.ts`):

```typescript
// Check if email verification is required
if (process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
  const user = await getCurrentUser();

  if (user && !user.emailVerified) {
    // Allow access to verification routes
    if (pathname.startsWith("/verify-email") ||
        pathname.startsWith("/api/auth/verify-email") ||
        pathname.startsWith("/api/auth/send-verification")) {
      return NextResponse.next();
    }

    // Redirect unverified users
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }
}
```

### Custom Token Expiry

Edit `lib/auth/tokens.ts`:

```typescript
/**
 * Generate verification token expiry (24 hours from now)
 */
export function getVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // Change this
  return expiry;
}

/**
 * Generate password reset token expiry (1 hour from now)
 */
export function getPasswordResetExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // Change this
  return expiry;
}
```

### Custom Email Templates

**Change colors:**

```typescript
// emails/verification-email.tsx

const button = {
  backgroundColor: "#0ea5e9", // Change to your brand color
  // ...
};
```

**Change text:**

```typescript
<Text style={text}>
  Thank you for signing up! // Change this
  Please verify your email...
</Text>
```

**Add logo:**

```typescript
import { Img } from "@react-email/components";

<Img
  src="https://yourdomain.com/logo.png"
  width="150"
  height="50"
  alt="Your Company"
  style={{ margin: "0 auto" }}
/>
```

### Change Rate Limits

Edit `lib/rate-limit/index.ts`:

```typescript
export const emailVerificationRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"), // Change limits here
      analytics: true,
      prefix: "@/ratelimit/email-verification",
    })
  : null;
```

---

## 📚 Additional Resources

### Documentation
- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)

### Related Guides
- [FEATURE_COMPLETE.md](FEATURE_COMPLETE.md) - Complete feature documentation
- [TEST_NEW_FEATURES.md](TEST_NEW_FEATURES.md) - Detailed testing guide
- [AUTH_SYSTEM_CLARIFICATION.md](AUTH_SYSTEM_CLARIFICATION.md) - Authentication system overview

### Code Files
- `lib/email/resend.ts` - Email service configuration
- `lib/email/send.ts` - Email sending utilities
- `lib/auth/tokens.ts` - Token generation and validation
- `lib/rate-limit/index.ts` - Rate limiting configuration

---

## ✅ Checklist

Before deploying to production:

- [ ] Resend account created and verified
- [ ] Domain verified with Resend (not using `onboarding@resend.dev`)
- [ ] `RESEND_API_KEY` set in production environment
- [ ] `FROM_EMAIL` updated to verified domain
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] Upstash Redis configured (recommended)
- [ ] Rate limits tested and adjusted if needed
- [ ] Email templates customized with your branding
- [ ] Email deliverability tested (check spam folder)
- [ ] Activity logging working (check admin panel)
- [ ] Verification flow tested end-to-end
- [ ] Password reset flow tested end-to-end
- [ ] Token expiry tested
- [ ] Rate limiting tested (if using Upstash)

---

## 🎉 Summary

You now have:
- ✅ Email verification on signup
- ✅ Password reset via email
- ✅ Beautiful, responsive email templates
- ✅ Secure token system with automatic expiry
- ✅ Optional rate limiting protection
- ✅ Complete activity logging
- ✅ Production-ready email infrastructure

**Next steps:**
1. Test everything in development
2. Verify your domain for production
3. Setup Upstash for rate limiting (recommended)
4. Customize email templates with your branding
5. Deploy to production!

---

**Need help?** Check the troubleshooting section above or create an issue on GitHub.

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.
