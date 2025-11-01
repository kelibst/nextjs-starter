# Testing Checklist - Backend API

Use this checklist to test the complete authentication system before moving to the frontend.

## ✅ Pre-Test Setup

- [ ] Docker is installed and running
- [ ] PostgreSQL container started: `docker compose up -d`
- [ ] Database migrations run: `npm run db:migrate`
- [ ] Database seeded: `npm run db:seed`
- [ ] Development server running: `npm run dev`
- [ ] `.env` file created from `.env.example`

## 🔐 Authentication Flow Tests

### 1. User Registration
- [ ] **Register new user** - POST `/api/auth/register`
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }
  ```
  - [ ] Returns 201 status
  - [ ] Returns user data (no password)
  - [ ] User has role "USER"
  - [ ] Cookies are set (check in Postman/browser)

- [ ] **Duplicate username** - Try registering same username again
  - [ ] Returns 409 status
  - [ ] Error message: "Username already taken"

- [ ] **Duplicate email** - Try registering same email again
  - [ ] Returns 409 status
  - [ ] Error message: "Email already registered"

- [ ] **Validation errors** - Try invalid inputs
  - [ ] Short password (< 8 chars) - Returns 422
  - [ ] Weak password (no special char) - Returns 422
  - [ ] Invalid email format - Returns 422
  - [ ] Password mismatch - Returns 422

### 2. User Login
- [ ] **Login with username** - POST `/api/auth/login`
  ```json
  {
    "emailOrUsername": "admin",
    "password": "Admin123!"
  }
  ```
  - [ ] Returns 200 status
  - [ ] Returns user data
  - [ ] Cookies are set

- [ ] **Login with email** - POST `/api/auth/login`
  ```json
  {
    "emailOrUsername": "admin@example.com",
    "password": "Admin123!"
  }
  ```
  - [ ] Works the same as username login

- [ ] **Invalid credentials**
  - [ ] Wrong password - Returns 401
  - [ ] Non-existent user - Returns 401
  - [ ] Error message doesn't reveal if user exists

### 3. Session Management
- [ ] **Get current user** - GET `/api/auth/me`
  - [ ] Returns 200 when authenticated
  - [ ] Returns user data
  - [ ] Returns 401 when not authenticated

- [ ] **Refresh token** - POST `/api/auth/refresh`
  - [ ] Returns 200 status
  - [ ] New cookies are set
  - [ ] Old refresh token is deleted from DB

- [ ] **Logout** - POST `/api/auth/logout`
  - [ ] Returns 200 status
  - [ ] Cookies are cleared
  - [ ] Subsequent `/api/auth/me` returns 401
  - [ ] Refresh token deleted from database

## 👤 User Profile Tests

### 4. Own Profile Management
Login as regular user first, then:

- [ ] **Get own profile** - GET `/api/users/me`
  - [ ] Returns 200 status
  - [ ] Returns current user data

- [ ] **Update own profile** - PATCH `/api/users/me`
  ```json
  {
    "username": "updateduser",
    "email": "updated@example.com"
  }
  ```
  - [ ] Returns 200 status
  - [ ] Changes are saved
  - [ ] Can update username only
  - [ ] Can update email only
  - [ ] Duplicate username/email rejected

- [ ] **Change password** - PATCH `/api/users/me/password`
  ```json
  {
    "currentPassword": "Test123!",
    "newPassword": "NewPass123!",
    "confirmNewPassword": "NewPass123!"
  }
  ```
  - [ ] Returns 200 status
  - [ ] Can login with new password
  - [ ] Cannot login with old password
  - [ ] Wrong current password rejected (401)
  - [ ] Password mismatch rejected (422)

## 👮 Admin Tests

### 5. Admin - User Management
Login as admin (`admin` / `Admin123!`), then:

- [ ] **List users** - GET `/api/users`
  - [ ] Returns 200 status
  - [ ] Returns array of users
  - [ ] Includes pagination info

- [ ] **List users with pagination** - GET `/api/users?page=1&limit=5`
  - [ ] Returns correct number of users
  - [ ] Pagination info is correct

- [ ] **Search users** - GET `/api/users?search=admin`
  - [ ] Returns matching users only

- [ ] **Filter by role** - GET `/api/users?role=SUPER_ADMIN`
  - [ ] Returns users with specified role only

- [ ] **Get user by ID** - GET `/api/users/:id`
  - [ ] Returns 200 status
  - [ ] Returns user data
  - [ ] Returns 404 for non-existent ID

- [ ] **Update user (as ADMIN)** - PATCH `/api/users/:id`
  - [ ] Can update USER role users
  - [ ] CANNOT update ADMIN role users (403)
  - [ ] CANNOT update SUPER_ADMIN role users (403)
  - [ ] CANNOT change roles (403)

- [ ] **Delete user (as ADMIN)** - DELETE `/api/users/:id`
  - [ ] Returns 403 (only super_admin can delete)

### 6. Super Admin - Full Access
Login as super_admin (`admin` / `Admin123!`), then:

- [ ] **Update any user** - PATCH `/api/users/:id`
  - [ ] Can update USER role users
  - [ ] Can update ADMIN role users
  - [ ] Can update SUPER_ADMIN role users

- [ ] **Change user role** - PATCH `/api/users/:id`
  ```json
  {
    "role": "ADMIN"
  }
  ```
  - [ ] Role is updated successfully
  - [ ] Can promote USER to ADMIN
  - [ ] Can demote ADMIN to USER
  - [ ] Changes persist in database

- [ ] **Delete user** - DELETE `/api/users/:id`
  - [ ] Returns 200 status
  - [ ] User is deleted from database
  - [ ] User's refresh tokens are deleted (cascade)
  - [ ] CANNOT delete own account (403)

## 🚫 Authorization Tests

### 7. Access Control
- [ ] **Unauthenticated user**
  - [ ] Cannot access `/api/users` (401)
  - [ ] Cannot access `/api/users/:id` (401)
  - [ ] Cannot access `/api/users/me` (401)

- [ ] **Regular USER**
  - [ ] Cannot access `/api/users` (403)
  - [ ] Cannot access `/api/users/:id` (403)
  - [ ] CAN access `/api/users/me` (200)

- [ ] **ADMIN**
  - [ ] CAN list users (200)
  - [ ] CAN view users (200)
  - [ ] CAN update USER role (200)
  - [ ] CANNOT update ADMIN/SUPER_ADMIN (403)
  - [ ] CANNOT delete users (403)
  - [ ] CANNOT change roles (403)

- [ ] **SUPER_ADMIN**
  - [ ] CAN do everything (200)
  - [ ] CANNOT delete self (403)

## 🔒 Security Tests

### 8. Token Security
- [ ] **Access token expiry**
  - [ ] After 15 minutes, access token is invalid
  - [ ] Refresh endpoint generates new token
  - [ ] Old access token no longer works

- [ ] **Refresh token rotation**
  - [ ] Each refresh creates new refresh token
  - [ ] Old refresh token is deleted
  - [ ] Cannot reuse old refresh token

- [ ] **Logout clears tokens**
  - [ ] Cookies are cleared
  - [ ] Refresh token deleted from DB
  - [ ] Cannot use old tokens after logout

### 9. Input Validation
- [ ] **SQL Injection attempts**
  - [ ] `' OR '1'='1` in login fields returns error
  - [ ] Prisma prevents SQL injection

- [ ] **XSS attempts**
  - [ ] `<script>alert('xss')</script>` in username/email
  - [ ] Input is sanitized or rejected

- [ ] **Password strength**
  - [ ] Short passwords rejected
  - [ ] Weak passwords rejected
  - [ ] Password requirements enforced

## 📊 Database Tests

### 10. Database Integrity
- [ ] **Check Prisma Studio** - `npm run db:studio`
  - [ ] Users table has correct data
  - [ ] Passwords are hashed (not plain text)
  - [ ] RefreshTokens table has entries
  - [ ] Refresh tokens have expiry dates

- [ ] **Cascade deletes**
  - [ ] Delete a user
  - [ ] User's refresh tokens are deleted
  - [ ] No orphaned tokens in database

- [ ] **Unique constraints**
  - [ ] Cannot create duplicate usernames
  - [ ] Cannot create duplicate emails
  - [ ] Database enforces uniqueness

## 🎯 Final Checks

### 11. Complete Flow Test
- [ ] Register new user → Login → Update profile → Change password → Logout
  - [ ] All steps work correctly
  - [ ] No errors in console
  - [ ] Database updated correctly

- [ ] Admin workflow
  - [ ] Login as admin
  - [ ] List users
  - [ ] Update user
  - [ ] Try to delete (should fail for admin)
  - [ ] Logout

- [ ] Super admin workflow
  - [ ] Login as super_admin
  - [ ] Create new admin (change user role)
  - [ ] Delete user
  - [ ] Logout

## ✅ Success Criteria

All checkboxes above should be checked before proceeding to frontend development.

## 🐛 Known Issues to Watch For

- [ ] Cookies not being sent in API client (enable cookie handling)
- [ ] Database connection issues (check Docker is running)
- [ ] JWT secrets not set (check .env file)
- [ ] CORS issues (shouldn't happen in dev with same origin)
- [ ] Timestamp timezone issues (check Prisma date handling)

## 📝 Notes

Use this space to note any issues or observations during testing:

```
-
-
-
```

## 🎉 Ready for Frontend?

Once all tests pass, you're ready to build the UI:
- Login/Register pages
- Dashboard
- Admin panel
- User profile pages

See [plan/IMPLEMENTATION_PLAN.md](plan/IMPLEMENTATION_PLAN.md) for next steps!
