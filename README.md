# 🦉 OwlSync Backend

A scalable and secure **Node.js + Express.js** backend powering **OwlSync**, an intelligent expense tracking application that automatically parses transaction SMS, stores financial data, and provides real-time analytics and insights.

---

## 🚀 Features

- 🔐 JWT Authentication (Access & Refresh Tokens)
- 📧 Email Verification with OTP
- 🔑 Forgot & Reset Password
- 📱 SMS Transaction Sync
- 💳 Automatic Transaction Parsing
- 📊 Financial Analytics & Dashboard APIs
- 📈 Expense Trends & Statistics
- ⚡ Redis Caching (Upstash)
- 🗄 MongoDB Atlas
- 🛡 Rate Limiting & Security Middleware
- 🌍 RESTful API Architecture
- 📝 Structured Logging
- 🔄 Background Cache Invalidation
- 📦 Production Ready

---

# 🏗 Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas |
| Cache | Upstash Redis |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| Validation | Express Validator |
| Security | Helmet, CORS, Rate Limiter |
| Environment | dotenv |

---

# 📂 Project Structure

```
src/
│
├── config/
│   ├── db.js
│   ├── redis.js
│   └── mail.js
│
├── controllers/
│
├── middleware/
│
├── models/
│
├── routes/
│
├── services/
│
├── utils/
│
├── validators/
│
└── server.js
```

---

# ✨ Core Features

## Authentication

- User Registration
- Email Verification
- Login
- Refresh Token
- Logout
- Forgot Password
- Reset Password
- Change Password

---

## Transactions

- Upload Transactions
- Sync SMS Transactions
- Get Transactions
- Pagination
- Filters
- Search
- Monthly Summary

---

## Analytics

- Dashboard Summary
- Income vs Expense
- Monthly Comparison
- Daily Statistics
- Spending Categories
- Transaction Patterns
- Financial Insights

---

## Cache

Redis is used for:

- Dashboard
- Analytics
- Statistics
- Recent Transactions

Automatic cache invalidation occurs after transaction updates.

---

# ⚙ Environment Variables

Create a `.env` file.

```env
PORT=5000

NODE_ENV=development

MONGO_URI=

JWT_SECRET=
JWT_REFRESH_SECRET=

REDIS_URL=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

EMAIL_FROM=

CLIENT_URL=
```

---

# 📦 Installation

Clone repository

```bash
git clone https://github.com/<your-username>/OwlSync-Backend.git
```

Install dependencies

```bash
npm install
```

Create environment file

```bash
cp .env.example .env
```

Run development server

```bash
npm run dev
```

Run production

```bash
npm start
```

---

# 🌐 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/register |
| POST | /api/auth/verify-email |
| POST | /api/auth/login |
| POST | /api/auth/refresh-token |
| POST | /api/auth/logout |
| POST | /api/auth/forgot-password |
| POST | /api/auth/reset-password |

---

## Transactions

| Method | Endpoint |
|---------|----------|
| POST | /api/transactions/upload |
| GET | /api/transactions |
| GET | /api/transactions/stats |
| GET | /api/transactions/analytics |
| GET | /api/transactions/compare |
| GET | /api/transactions/pattern |
| GET | /api/transactions/sync-status |

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Email Verification
- Rate Limiting
- Helmet
- CORS Protection
- Input Validation
- MongoDB Sanitization
- XSS Protection

---

# 🚀 Deployment

Backend is optimized for deployment on:

- Render
- Railway
- Fly.io
- DigitalOcean
- AWS EC2

Recommended Production Stack

- **Backend:** Render
- **Database:** MongoDB Atlas
- **Cache:** Upstash Redis
- **Frontend:** Vercel

---

# 📊 Performance

- Redis Response Caching
- MongoDB Indexing
- Optimized Queries
- Pagination
- Lean Queries
- Cache Versioning
- Connection Pooling

---

# 🛠 Development

Start Development

```bash
npm run dev
```

Build

```bash
npm install
```

Production

```bash
npm start
```

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature/my-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Rohan Raj**

Backend Engineer

- Node.js
- Express.js
- MongoDB
- Redis
- REST APIs
- System Design

---

⭐ If you found this project useful, consider giving it a star on GitHub!
