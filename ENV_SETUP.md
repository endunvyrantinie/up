# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# MongoDB Connection String
# Replace <db_password> with your actual MongoDB password
MONGODB_URI=mongodb+srv://dbUser:<db_password>@cluster0.ygkszfk.mongodb.net/?appName=Cluster0

# JWT Secret for authentication
JWT_SECRET=your-secret-key-here-change-in-production

# Admin Credentials
ADMIN_EMAIL=admin@coffee.com
ADMIN_PASSWORD=admin123

# Telegram URLs (optional)
NEXT_PUBLIC_TELEGRAM_SUPPORT_URL=https://t.me/coffeesupport
NEXT_PUBLIC_TELEGRAM_CHANNEL_URL=https://t.me/coffeerewards
NEXT_PUBLIC_TELEGRAM_GROUP_URL=https://t.me/coffeerewardsgroup
```

## For Vercel Deployment

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the variables above
3. **Important:** Replace `<db_password>` in MONGODB_URI with your actual MongoDB password
4. Redeploy

## MongoDB Setup

1. Get your MongoDB connection string from MongoDB Atlas
2. Replace `<db_password>` with your actual password
3. Ensure IP whitelist includes `0.0.0.0/0` (or your Vercel IPs)
4. Test connection

## Security Notes

- Never commit `.env.local` to Git
- Use strong passwords for MongoDB
- Change default admin credentials in production
- Use a strong JWT_SECRET (at least 32 characters)

