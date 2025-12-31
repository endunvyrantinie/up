# Coffee Rewards - Referral-Based Website

A full-stack referral-based platform with VIP investment system, daily rewards, and multi-level commission tracking.

## 📚 Documentation

### Essential Guides:
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Production deployment checklist
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)** - Database migration guide (⚠️ Required for production)
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing checklist
- **[SECURITY_REVIEW.md](./SECURITY_REVIEW.md)** - Security best practices
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview

## Features

- **User Authentication**: Registration and login system
- **Referral System**: Unique referral links with 3-level commission tracking
- **VIP Investment System**: 4 VIP levels with daily returns
- **Daily Check-in Rewards**: Streak-based daily rewards
- **Withdrawal System**: Request withdrawals with 24-hour processing
- **Admin Panel**: User management and balance adjustment
- **Mobile-First Design**: Responsive coffee-themed UI

## Tech Stack

- **Frontend**: Next.js 14 (React), Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: JSON file-based storage (for MVP)
- **Authentication**: JWT tokens
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file (optional):
```env
JWT_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@coffee.com
ADMIN_PASSWORD=admin123
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Admin Credentials

- Email: `admin@coffee.com`
- Password: `admin123`

(Change these in production by setting environment variables)

## Project Structure

```
/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── vip/          # VIP purchase endpoints
│   │   ├── checkin/      # Daily check-in
│   │   ├── withdraw/     # Withdrawal requests
│   │   └── admin/        # Admin endpoints
│   ├── dashboard/        # User dashboard
│   ├── admin/            # Admin panel
│   ├── login/            # Login page
│   └── page.tsx          # Home/landing page
├── lib/
│   ├── db.ts             # Database functions
│   ├── auth.ts           # Authentication utilities
│   └── vip.ts            # VIP level configurations
└── data/                 # JSON database files (created at runtime)
```

## Features Explained

### Referral System
- Each user gets a unique 6-character referral code
- 3-level commission structure based on referrer's VIP level
- Commissions are automatically calculated when referred users purchase VIP packages

### VIP Levels
- **VIP 1**: Min $100, 2% daily return
- **VIP 2**: Min $500, 3% daily return
- **VIP 3**: Min $1000, 4% daily return
- **VIP 4**: Min $5000, 5% daily return

### Daily Check-in
- Users can check in once per day
- Rewards increase with streak (max $50)
- Streak resets if missed for more than 1 day

### Withdrawal
- Minimum withdrawal: $50
- 24-hour processing delay (mocked)
- Users can specify payment method and account info

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The app is ready for Vercel deployment with zero configuration.

## ⚠️ Important Notes

### Production Requirements:
- **Database Migration Required:** JSON files don't persist on Vercel. See [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)
- **Environment Variables:** Must set JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD in production
- **Security:** Change all default credentials before production deployment

### Quick Start for Production:
1. Read [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
2. Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Migrate database using [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)
4. Test using [TESTING_GUIDE.md](./TESTING_GUIDE.md)
5. Review [SECURITY_REVIEW.md](./SECURITY_REVIEW.md)

## 📋 Development Notes

- Database uses JSON files stored in `/data` directory (development only)
- For production, **MUST** migrate to a proper database (PostgreSQL, MongoDB, etc.)
- JWT secret should be changed in production
- Admin credentials should be changed via environment variables

## License

This project is built for demonstration purposes.

