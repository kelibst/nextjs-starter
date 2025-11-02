# Deployment Guide

This guide covers deploying your Next.js Authentication Starter Kit to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Railway](#railway)
  - [Render](#render)
  - [Docker](#docker)
  - [VPS/Cloud Server](#vpscloud-server)
- [Database Setup](#database-setup)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ A PostgreSQL database (managed or self-hosted)
- ✅ All environment variables configured
- ✅ Production-ready secrets (JWT secret, database URL)
- ✅ Domain name (optional but recommended)
- ✅ SSL certificate (usually handled by hosting platform)

---

## Environment Variables

Create a `.env.production` file or configure these in your hosting platform:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# JWT Configuration (MUST be different from development!)
JWT_SECRET="your-super-secret-production-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Token Expiry
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"

# Admin Panel (Optional - change this for security!)
ADMIN_PATH="/admin"

# Query Logging (Optional - set to false in production for performance)
LOG_QUERIES="false"
```

**⚠️ CRITICAL SECURITY NOTES:**

1. **NEVER use development secrets in production!**
2. **JWT secrets MUST be at least 32 characters**
3. **Use a strong, random database password**
4. **Never commit `.env.production` to git**

Generate secure secrets:

```bash
# Generate JWT secrets (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 64
```

---

## Deployment Platforms

### Vercel (Recommended)

**Best for:** Easiest deployment, automatic scaling, excellent Next.js support

#### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

#### Step 2: Deploy via GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Go to [Vercel](https://vercel.com):**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings

3. **Configure Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production` (see above)
   - **IMPORTANT:** Add `DATABASE_URL` for your PostgreSQL database

4. **Deploy:**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get your production URL (e.g., `your-app.vercel.app`)

#### Step 3: Setup Database

**Option A: Use Vercel Postgres (Easiest)**

```bash
vercel postgres create
```

Vercel automatically sets `DATABASE_URL` environment variable.

**Option B: Use External Database (Neon, Supabase, Railway)**

1. Create PostgreSQL database on provider
2. Copy connection string
3. Add to Vercel environment variables as `DATABASE_URL`

#### Step 4: Run Database Migrations

**Option 1: Using Vercel CLI**

```bash
# Set environment variables locally for migration
export DATABASE_URL="your-production-database-url"

# Run migration
npx prisma migrate deploy

# Seed database (create super_admin)
npx prisma db seed
```

**Option 2: Using GitHub Actions (Automated)**

See [CI/CD section](#github-actions-cicd) below.

#### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records (Vercel provides instructions)
4. SSL certificate auto-provisioned

**📚 Vercel Docs:** https://vercel.com/docs

---

### Railway

**Best for:** Simple deployments with database included, affordable pricing

#### Step 1: Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub

#### Step 2: Create New Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

#### Step 3: Add PostgreSQL Database

```bash
# Add PostgreSQL service
railway add

# Select PostgreSQL
# Railway automatically creates DATABASE_URL variable
```

#### Step 4: Deploy Application

**Via GitHub (Recommended):**

1. Push code to GitHub
2. Create new project on Railway
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Next.js

**Via CLI:**

```bash
# Deploy
railway up

# Open in browser
railway open
```

#### Step 5: Set Environment Variables

```bash
# Using CLI
railway variables set JWT_SECRET=your-secret-key
railway variables set JWT_REFRESH_SECRET=your-refresh-secret

# Or via Railway Dashboard
# Project → Variables → Add all from .env.production
```

#### Step 6: Run Migrations

```bash
# Connect to Railway environment
railway run npx prisma migrate deploy

# Seed database
railway run npx prisma db seed
```

#### Step 7: Custom Domain

1. Go to Project Settings → Domains
2. Click "Generate Domain" or add custom domain
3. Configure DNS records if using custom domain

**📚 Railway Docs:** https://docs.railway.app

---

### Render

**Best for:** Free tier available, simple setup

#### Step 1: Create Render Account

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub

#### Step 2: Create PostgreSQL Database

1. Click "New" → "PostgreSQL"
2. Name your database
3. Select instance type (Free tier available)
4. Click "Create Database"
5. **Copy Internal Database URL** (used for migrations)

#### Step 3: Create Web Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** Your app name
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** Free or paid

#### Step 4: Add Environment Variables

1. Go to Environment → Add Environment Variables
2. Add all from `.env.production`:
   ```
   DATABASE_URL=<paste Internal Database URL from Step 2>
   JWT_SECRET=<your-secret>
   JWT_REFRESH_SECRET=<your-refresh-secret>
   NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
   NODE_ENV=production
   ```

#### Step 5: Deploy

1. Click "Create Web Service"
2. Render builds and deploys
3. Monitor logs for any errors

#### Step 6: Run Migrations

**Option 1: Render Shell**

1. Go to your Web Service → Shell
2. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

**Option 2: Local with Production DB**

```bash
# Set DATABASE_URL to production database
export DATABASE_URL="<your-render-database-url>"

# Run migrations
npx prisma migrate deploy
npx prisma db seed
```

#### Step 7: Custom Domain (Paid Plans Only)

1. Go to Settings → Custom Domain
2. Add your domain
3. Configure DNS records

**📚 Render Docs:** https://render.com/docs

---

### Docker

**Best for:** Self-hosting, Kubernetes, cloud VMs

#### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"

# Start application
CMD ["node", "server.js"]
```

#### Step 2: Update next.config.ts

Add standalone output:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // Add this line
  // ... rest of config
};
```

#### Step 3: Create .dockerignore

```
node_modules
.next
.git
.env
.env.local
.env.production
npm-debug.log
```

#### Step 4: Build Docker Image

```bash
# Build image
docker build -t nextjs-auth-app .

# Or with specific tag
docker build -t your-username/nextjs-auth-app:1.0.0 .
```

#### Step 5: Run Container

```bash
# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  -e JWT_REFRESH_SECRET="your-refresh-secret" \
  nextjs-auth-app
```

#### Step 6: Docker Compose (Recommended)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/authdb
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - NEXT_PUBLIC_APP_URL=https://yourdomain.com
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=authdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Step 7: Run Migrations

```bash
# Access container
docker exec -it <container-id> sh

# Run migrations
npx prisma migrate deploy
npx prisma db seed
```

**📚 Docker Docs:** https://docs.docker.com

---

### VPS/Cloud Server

**Best for:** Full control, DigitalOcean, AWS EC2, Google Cloud, Azure

#### Step 1: Server Setup (Ubuntu 22.04 Example)

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
apt install -y nginx

# Install certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

#### Step 2: Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE authdb;
CREATE USER authuser WITH PASSWORD 'strongpassword';
GRANT ALL PRIVILEGES ON DATABASE authdb TO authuser;
\q
```

#### Step 3: Setup Application

```bash
# Create app directory
mkdir -p /var/www/nextjs-auth
cd /var/www/nextjs-auth

# Clone your repository
git clone https://github.com/yourusername/your-repo.git .

# Install dependencies
npm ci

# Create .env.production
nano .env.production
# (Paste environment variables)

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Build application
npm run build
```

#### Step 4: Setup PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "nextjs-auth" -- start

# Save PM2 configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
# (Follow the command it gives you)
```

#### Step 5: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/nextjs-auth
```

Paste:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
# Create symlink
ln -s /etc/nginx/sites-available/nextjs-auth /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### Step 6: Setup SSL with Let's Encrypt

```bash
# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

#### Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

**📚 VPS Guides:**
- DigitalOcean: https://www.digitalocean.com/community/tutorials
- AWS EC2: https://docs.aws.amazon.com/ec2/
- Google Cloud: https://cloud.google.com/compute/docs

---

## Database Setup

### Managed PostgreSQL Providers

| Provider | Free Tier | Best For | Docs |
|----------|-----------|----------|------|
| **Neon** | Yes (0.5GB) | Serverless, auto-scaling | [neon.tech](https://neon.tech) |
| **Supabase** | Yes (500MB) | PostgreSQL + extras | [supabase.com](https://supabase.com) |
| **Railway** | Trial credits | Simple, integrated | [railway.app](https://railway.app) |
| **Vercel Postgres** | Pay-as-you-go | Next.js apps on Vercel | [vercel.com/storage/postgres](https://vercel.com/storage/postgres) |
| **AWS RDS** | 12 months free | Enterprise, scalable | [aws.amazon.com/rds](https://aws.amazon.com/rds) |
| **Google Cloud SQL** | Trial credits | Enterprise | [cloud.google.com/sql](https://cloud.google.com/sql) |

### Migration Best Practices

1. **Always backup before migrations:**
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Use `migrate deploy` in production:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Never use `migrate dev` in production!**

4. **Test migrations in staging first**

---

## Post-Deployment Checklist

After deploying, verify everything works:

- [ ] **Health Check:** Visit `/api/health` - should return `{"status": "healthy"}`
- [ ] **Database:** Verify PostgreSQL connection is working
- [ ] **Registration:** Create a test account at `/register`
- [ ] **Login:** Log in with test account at `/login`
- [ ] **Dashboard:** Access dashboard at `/dashboard`
- [ ] **Admin Panel:** Log in as super_admin and access admin panel
- [ ] **Password Change:** Test password change at `/dashboard/profile`
- [ ] **Theme Toggle:** Test dark/light mode switching
- [ ] **Error Pages:** Visit `/non-existent-page` to test 404
- [ ] **SSL Certificate:** Ensure HTTPS is working (green lock icon)
- [ ] **Environment Variables:** Verify all variables are set correctly
- [ ] **Activity Logs:** Check `/admin/logs` for activity tracking
- [ ] **Performance:** Test page load times
- [ ] **Mobile:** Test on mobile devices

### Default Super Admin

After deployment, log in with:

- **Username:** `admin`
- **Email:** `admin@example.com`
- **Password:** `Admin123!`

**⚠️ CRITICAL:** Change the super admin password immediately after first login!

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error:** `Can't reach database server`

**Solution:**
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure IP whitelist includes your app's IP
- For serverless: Use connection pooling (e.g., Prisma Data Proxy, PgBouncer)

#### 2. Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
# Run after npm install
npx prisma generate
```

Add to build script:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

#### 3. Environment Variables Not Loading

**Error:** `JWT_SECRET is not defined`

**Solution:**
- Verify variables are set in hosting platform
- Check for typos in variable names
- Ensure `.env.production` is loaded (not `.env.local`)
- Restart application after adding variables

#### 4. 500 Errors After Deployment

**Error:** Server errors in production

**Solution:**
- Check application logs
- Verify all dependencies are installed
- Run `npm run build` locally to test
- Check Node.js version matches production

#### 5. Migrations Not Applied

**Error:** `Table 'User' does not exist`

**Solution:**
```bash
# Run migrations manually
npx prisma migrate deploy

# Or reset database (WARNING: Deletes all data!)
npx prisma migrate reset --force
```

#### 6. CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solution:**
Update `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || '*' },
      ],
    },
  ];
}
```

---

## Monitoring & Maintenance

### Health Checks

Setup monitoring with:
- **UptimeRobot:** https://uptimerobot.com
- **Pingdom:** https://www.pingdom.com
- **StatusCake:** https://www.statuscake.com

Monitor endpoint: `https://yourdomain.com/api/health`

### Error Tracking

Integrate error tracking:
- **Sentry:** https://sentry.io (recommended)
- **LogRocket:** https://logrocket.com
- **Rollbar:** https://rollbar.com

### Analytics

Add analytics:
- **Vercel Analytics:** Built-in for Vercel deployments
- **Google Analytics:** https://analytics.google.com
- **Plausible:** https://plausible.io (privacy-focused)

### Backups

**Database Backups:**

```bash
# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20250102.sql
```

**Automated Backups:**
- Most managed database providers offer automated backups
- Setup daily backups with retention policy
- Test restore process regularly

### Updates

Keep dependencies updated:

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update Prisma
npm install prisma@latest @prisma/client@latest

# Re-deploy
git add .
git commit -m "chore: update dependencies"
git push
```

---

## Security Recommendations

1. **Change default super admin password** immediately
2. **Use strong, random JWT secrets** (min 64 characters)
3. **Enable HTTPS** (SSL certificate)
4. **Setup firewall rules** (only allow necessary ports)
5. **Regular security updates** (npm update)
6. **Monitor activity logs** for suspicious behavior
7. **Setup rate limiting** (future feature branch)
8. **Enable 2FA for admins** (future feature branch)
9. **Regular database backups** (automated)
10. **Use environment-specific secrets** (dev ≠ prod)

---

## Getting Help

- **Documentation:** Check [CLAUDE.md](./CLAUDE.md) for project details
- **API Testing:** See [API_TESTING.md](./API_TESTING.md)
- **E2E Testing:** See [E2E_TESTING.md](./E2E_TESTING.md)
- **Issues:** Create an issue on GitHub
- **Community:** Join discussions on GitHub

---

**Deployed successfully?** 🎉

Don't forget to:
1. Change default admin password
2. Setup monitoring
3. Configure automated backups
4. Test all features
5. Share your success!
