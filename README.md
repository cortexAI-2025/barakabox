# 🥗 BarakaBox — Food Waste Reduction Marketplace

> A production-ready MVP platform connecting consumers with surplus food from local merchants at discounted prices. Inspired by Too Good To Go, optimized for Morocco and emerging markets.

---

## 🏗️ Architecture

```
barakabox/
├── backend/          # Node.js + Express + Prisma (PostgreSQL)
├── mobile/           # React Native + Expo (iOS & Android)
├── admin/            # React + Vite + TailwindCSS dashboard
└── docker-compose.yml
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo |
| Backend API | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |
| Storage | Cloudinary |
| Notifications | Firebase Cloud Messaging |
| Real-time | Socket.IO (WebSockets) |
| Admin | React + Vite + TailwindCSS |
| Container | Docker + Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### 1. Clone & Configure

```bash
git clone <repo-url>
cd barakabox
cp .env.example .env
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

### 2. Start with Docker (Recommended)

```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`
Admin dashboard at `http://localhost:5173`

### 3. Database Setup

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run db:seed
```

Seed creates:
- Admin: `admin@barakabox.ma` / `Admin@1234`
- Merchant: `merchant@barakabox.ma` / `Merchant@1234`

### 4. Start Backend (Dev)

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev
```

### 5. Start Mobile App

```bash
cd mobile
npm install
npx expo start
# Scan QR with Expo Go app
```

### 6. Start Admin Dashboard

```bash
cd admin
npm install
cp .env.example .env
npm run dev
# Open http://localhost:5173
```

---

## 🔑 Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token secret (change in prod!) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `CLOUDINARY_*` | Cloudinary credentials for image uploads |
| `FIREBASE_*` | Firebase credentials for push notifications |
| `DEFAULT_COMMISSION_RATE` | Default merchant commission (e.g. `0.15`) |

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

---

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login (email or phone) |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/logout` | — | Logout & invalidate token |
| GET | `/auth/me` | ✓ | Get current user |
| PATCH | `/auth/me` | ✓ | Update profile |
| POST | `/auth/change-password` | ✓ | Change password |

**Register request:**
```json
{
  "firstName": "Hassan",
  "lastName": "Alami",
  "email": "hassan@example.com",
  "password": "Secure@123"
}
```

---

### Offers Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/offers/nearby` | Optional | Get nearby offers by GPS |
| GET | `/offers/recommended` | Optional | Get personalized recommendations |
| GET | `/offers/:id` | Optional | Get offer details |
| POST | `/offers` | MERCHANT | Create new offer |
| PATCH | `/offers/:id` | MERCHANT | Update offer |
| GET | `/offers/merchant/my` | MERCHANT | My offers |

**Nearby query params:**
```
?lat=33.5731&lon=-7.5898&radius=10&category=Boulangerie&page=1&limit=20
```

**Offer response includes:**
- `currentPrice` — dynamically calculated based on time remaining
- `scarcityLevel` — `critical|low|medium|high`
- `isExpiringSoon` — boolean, true if < 1 hour left

---

### Orders Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | CUSTOMER | Place order |
| GET | `/orders/my` | CUSTOMER | My orders |
| GET | `/orders/:id` | CUSTOMER | Order details + QR code |
| POST | `/orders/:id/cancel` | CUSTOMER | Cancel order |
| GET | `/orders/merchant/all` | MERCHANT | All merchant orders |
| POST | `/orders/merchant/complete` | MERCHANT | Complete via QR scan |
| POST | `/orders/:id/ready` | MERCHANT | Mark order as ready |

**Create order request:**
```json
{
  "offerId": "clxxxxx",
  "quantity": 1,
  "paymentMethod": "CASH",
  "notes": "Allergie aux noix"
}
```

---

### Merchants Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/merchants` | USER | Register as merchant |
| GET | `/merchants/me` | MERCHANT | My merchant profile |
| PATCH | `/merchants/me` | MERCHANT | Update profile |
| GET | `/merchants/me/analytics` | MERCHANT | Sales analytics |
| GET | `/merchants/:id` | — | Public merchant page |

---

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/kpis` | ADMIN | Platform KPIs |
| GET | `/admin/users` | ADMIN | List users |
| PATCH | `/admin/users/:id` | ADMIN | Update user |
| GET | `/admin/merchants` | ADMIN | List merchants |
| PATCH | `/admin/merchants/:id/status` | ADMIN | Approve/suspend merchant |
| PATCH | `/admin/merchants/:id/featured` | ADMIN | Set featured status |
| GET | `/admin/orders` | ADMIN | All orders |
| GET | `/admin/config` | ADMIN | App config |
| POST | `/admin/config` | ADMIN | Update config |

---

### Reviews Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews` | CUSTOMER | Create review (after completed order) |
| GET | `/reviews/merchant/:id` | — | Get merchant reviews |

---

### Notifications Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | ✓ | Get my notifications |
| GET | `/notifications/unread-count` | ✓ | Unread count |
| POST | `/notifications/mark-read` | ✓ | Mark all as read |

---

## 🧱 Database Schema

Key models and relationships:

```
User ──────┬── Merchant ──┬── Offer ──── Order ──── Payment
           │              │                 │
           └── Order ─────┘                 └── Review
           └── Review
           └── RefreshToken
           └── Notification
```

---

## 🧠 Smart Features

### Dynamic Pricing
Price decreases linearly from `originalPrice` to `minPrice` as the pickup window approaches expiry. Updated every 5 minutes by background scheduler.

```
price(t) = originalPrice - (elapsed/total) × (originalPrice - minPrice)
```

### Recommendation Engine
Scores offers using weighted formula:
- **40%** Proximity (closer = higher score)
- **20%** Category affinity (based on order history)
- **20%** Urgency (< 1 hour = +0.5 score)
- **10%** Scarcity (low quantity = higher urgency)
- **+20%** Featured merchant boost
- **+5%** Random noise (prevents filter bubbles)

### Real-time Updates (WebSocket)
```javascript
// Connect with auth token
const socket = io('http://localhost:3000', {
  auth: { token: accessToken }
});

// Join merchant room (for merchants)
socket.emit('merchant:join', merchantId);

// Listen for events
socket.on('order:new', (order) => { /* new order notification */ });
socket.on('order:status', (order) => { /* status change */ });
```

---

## 🔐 Security

- JWT with short-lived access tokens (15m) + long-lived refresh tokens (30d)
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min per IP)
- Helmet.js security headers
- Input validation via express-validator
- SQL injection prevention via Prisma parameterized queries
- Refresh token rotation (old token invalidated on use)

---

## 💰 Monetization

1. **Commission** — Configurable % taken from each order (default 15%)
2. **Featured Merchants** — Paid placement in recommendations + badge
3. **Future**: Premium subscriptions for merchants (analytics, unlimited offers)

---

## 🌍 Localization

- French (default) — `fr`
- Arabic with RTL support — `ar`

Language is set per user in their profile (`locale` field). The mobile app applies RTL layout automatically for Arabic users.

---

## 🚀 Deployment

### Production Checklist
- [ ] Change all JWT secrets in `.env`
- [ ] Set strong DB password
- [ ] Configure Cloudinary
- [ ] Set up Firebase for push notifications
- [ ] Set `NODE_ENV=production`
- [ ] Configure reverse proxy (nginx/Caddy) for SSL
- [ ] Set up log rotation

### Railway / Render Deployment
```bash
# Backend
railway up --service backend

# Set environment variables in Railway dashboard
```

### Environment
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<generated-64-char-secret>
JWT_REFRESH_SECRET=<generated-64-char-secret>
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📱 Mobile App Build

```bash
cd mobile

# Development
npx expo start

# Build for production
npx eas build --platform android
npx eas build --platform ios
```

---

## 🧪 Testing API

Import the Postman collection or use curl:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.ma","password":"Test@1234"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barakabox.ma","password":"Admin@1234"}'

# Get nearby offers
curl "http://localhost:3000/api/v1/offers/nearby?lat=33.5731&lon=-7.5898&radius=10"
```

---

## 📊 Monitoring

Health check endpoint:
```
GET /health
→ { "status": "ok", "env": "production", "version": "1.0.0" }
```

---

Built with ❤️ for Morocco and the world 🌍
