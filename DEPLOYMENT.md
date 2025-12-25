# Deployment Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables** (Optional)
   Create a `.env.local` file:
   ```env
   JWT_SECRET=your-secret-key-here
   ADMIN_EMAIL=admin@coffee.com
   ADMIN_PASSWORD=admin123
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Add environment variables in Vercel dashboard:
     - `JWT_SECRET` (generate a strong random string)
     - `ADMIN_EMAIL` (your admin email)
     - `ADMIN_PASSWORD` (your admin password)
   - Click Deploy

3. **Post-Deployment**
   - The `/data` directory will be created automatically
   - Default admin credentials can be used if env vars aren't set
   - For production, change admin credentials via environment variables

## Daily VIP Returns Processing

The system includes an endpoint to process daily VIP returns:
- **Endpoint**: `/api/vip/process-daily`
- **Method**: POST
- **Auth**: Admin token required

To set up automatic daily processing:

1. **Vercel Cron Jobs** (Recommended)
   - Add `vercel.json` cron configuration
   - Or use Vercel's Cron Jobs feature in dashboard

2. **External Cron Service**
   - Use a service like cron-job.org
   - Call: `POST https://your-domain.com/api/vip/process-daily`
   - Include admin token in Authorization header

3. **Manual Processing**
   - Call the endpoint manually when needed
   - Useful for testing and manual triggers

## Database Migration

Currently using JSON file storage. For production:

1. **Consider migrating to:**
   - PostgreSQL (via Vercel Postgres)
   - MongoDB (via MongoDB Atlas)
   - Supabase
   - PlanetScale

2. **Update `/lib/db.ts`** to use your chosen database

## Security Notes

- Change `JWT_SECRET` in production
- Change admin credentials via environment variables
- Consider adding rate limiting
- Add CSRF protection for production
- Implement proper input validation
- Add logging and monitoring

## Features Checklist

✅ User registration and login
✅ Unique referral links
✅ 3-level referral tracking
✅ VIP investment system (4 levels)
✅ Daily check-in rewards
✅ Withdrawal system (24-hour delay)
✅ Admin panel
✅ QR payment flow (mocked)
✅ Mobile-responsive design
✅ Coffee-themed branding

## Support

For issues or questions, check the README.md file or review the code comments.

