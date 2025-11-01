# API Testing Guide

This guide helps you test the authentication API endpoints using tools like Postman, Thunder Client, or curl.

## Prerequisites

1. **Start the database:**
   ```bash
   docker compose up -d
   ```

2. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

3. **Seed the database (create default super_admin):**
   ```bash
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at: `http://localhost:3000`

---

## Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "confirmPassword": "Test123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "Registration successful",
    "user": {
      "id": "clx...",
      "username": "testuser",
      "email": "test@example.com",
      "role": "USER",
      "createdAt": "2025-11-01T...",
      "updatedAt": "2025-11-01T..."
    }
  }
}
```

**Notes:**
- User is automatically logged in after registration
- Access and refresh tokens are set as httpOnly cookies
- Default role is `USER`

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "emailOrUsername": "admin",
  "password": "Admin123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Login successful",
    "user": {
      "id": "clx...",
      "username": "admin",
      "email": "admin@example.com",
      "role": "SUPER_ADMIN",
      "createdAt": "2025-11-01T...",
      "updatedAt": "2025-11-01T..."
    }
  }
}
```

**Notes:**
- Can login with username OR email
- Access and refresh tokens are set as httpOnly cookies

**Default Super Admin Credentials:**
- Username: `admin`
- Email: `admin@example.com`
- Password: `Admin123!`

---

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:** *(cookies are sent automatically by browser/client)*

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "username": "admin",
      "email": "admin@example.com",
      "role": "SUPER_ADMIN",
      "createdAt": "2025-11-01T...",
      "updatedAt": "2025-11-01T..."
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

---

### 4. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Headers:** *(cookies are sent automatically)*

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Token refreshed successfully"
  }
}
```

**Notes:**
- Call this endpoint when access token expires (15 minutes)
- Implements token rotation (old refresh token deleted, new one created)
- New tokens are set as httpOnly cookies

---

### 5. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:** *(cookies are sent automatically)*

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logout successful"
  }
}
```

**Notes:**
- Deletes refresh token from database
- Clears all authentication cookies

---

## User Management Endpoints

### 6. Get Own Profile

**Endpoint:** `GET /api/users/me`

**Headers:** *(requires authentication)*

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "username": "testuser",
      "email": "test@example.com",
      "role": "USER",
      "createdAt": "2025-11-01T...",
      "updatedAt": "2025-11-01T..."
    }
  }
}
```

---

### 7. Update Own Profile

**Endpoint:** `PATCH /api/users/me`

**Headers:** *(requires authentication)*

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully",
    "user": {
      "id": "clx...",
      "username": "newusername",
      "email": "newemail@example.com",
      "role": "USER",
      "createdAt": "2025-11-01T...",
      "updatedAt": "2025-11-01T..."
    }
  }
}
```

**Notes:**
- Both fields are optional
- Checks for duplicate username/email

---

### 8. Change Password

**Endpoint:** `PATCH /api/users/me/password`

**Headers:** *(requires authentication)*

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmNewPassword": "NewPass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

---

## Admin Endpoints

### 9. List Users (Admin Only)

**Endpoint:** `GET /api/users`

**Headers:** *(requires ADMIN or SUPER_ADMIN role)*

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `search` (optional): Search by username or email
- `role` (optional): Filter by role (USER, ADMIN, SUPER_ADMIN)

**Example:** `GET /api/users?page=1&limit=10&search=admin&role=SUPER_ADMIN`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "clx...",
        "username": "admin",
        "email": "admin@example.com",
        "role": "SUPER_ADMIN",
        "createdAt": "2025-11-01T...",
        "updatedAt": "2025-11-01T..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 10. Get User by ID (Admin Only)

**Endpoint:** `GET /api/users/:id`

**Headers:** *(requires ADMIN or SUPER_ADMIN role)*

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "username": "testuser",
      "email": "test@example.com",
      "role": "USER",
      "createdAt": "2025-11-01T...",
      "updatedAt": "2025-11-01T..."
    }
  }
}
```

---

### 11. Update User by ID (Admin Only)

**Endpoint:** `PATCH /api/users/:id`

**Headers:** *(requires ADMIN or SUPER_ADMIN role)*

**Request Body:**
```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "role": "ADMIN"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User updated successfully",
    "user": {
      "id": "clx...",
      "username": "updateduser",
      "email": "updated@example.com",
      "role": "ADMIN",
      "createdAt": "2025-11-01T...",
      "updatedAt": "2025-11-01T..."
    }
  }
}
```

**Notes:**
- **ADMIN** can only update users with role `USER`
- **ADMIN** cannot change roles
- **SUPER_ADMIN** can update any user and change roles

---

### 12. Delete User by ID (Super Admin Only)

**Endpoint:** `DELETE /api/users/:id`

**Headers:** *(requires SUPER_ADMIN role)*

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

**Notes:**
- Only **SUPER_ADMIN** can delete users
- Cannot delete your own account
- Cascade deletes all user's refresh tokens

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": "Unauthorized - Please log in"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "error": "Forbidden - Requires one of: ADMIN, SUPER_ADMIN"
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "User not found"
}
```

### Conflict (409)
```json
{
  "success": false,
  "error": "Username already taken"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }' \
  -c cookies.txt
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "admin",
    "password": "Admin123!"
  }' \
  -c cookies.txt
```

### Get Current User (with cookies)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## Testing Flow

1. **Register a new user**
   - POST to `/api/auth/register`
   - Verify user is created with role `USER`
   - Verify cookies are set

2. **Login with default super admin**
   - POST to `/api/auth/login` with `admin` / `Admin123!`
   - Verify login successful
   - Verify cookies are set

3. **Get current user**
   - GET to `/api/auth/me`
   - Verify user data is returned

4. **List all users (as admin)**
   - GET to `/api/users`
   - Verify pagination works
   - Try search and role filters

5. **Update user profile**
   - PATCH to `/api/users/me`
   - Change username/email
   - Verify updates persist

6. **Change password**
   - PATCH to `/api/users/me/password`
   - Verify current password is required
   - Verify new password works

7. **Admin operations**
   - Update another user's role
   - Delete a user (as super_admin)

8. **Test refresh token**
   - Wait for access token to expire (or manually test)
   - POST to `/api/auth/refresh`
   - Verify new tokens are issued

9. **Logout**
   - POST to `/api/auth/logout`
   - Verify cookies are cleared
   - Verify `/api/auth/me` returns 401

---

## Postman Collection

You can import this collection into Postman for easier testing:

1. Create a new collection called "NextAuth Starter"
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:3000`
3. Add all endpoints above
4. Postman automatically handles cookies

---

## Common Issues

### 1. Database not running
**Error:** Cannot connect to database
**Solution:** Run `docker compose up -d`

### 2. Migrations not run
**Error:** Table 'users' doesn't exist
**Solution:** Run `npm run db:migrate`

### 3. Default admin doesn't exist
**Error:** Invalid credentials
**Solution:** Run `npm run db:seed`

### 4. JWT secrets not set
**Error:** JWT_ACCESS_SECRET must be set
**Solution:** Create `.env` file from `.env.example`

### 5. Cookies not being sent
**Issue:** API returns 401 even after login
**Solution:**
- In Postman: Enable "Automatically follow redirects" and cookie handling
- In curl: Use `-c cookies.txt` to save and `-b cookies.txt` to send
- In browser: Cookies are handled automatically

---

## Next Steps

After testing the API:
1. Create UI components (login/register forms)
2. Create pages (login, register, dashboard)
3. Write Playwright E2E tests
4. Deploy to production

For more information, see [CLAUDE.md](CLAUDE.md) and [plan/IMPLEMENTATION_PLAN.md](plan/IMPLEMENTATION_PLAN.md).
