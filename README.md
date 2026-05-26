# RateLimiter Pro

> **Production-grade API Rate Limiting & Abuse Protection Platform**
> Built with ASP.NET Core 9, React 18, SQL Server, and AWS Cloud

[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-9.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2019-CC2927?style=flat-square&logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![AWS](https://img.shields.io/badge/AWS-Deployed-FF9900?style=flat-square&logo=amazonaws)](https://aws.amazon.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Integrated-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Screenshots](#screenshots)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Rate Limiting Algorithm](#rate-limiting-algorithm)
- [Abuse Protection Layers](#abuse-protection-layers)
- [Subscription Plans](#subscription-plans)
- [AWS Deployment](#aws-deployment)
- [Todo App Demo](#todo-app-demo)
- [Project Structure](#project-structure)
- [AI Tools Used](#ai-tools-used)

---

## Overview

**RateLimiter Pro** is a cloud-based API protection platform that provides developers and companies with **per-user rate limiting**, **real-time request monitoring**, **API key management**, and **automated abuse detection** — all through a single API key integration.

Instead of building rate limiting from scratch in every project, developers register on RateLimiter Pro, generate an API key, and add a single header to their requests. The platform handles everything else: tracking usage, blocking abusers, logging requests, and providing a full admin dashboard.

### Why does this exist?

| Without RateLimiter Pro | With RateLimiter Pro |
|---|---|
| ❌ Bots can send unlimited requests | ✅ Hard limit per user per minute |
| ❌ Server crashes under load | ✅ Automatic 429 responses |
| ❌ No visibility into API usage | ✅ Real-time dashboard & logs |
| ❌ Weeks of development work | ✅ Integrated in 5 minutes |
| ❌ No abuse detection | ✅ Auto-ban at risk score ≥ 80 |

---

## Live Demo

| Service | URL |
|---|---|
| 🌐 Frontend | [http://ratelimiter-frontend-012619468189-eu-north-1-an.s3-website.eu-north-1.amazonaws.com](http://ratelimiter-frontend-012619468189-eu-north-1-an.s3-website.eu-north-1.amazonaws.com) |
| 🔌 API (Swagger) | [http://ratelimiterapi-env.eba-ppdfdmbw.eu-north-1.elasticbeanstalk.com/swagger](http://ratelimiterapi-env.eba-ppdfdmbw.eu-north-1.elasticbeanstalk.com/swagger) |
| 📝 Todo App Demo | Localhost only (see [Todo App Demo](#todo-app-demo)) |

> ⚠️ This is a test environment. Stripe payments use test mode — no real charges are made.

---

## Screenshots

> All screenshots are located in the `/images` folder.

| Screen | Preview |
|---|---|
| Landing Page | ![Landing](images/landing.png) |
| User Dashboard | ![Dashboard](images/dashboard.png) |
| API Keys Management | ![API Keys](images/api-keys.png) |
| Subscription Plans | ![Plans](images/plans.png) |
| My Request Logs | ![My Logs](images/my-logs.png) |
| Admin — Users | ![Admin Users](images/admin-users.png) |
| Admin — Logs | ![Admin Logs](images/admin-logs.png) |
| Admin — Override | ![Override](images/admin-override.png) |
| Admin — Suspicious | ![Suspicious](images/admin-suspicious.png) |
| Stripe Checkout | ![Stripe](images/stripe-checkout.png) |
| Todo App Demo | ![Todo App](images/todo-app.png) |

---

## Features

### For Developers (Users)

- **Register & Login** — Secure authentication with JWT tokens and brute-force protection (account locked for 2 minutes after 5 failed attempts)
- **API Key Management** — Create up to 5 API keys per account with custom names, scopes (`read`, `write`, `admin`), and optional expiration dates
- **Real-time Dashboard** — Live view of remaining requests, reset countdown timer, API status, and personal risk score — powered by SignalR WebSockets
- **Personal Request Logs** — Paginated history of all requests made with your API keys, filterable by HTTP method and status code, with success rate statistics and top endpoint analysis
- **Subscription Plans** — Upgrade from Free (100 req/min) to Pro (1,000 req/min) or Enterprise (unlimited) via Stripe — cancel anytime with access preserved until end of billing period

### For Admins

- **User Management** — View all registered users, block/unblock accounts, override rate limits individually for any user
- **Global Request Logs** — View the last 100 requests across all users with IP addresses, status codes, endpoints, and timestamps
- **Rate Limit Override** — Set custom per-minute limits for any user regardless of their subscription plan, useful for trusted partners or temporary boosts
- **Suspicious Activity Monitor** — View auto-detected abuse attempts with risk scores, IP addresses, detection reasons, and auto-ban status
- **Risk Score Reset** — After manual review, reset a user's risk score and unblock their account

### Platform-Wide

- **5-Layer Abuse Protection** — Brute force protection, per-user rate limiting, burst traffic detection, behavioral risk scoring, and automatic banning
- **Real-time SignalR Updates** — Dashboard counters update instantly after each request without polling
- **Stripe Webhook Integration** — Plan upgrades and cancellations are processed automatically via Stripe webhooks
- **AWS Cloud Deployment** — Fully deployed on AWS Elastic Beanstalk (API), RDS SQL Server (database), and S3 (frontend)
- **Swagger UI** — Full API documentation with JWT and API Key authentication support

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  React Frontend                       │
│              Hosted on AWS S3                        │
│  Landing · Login · Dashboard · API Keys · Plans      │
│  My Logs · Admin Panel · Stripe Checkout             │
└─────────────────────┬────────────────────────────────┘
                      │  HTTP + JWT / X-API-Key header
┌─────────────────────▼────────────────────────────────┐
│           ASP.NET Core 9 Web API                     │
│         AWS Elastic Beanstalk (.NET 9)               │
│                                                      │
│  ┌─────────────────────────────────────────────┐     │
│  │           RateLimitMiddleware                │     │
│  │  1. Validate JWT or X-API-Key               │     │
│  │  2. Burst Traffic Check → 429               │     │
│  │  3. Rate Limit Check → 429                  │     │
│  │  4. Log Request to DB                       │     │
│  │  5. Send SignalR update to user             │     │
│  └──────────────────────┬──────────────────────┘     │
│                         │                            │
│  Controllers → Services → Entity Framework Core 9   │
│                                                      │
│  SignalR Hub (/hubs/dashboard) for real-time updates │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│              AWS RDS SQL Server                      │
│  Users · RequestLogs · ApiKeys · Plans               │
│  Subscriptions · SuspiciousActivities                │
└──────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│                  Stripe API                          │
│  Checkout Sessions · Webhooks · Subscription Mgmt   │
└──────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
```
| Technology | Version | Purpose |
|---|---|---|
| ASP.NET Core | 9.0 | Web API framework |
| C# | 13 | Primary language |
| Entity Framework Core | 9.0 | ORM & database migrations |
| SQL Server | 2019 | Relational database |
| JWT Bearer | 9.0 | Stateless authentication |
| BCrypt.Net | 4.0 | Secure password hashing |
| Stripe.net | Latest | Payment processing |
| SignalR | 9.0 | Real-time WebSocket communication |
| Swashbuckle | 6.9 | Swagger API documentation |
| DotNetEnv | 3.1 | Environment variable loading |
```
### Frontend
```
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI component library |
| Vite | 6 | Build tool & dev server |
| React Router DOM | 6 | Client-side routing |
| Axios | Latest | HTTP client with interceptors |
| @microsoft/signalr | Latest | Real-time dashboard updates |
| CSS-in-JS | — | Component-scoped styling |
```
### Cloud & Infrastructure
```
| Service | Purpose |
|---|---|
| AWS Elastic Beanstalk | API hosting with auto-scaling |
| AWS RDS (SQL Server Express) | Managed cloud database |
| AWS S3 | Static frontend hosting |
| Stripe | Payment processing & webhooks |
```
---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (local development)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) (optional, for DB inspection)
- [Stripe account](https://stripe.com/) (for payment features)
- [Git](https://git-scm.com/)

---

### Backend Setup

**1. Clone the repository**

```bash
git clone https://github.com/BesianaDauti/rate-limiter-api.git
cd rate-limiter-api/rateLimiterAPI
```

**2. Install dependencies**

```bash
dotnet restore
```

**3. Create your `.env` file** (see [Environment Variables](#environment-variables))

```bash
cp .env.example .env
# Edit .env with your values
```

**4. Apply database migrations**

The application automatically runs migrations on startup. To run manually:

```bash
dotnet ef database update
```

**5. Start the API**

```bash
dotnet run
```

The API will be available at `http://localhost:5183`.
Swagger UI: `http://localhost:5183/swagger`

---

### Frontend Setup

**1. Navigate to frontend directory**

```bash
cd ratelimiter-frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Create `.env` file**

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5183/api
```

**4. Start the development server**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### Environment Variables

#### Backend — `.env`

```env
# Database
DB_CONNECTION=Server=localhost\SQLEXPRESS;Database=RateLimiterDB;Trusted_Connection=True;TrustServerCertificate=True

# JWT Authentication
JWT_KEY=YourSuperSecretKeyHereMustBeAtLeast32Characters!!
JWT_ISSUER=RateLimiterAPI
JWT_AUDIENCE=RateLimiterClient
JWT_EXPIRY_HOURS=24

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRO_PRICE_ID=price_your_pro_price_id
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

> ⚠️ **Never commit your `.env` file to Git.** It is already listed in `.gitignore`.

#### Frontend — `.env`

```env
VITE_API_URL=http://localhost:5183/api
```

---

## API Reference

### Authentication

All protected endpoints require either a **JWT Bearer token** or an **X-API-Key header**.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```http
X-API-Key: rl_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Endpoints

#### Auth — `/api/auth`
```
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | None | Register a new user account |
| `POST` | `/login` | None | Login and receive JWT token |
```
**Register request body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass@123"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "id": 3,
    "token": "eyJhbGci...",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "User"
  }
}
```

**Login error (failed attempt):**
```json
{
  "success": false,
  "message": "Invalid email or password. 3 attempt(s) remaining before lockout."
}
```

**Login error (account locked):**
```json
{
  "success": false,
  "message": "Account locked. Try again in 2 minute(s)."
}
```

---

#### Data — `/api/data`
```
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/status` | JWT or API Key | Get remaining requests & reset time (not rate limited) |
| `GET` | `/test` | JWT or API Key | Send a test request (counts toward limit) |
| `GET` | `/risk-score` | JWT or API Key | Get your current risk score (not rate limited) |
| `GET` | `/my-logs` | JWT or API Key | Get paginated personal request logs |
| `GET` | `/my-stats` | JWT or API Key | Get personal usage statistics |
```
**Status response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "message": "API is active",
    "remainingRequests": 95,
    "resetInSeconds": 42
  }
}
```

**Rate limit exceeded (429):**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "remaining": 0,
  "resetInSeconds": 45,
  "message": "Too many requests. Try again in 45 seconds."
}
```

**Response headers on every allowed request:**
```http
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 60
X-RiskScore: 0
```

**My logs query parameters:**
```
| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `pageSize` | int | 20 | Results per page |
| `method` | string | — | Filter by HTTP method (GET, POST, etc.) |
| `statusCode` | int | — | Filter by status code (200, 429, etc.) |
```
---

#### API Keys — `/api/keys`
```
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | Get all your API keys |
| `POST` | `/` | JWT | Create a new API key (max 5 active) |
| `PUT` | `/{id}/revoke` | JWT | Deactivate a key |
| `PUT` | `/{id}/regenerate` | JWT | Generate a new key value for existing entry |
| `DELETE` | `/{id}` | JWT | Permanently delete a key |
```
**Create key request body:**
```json
{
  "name": "Production App",
  "scopes": "read",
  "expiresAt": "2027-01-01T00:00:00Z"
}
```

> `scopes` can be: `read`, `write`, or `admin`
> `expiresAt` is optional — omit for a key that never expires

**Key response:**
```json
{
  "id": 1,
  "name": "Production App",
  "key": "rl_live_Rk0J2qHcRVGmxGUCbhNp97yv2BnxkZpf",
  "scopes": "read",
  "isActive": true,
  "createdAt": "2026-05-20T10:43:57Z",
  "expiresAt": null,
  "lastUsedAt": "2026-05-24T14:22:11Z"
}
```

> ⚠️ The full key value is only returned **once** at creation or regeneration. Store it securely.

---

#### Plans — `/api/plans`
```
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | None | Get all available subscription plans |
| `GET` | `/my-plan` | JWT | Get your current plan |
| `PUT` | `/users/{userId}` | Admin JWT | Change a user's plan |
```
---

#### Payment — `/api/payment`
```
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/checkout/{planId}` | JWT | Create Stripe checkout session (planId: 2=Pro, 3=Enterprise) |
| `GET` | `/status` | JWT | Get subscription status and end date |
| `POST` | `/cancel` | JWT | Cancel subscription at period end |
| `POST` | `/webhook` | None (Stripe signature) | Stripe webhook receiver |
```
**Checkout response:**
```json
{
  "success": true,
  "message": "Checkout session created.",
  "data": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Subscription status response:**
```json
{
  "success": true,
  "data": {
    "status": "cancel_at_period_end",
    "plan": "Pro",
    "endDate": "2026-06-20T10:43:57Z",
    "cancelAtPeriodEnd": true
  }
}
```

---

#### Admin — `/api/admin`

> All endpoints require `Admin` role JWT.
```
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | List all users with plan and block status |
| `GET` | `/logs` | Last 100 requests across all users |
| `PUT` | `/users/{id}/ratelimit` | Override rate limit for a user |
| `PUT` | `/users/{id}/block` | Block or unblock a user |
| `GET` | `/suspicious` | View suspicious activity log |
| `PUT` | `/users/{id}/reset-risk` | Reset risk score and unblock user |
```
---

## Rate Limiting Algorithm

RateLimiter Pro uses the **Fixed Window Counter** algorithm.

```
Time window: 60 seconds (sliding from the oldest request)

Each request:
  1. Count all requests by this user in the last 60 seconds
  2. If count >= user's limit → reject with 429
  3. If count < user's limit → allow and log

Reset time = (oldest request timestamp + 60 seconds) - now
```

**Example with 100 req/min limit:**

```
10:00:00 → Request #1   (1/100)   ✅
10:00:01 → Request #2   (2/100)   ✅
...
10:00:45 → Request #100 (100/100) ✅
10:00:46 → Request #101 (100/100) ❌ 429 — resetInSeconds: 14
10:01:00 → Request #1 expires, window shifts
10:01:01 → New request  (1/100)   ✅
```

> **Note:** The `/api/data/status` and `/api/data/risk-score` endpoints are **excluded from rate limiting** — they do not consume your request budget and are designed for frequent polling.

---

## Abuse Protection Layers

The platform implements **5 independent layers** of abuse protection:

### Layer 1 — Brute Force Protection
Tracks failed login attempts per user account. After **5 consecutive failures**, the account is automatically locked for **2 minutes**. The exact number of remaining attempts is returned in the error message.

### Layer 2 — Per-User Rate Limiting
Every authenticated request (via JWT or API Key) is counted toward the user's rate limit. Limits are:
- Free plan: 100 requests/minute
- Pro plan: 1,000 requests/minute
- Enterprise plan: effectively unlimited (999,999/minute)
- Admin accounts: 1,000/minute by default, overrideable

### Layer 3 — Burst Traffic Detection
Regardless of the per-minute limit, if a user sends more than **200 requests within any 10-second window**, the request is immediately blocked with a 429 response and flagged as suspicious. This prevents second-level DoS attacks where a user stays under the per-minute limit but sends traffic in rapid bursts.

### Layer 4 — Behavioral Risk Scoring
After each request, the system calculates a risk score (0–100) for the user based on four behavioral signals:
```
| Signal | Points Added | Condition |
|---|---|---|
| Burst traffic | +40 | Active burst detected |
| High 429 rate | +30 | ≥10 blocked requests in the last hour |
| Moderate 429 rate | +15 | ≥5 blocked requests in the last hour |
| Endpoint scanning | +20 | ≥10 unique endpoints in 5 minutes |
| IP sharing | +10 | ≥5 distinct users from same IP in the last hour |
```
Risk levels:
- **0–24:** ✅ Safe
- **25–49:** ⚡ Medium — monitored
- **50–79:** ⚠️ High — logged as suspicious activity
- **80–100:** 🚫 Critical — account automatically blocked

### Layer 5 — Auto-Ban
When a risk score reaches or exceeds **80**, the account is automatically blocked without any admin intervention. The blocking event is logged to the suspicious activities table with the reason and exact score. Admins can review and reset the risk score to restore access.

---

## Subscription Plans
```
| Plan | Price | Rate Limit | Description |
|---|---|---|---|
| **Free** | €0/month | 100 req/min | For testing and small projects |
| **Pro** | €29/month | 1,000 req/min | For production applications |
| **Enterprise** | €199/month | Unlimited | For high-traffic platforms |
```
All plans include:
- Up to 5 API keys per account
- Full request logging
- Real-time dashboard
- Abuse detection

### Upgrading

Click **Upgrade** on the Plans page. You will be redirected to a Stripe-hosted checkout page. After successful payment, your rate limit is updated immediately via webhook.

**Test card for Stripe (test mode):**
```
Card number: 4242 4242 4242 4242
Expiry:      Any future date
CVC:         Any 3 digits
```

### Cancelling

When you cancel, your subscription is set to `cancel_at_period_end`. You retain full Pro/Enterprise access until the end of your current billing period. After that, your account automatically downgrades to the Free plan — handled by the `customer.subscription.deleted` Stripe webhook event.

---

## AWS Deployment

### Infrastructure
```
| Component | AWS Service | Details |
|---|---|---|
| API | Elastic Beanstalk | .NET 9 on Amazon Linux 2023 |
| Database | RDS SQL Server Express | db.t3.micro |
| Frontend | S3 Static Website | Account regional namespace |
| Secrets | EB Environment Properties | All `.env` values |
```
### Deploying the API

```powershell
# Publish
dotnet publish -c Release -o ./publish

# Add Procfile
Set-Content -Path "./publish/Procfile" -Value "web: dotnet RateLimiterAPI.dll"

# Create ZIP (must use ZipFile — Compress-Archive causes Linux path errors)
Add-Type -Assembly System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    (Resolve-Path "./publish").Path,
    (Resolve-Path ".").Path + "\ratelimiter-api.zip",
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false
)
```

Upload `ratelimiter-api.zip` to Elastic Beanstalk via the AWS Console under **Upload and Deploy**.

### Required Environment Variables in Elastic Beanstalk

Set these under **Configuration → Software → Environment Properties**:

```
DB_CONNECTION
JWT_KEY
JWT_ISSUER
JWT_AUDIENCE
JWT_EXPIRY_HOURS
STRIPE_SECRET_KEY
STRIPE_PRO_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID
STRIPE_WEBHOOK_SECRET
```

### Deploying the Frontend

```bash
# Set production API URL
echo "VITE_API_URL=http://[your-elasticbeanstalk-url]/api" > .env

# Build
npm run build

# Upload contents of dist/ to your S3 bucket
```

Enable **Static Website Hosting** on the S3 bucket with `index.html` as both the index and error document (required for React Router SPA routing).

### Bucket Policy (replace with your bucket ARN)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name-here/*"
    }
  ]
}
```

---

## Todo App Demo

The `/todo-app` folder contains a standalone React application that demonstrates how **any developer can integrate RateLimiter Pro** into their own project using only an API Key.

### How it works

```
User visits Todo App
       ↓
Enters API Key: rl_live_xxxx
       ↓
API Key validated against RateLimiter Pro
       ↓
Each todo added = 1 GET /api/data/test request
       ↓
Remaining counter decreases in real-time
       ↓
After 100 requests → 429 error with countdown
       ↓
Admin sees all requests in logs panel
```

### Running the Todo App

```bash
cd todo-app
npm install
npm run dev
```

Open `http://localhost:5174`, enter your API key from RateLimiter Pro, and start adding todos.

> The Todo App itself has no backend. All rate limiting is handled entirely by RateLimiter Pro through the API key.

---

## Project Structure

```
ratelimiter-pro/
│
├── rateLimiterAPI/                  # ASP.NET Core 9 Backend
│   ├── Controllers/
│   │   ├── AuthController.cs        # Register, Login
│   │   ├── ApiController.cs         # Status, Test, Logs, Stats
│   │   ├── ApiKeyController.cs      # CRUD for API Keys
│   │   ├── AdminController.cs       # User management, Logs, Override
│   │   ├── PlanController.cs        # Subscription plans
│   │   └── PaymentController.cs     # Stripe checkout, webhook
│   ├── Data/
│   │   └── AppDbContext.cs          # EF Core DbContext
│   ├── DTOs/
│   │   ├── Auth/                    # RegisterDto, LoginDto, AuthResponseDto
│   │   ├── Admin/                   # UserInfoDto, BlockUserDto, UpdateRateLimitDto
│   │   ├── ApiKey/                  # CreateApiKeyDto, ApiKeyResponseDto
│   │   ├── Plan/                    # PlanResponseDto, UpdateUserPlanDto
│   │   └── Common/                  # ApiResponseDto<T>
│   ├── Hubs/
│   │   └── DashboardHub.cs          # SignalR real-time hub
│   ├── Middleware/
│   │   └── RateLimitMiddleware.cs   # Core rate limiting + logging
│   ├── Migrations/                  # EF Core auto-generated migrations
│   ├── Models/
│   │   ├── User.cs
│   │   ├── RequestLog.cs
│   │   ├── ApiKey.cs
│   │   ├── Plan.cs
│   │   ├── Subscription.cs
│   │   └── SuspiciousActivity.cs
│   ├── Services/
│   │   ├── AuthService.cs           # Register, Login, brute-force protection
│   │   ├── TokenService.cs          # JWT generation and validation
│   │   ├── RateLimitService.cs      # Fixed window algorithm
│   │   ├── ApiKeyService.cs         # Key generation and validation
│   │   ├── AbuseDetectionService.cs # Risk scoring and auto-ban
│   │   ├── PlanService.cs           # Plan management
│   │   └── StripeService.cs         # Payments and webhooks
│   ├── .env                         # 🔒 Not committed — local secrets
│   ├── .env.example                 # Template for environment setup
│   └── Program.cs                   # App configuration and startup
│
├── ratelimiter-frontend/            # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Navigation with role-based links
│   │   │   └── ProtectedRoute.jsx   # Route guard for auth and admin
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Public homepage
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx        # Real-time usage stats
│   │   │   ├── ApiKeys.jsx          # Key management
│   │   │   ├── Plans.jsx            # Subscription management
│   │   │   ├── MyLogs.jsx           # Personal request history
│   │   │   ├── PaymentSuccess.jsx   # Post-Stripe redirect
│   │   │   └── admin/
│   │   │       ├── Users.jsx
│   │   │       ├── Logs.jsx
│   │   │       ├── Override.jsx
│   │   │       └── Suspicious.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with interceptors
│   │   └── App.jsx                  # Route definitions
│   ├── .env                         # 🔒 Not committed
│   └── .env.example
│
├── todo-app/                        # Standalone API Key demo app
│   └── src/
│       └── App.jsx                  # Single-file React todo demo
│
├── images/                          # Screenshots for README
│   ├── landing.png
│   ├── dashboard.png
│   ├── api-keys.png
│   ├── plans.png
│   ├── my-logs.png
│   ├── admin-users.png
│   ├── admin-logs.png
│   ├── admin-override.png
│   ├── admin-suspicious.png
│   ├── stripe-checkout.png
│   └── todo-app.png
│
├── AI-log.txt                       # AI tools usage log
└── README.md                        # This file
```

---

## AI Tools Used

See [`AI-log.txt`](./AI-log.txt) for a detailed log of all AI-assisted development.

AI assistance was used for:
- Generating boilerplate service and controller code
- Debugging error messages (e.g. EF Core migration issues, Stripe webhook signature errors)
- Advising on architecture decisions (e.g. Fixed Window vs Token Bucket, polling vs SignalR)
- Writing middleware logic for rate limiting and abuse detection
- Explaining AWS deployment steps and troubleshooting 502/404 errors
- Code review and improvement suggestions

All generated code was reviewed, tested, and adapted for the specific requirements of this project.

---

## License

This project was developed as a coursework submission for the **Cloud Computing** course at **AAB College**, 2026.

---

<div align="center">
  <strong>Built by Besiana Dauti · Cloud Computing · 2026</strong>
</div>