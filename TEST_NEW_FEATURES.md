# Testing New Features - Quick Guide

**Features:** Email Verification, Password Reset, Rate Limiting, Password Visibility

---

## 🚀 Quick Start

### 1. Setup (5 minutes)

```bash
# Copy environment variables
cp .env.example .env

# Edit .env and add:
# - RESEND_API_KEY (get from https://resend.com)
# - FROM_EMAIL (use onboarding@resend.dev for testing)
# - Optional: UPSTASH_REDIS_REST_URL and TOKEN for rate limiting

# Start the app
npm run dev
```

### 2. Get Resend API Key (Free Tier)

1. Go to https://resend.com
2. Sign up (free - 3,000 emails/month)
3. Go to API Keys
4. Create new API key
5. Copy to `.env` as `RESEND_API_KEY=re_xxx`
6. Use `onboarding@resend.dev` as `FROM_EMAIL` for testing

---

## ✅ Test Checklist

### Test 1: Password Visibility Toggle (No setup required!)

1. Go to http://localhost:3000/login
2. Type a password in the password field
3. **Click the eye icon** 👁️
4. ✅ Password should become visible
5. **Click the eye-off icon** 👁️‍🗨️
6. ✅ Password should be hidden again

**Also test on:**
- Register page: 2 password fields (password + confirm)
- Dashboard → Profile → Change Password: 3 password fields

---

### Test 2: Email Verification Flow (Requires Resend API key)

#### 2.1 Register New User

1. Go to http://localhost:3000/register
2. Fill in the form:
   - Username: `testuser`
   - Email: YOUR_EMAIL@example.com
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
3. Submit

**Expected:**
- ✅ Registration successful
- ✅ Automatically logged in
- ✅ Message: "Registration successful. Please check your email to verify your account."

#### 2.2 Check Verification Email

1. Check your email inbox
2. **Look for email with subject:** "Verify your email address"
3. ✅ Email should have:
   - Nice blue button "Verify Email Address"
   - Plain text link as backup
   - Professional styling

#### 2.3 Verify Email

1. Click the verification button in email
2. Should redirect to: `/verify-email?token=xxx`

**Expected:**
- ✅ Green checkmark icon
- ✅ "Email Verified!" heading
- ✅ Success message
- ✅ "Go to Dashboard" button

#### 2.4 Test Verification Banner

Before verifying email:
1. Go to http://localhost:3000/dashboard
2. ✅ Should see yellow banner at top: "Email Not Verified"
3. ✅ Banner has "Resend Verification Email" button
4. Click resend button
5. ✅ Should receive new verification email
6. ✅ Toast notification: "Verification email sent!"

After verifying email:
1. Go to dashboard
2. ✅ Banner should NOT appear

---

### Test 3: Password Reset Flow (Requires Resend API key)

#### 3.1 Request Password Reset

1. Go to http://localhost:3000/login
2. Click "Forgot password?" link
3. Enter your email address
4. Click "Send Reset Link"

**Expected:**
- ✅ Success message: "Check Your Email"
- ✅ "We've sent password reset instructions to your email address"

#### 3.2 Check Reset Email

1. Check your email inbox
2. **Look for email with subject:** "Reset your password"
3. ✅ Email should have:
   - Red "Reset Password" button
   - Plain text link as backup
   - 1-hour expiry notice
   - Professional styling

#### 3.3 Reset Password

1. Click "Reset Password" button in email
2. Should redirect to: `/reset-password?token=xxx`
3. Enter new password: `NewPass123!@#`
4. Confirm password: `NewPass123!@#`
5. Click "Reset Password"

**Expected:**
- ✅ Green checkmark icon
- ✅ "Password Reset Successful!" heading
- ✅ Auto-redirect to login after 3 seconds

#### 3.4 Login with New Password

1. Go to http://localhost:3000/login
2. Login with:
   - Email/Username: `testuser` or your email
   - Password: `NewPass123!@#` (your new password)
3. ✅ Should login successfully!

#### 3.5 Test Token Expiry

1. Request another password reset
2. Wait 1+ hours (or manually change `passwordResetExpires` in database to past date)
3. Try to use the reset link
4. ✅ Should see error: "Password reset token has expired"
5. ✅ "Request New Reset Link" button available

---

### Test 4: Rate Limiting

#### 4.1 Login Rate Limit (Without Upstash - gracefully disabled)

1. Go to http://localhost:3000/login
2. Try to login with wrong password 15 times

**Without Upstash configured:**
- ✅ All attempts allowed (rate limiting disabled in development)
- ✅ No errors

**With Upstash configured:**
- ✅ After 10 attempts: "Too many login attempts. Please try again in 15 minutes."
- ✅ Response includes rate limit headers

#### 4.2 Register Rate Limit

1. Go to http://localhost:3000/register
2. Try to register 6 times

**Without Upstash:**
- ✅ All attempts allowed

**With Upstash:**
- ✅ After 5 attempts: "Too many registration attempts. Please try again later."

#### 4.3 Check Rate Limit Headers (With Upstash)

1. Open browser Dev Tools (F12)
2. Go to Network tab
3. Make a login request
4. Check response headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1699999999
```

✅ Headers present

---

## 🎯 Complete Test Results

### Password Visibility Toggle
- [ ] Shows/hides password on login form
- [ ] Shows/hides password on register form (2 fields)
- [ ] Shows/hides password on change password form (3 fields)
- [ ] Eye icon animates smoothly
- [ ] Works when form is disabled

### Email Verification
- [ ] Verification email received after registration
- [ ] Email has professional styling and clear CTA
- [ ] Verification link works
- [ ] Success page shows after verification
- [ ] Verification banner shows for unverified users
- [ ] Resend button works
- [ ] Banner disappears after verification
- [ ] Expired token shows error message

### Password Reset
- [ ] Forgot password link on login page
- [ ] Request reset email works
- [ ] Reset email received with professional styling
- [ ] Reset link works
- [ ] Can set new password
- [ ] Password visibility toggle works on reset form
- [ ] Can login with new password
- [ ] Expired token shows error message
- [ ] Token can only be used once

### Rate Limiting
- [ ] Works gracefully without Upstash (disabled)
- [ ] Login rate limit enforced (with Upstash)
- [ ] Register rate limit enforced (with Upstash)
- [ ] Password reset rate limit enforced (with Upstash)
- [ ] Email verification rate limit enforced (with Upstash)
- [ ] Rate limit headers in response (with Upstash)
- [ ] Clear error messages when rate limited

---

## 🐛 Known Issues / Expected Behavior

### Rate Limiting in Development
**Issue:** Rate limiting doesn't work without Upstash
**Expected:** This is intentional! Rate limiting gracefully disables in development mode when Upstash is not configured. This makes development easier.
**Solution:** Setup Upstash for testing rate limits, or deploy to production.

### Emails Not Sending
**Issue:** Not receiving emails
**Possible causes:**
1. `RESEND_API_KEY` not set in `.env`
2. `FROM_EMAIL` not verified (use `onboarding@resend.dev` for testing)
3. Email in spam folder
4. Resend API quota exceeded (free tier: 3,000/month)

**Solution:** Check Resend dashboard for delivery status and errors.

### Token Already Used
**Issue:** "Invalid password reset token" after using reset link once
**Expected:** This is intentional! Reset tokens can only be used once for security.
**Solution:** Request a new password reset.

---

## 📊 Test Summary Template

```
Date: ___________
Tester: ___________

✅ Password Visibility Toggle: PASS / FAIL
✅ Email Verification Flow: PASS / FAIL
✅ Password Reset Flow: PASS / FAIL
✅ Rate Limiting (with Upstash): PASS / FAIL / NOT TESTED
✅ UI/UX (styling, animations): PASS / FAIL
✅ Error Handling: PASS / FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🚀 Ready for Production?

Before deploying:

1. **✅ All tests pass**
2. **✅ Email delivery working**
3. **✅ Upstash configured** (for rate limiting)
4. **✅ Environment variables set** in production
5. **✅ Domain verified with Resend** (for production emails)
6. **⚠️ Consider tightening rate limits** (currently generous for development)

---

## 💡 Tips

### For Faster Testing
- Use `onboarding@resend.dev` as `FROM_EMAIL` (Resend's test sender)
- Use your real email for registration to receive test emails
- Use browser incognito for testing multiple registrations

### For Production Testing
- Verify your domain with Resend
- Setup Upstash Redis
- Test with real users
- Monitor email delivery rates
- Check activity logs in admin panel

---

**Need Help?** See [FEATURE_COMPLETE.md](FEATURE_COMPLETE.md) for detailed documentation.
