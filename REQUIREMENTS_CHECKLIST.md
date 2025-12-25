# ✅ CHECKLIST - Талаботи Муштарӣ

## 📋 ТАЛАБОТҲОИ АСОСӢ

### ✅ GENERAL REQUIREMENTS

- [x] **Basic user registration & login**
  - ✅ Registration page (`/r` ва `/`)
  - ✅ Login page (`/login`)
  - ✅ JWT authentication
  - ✅ Password hashing (bcryptjs)
  - ✅ Auto-login пас аз registration

- [x] **Unique referral link**
  - ✅ Ҳар корбар коди тавсияи беназир мегирад (6 рақам/ҳарф)
  - ✅ Referral link: `/?v=REFERRAL_CODE`
  - ✅ Link дар dashboard нишон дода мешавад
  - ✅ Copy функсия мавҷуд аст

- [x] **Referral tracking**
  - ✅ Вақте ки корбари нав бо referral code сабт ном мекунад, пайванд сабт мешавад
  - ✅ 3-level referral system (L1, L2, L3)
  - ✅ Referral records дар `referrals.json` сабт мешаванд

- [x] **Simple user dashboard**
  - ✅ **Referral count** - Шумораи корбарони тавсияшуда
  - ✅ **Bonus balance** - Баланси бонус (balance)
  - ✅ Dashboard page (`/dashboard`) ва Home page (`/home`)
  - ✅ Real-time update

### ✅ BONUS LOGIC

- [x] **Registration bonus**
  - ✅ Ҳар корбари нав **RM 12** бонус мегирад

- [x] **Referral commission**
  - ✅ Level 1: **28%** комиссия вақте ки корбари тавсияшуда VIP мехарад
  - ✅ Level 2: **1%** комиссия
  - ✅ Level 3: **1%** комиссия
  - ✅ Комиссия баланси корбар илова мешавад

- [x] **Daily check-in bonus**
  - ✅ RM 0.50 ҳар рӯз
  - ✅ Як маротиба дар рӯз

- [x] **VIP daily returns**
  - ✅ VIP пакетҳо даромади рӯзона медиҳанд
  - ✅ 90 рӯз муддат

- [x] **Manual bonus (Admin)**
  - ✅ Админ метавонад баланси корбарро тағйир диҳад
  - ✅ Bulk bonus ба ҳамаи корбарҳо

### ✅ SECURITY

- [x] **Basic security**
  - ✅ Password hashing
  - ✅ JWT tokens
  - ✅ Token verification дар API routes
  - ✅ Admin authentication

- [x] **24-hour delay logic**
  - ✅ Withdrawal request бо 24 соат delay
  - ✅ Status: pending → approved

### ✅ PAYMENT & WITHDRAWAL

- [x] **QR payment flow (mocked)**
  - ✅ QR code тавлид мешавад барои withdrawal
  - ✅ QR code дар withdrawal page нишон дода мешавад

- [x] **Withdrawal system (UI + basic logic)**
  - ✅ Withdrawal page (`/withdraw`)
  - ✅ Minimum withdrawal: RM 12
  - ✅ Tax: 16%
  - ✅ Bank account selection
  - ✅ Withdrawal history
  - ✅ Status tracking (pending/approved/rejected)

- [x] **Recharge system**
  - ✅ Recharge page (`/recharge`)
  - ✅ Minimum: RM 50
  - ✅ Amount chips ва custom input
  - ✅ Баланс фавран пур мешавад (mock)

### ✅ ADMIN PANEL

- [x] **Basic admin login**
  - ✅ Admin login page (`/admin`)
  - ✅ Credentials: `admin@coffee.com` / `admin123`
  - ✅ Environment variables support

- [x] **View users and referrals**
  - ✅ Рӯйхати тамоми корбарҳо
  - ✅ Referral count ва commissions
  - ✅ Search ва filter
  - ✅ Pagination

- [x] **Manually adjust bonus balances**
  - ✅ Adjust balance функсия
  - ✅ Add/Deduct маблағ
  - ✅ Reason field
  - ✅ Transaction record

- [x] **Additional admin features**
  - ✅ Dashboard stats
  - ✅ Bulk bonus
  - ✅ Withdrawal queue
  - ✅ Export CSV
  - ✅ Transaction history

---

## 🎨 DESIGN REQUIREMENTS

- [x] **Mobile-focused design**
  - ✅ Responsive layout
  - ✅ Bottom tab bar
  - ✅ Touch-optimized buttons
  - ✅ Mobile-first CSS

- [x] **Coffee theme**
  - ✅ Coffee colors (brown, latte, cream)
  - ✅ Coffee icons (☕)
  - ✅ Coffee-themed branding

---

## 🚀 TECH STACK

- [x] **React + Tailwind CSS**
  - ✅ Next.js 14 (React)
  - ✅ Tailwind CSS
  - ✅ TypeScript

- [x] **Vercel hosting**
  - ✅ Vercel-ready
  - ✅ API routes
  - ✅ Environment variables

---

## 📱 PAGES & FEATURES

### User Pages:
- [x] `/` - Landing/Registration page
- [x] `/r?v=CODE` - Registration with referral code
- [x] `/login` - Login page
- [x] `/home` - Home/Dashboard
- [x] `/dashboard` - User dashboard (referral count, bonus balance)
- [x] `/product` - VIP products
- [x] `/team` - Referral tree
- [x] `/mine` - Profile
- [x] `/recharge` - Recharge balance
- [x] `/withdraw` - Withdrawal
- [x] `/daily-rewards` - Daily check-in
- [x] `/customer-service` - Support

### Admin Pages:
- [x] `/admin` - Admin panel
  - [x] Dashboard stats
  - [x] Users table
  - [x] Adjust balance
  - [x] Bulk bonus
  - [x] Withdrawal queue
  - [x] Transactions

---

## 🔄 FUNCTIONALITY CHECK

### Registration Flow:
1. ✅ Корбар бо referral link сабт ном мекунад
2. ✅ Коди тавсия сабт мешавад
3. ✅ RM 12 бонус илова мешавад
4. ✅ Referral record эҷод мешавад (L1, L2, L3)
5. ✅ Auto-login ва redirect ба home

### Login Flow:
1. ✅ Корбар бо email/password ворид мешавад
2. ✅ Token тавлид мешавад
3. ✅ Redirect ба dashboard/home

### Referral System:
1. ✅ Корбари нав бо referral code сабт ном мекунад
2. ✅ Referral records эҷод мешаванд
3. ✅ Вақте ки корбари тавсияшуда VIP мехарад:
   - ✅ L1 мегирад: 28%
   - ✅ L2 мегирад: 1%
   - ✅ L3 мегирад: 1%

### Dashboard:
1. ✅ Referral count нишон дода мешавад
2. ✅ Bonus balance нишон дода мешавад
3. ✅ Referral link нишон дода мешавад
4. ✅ Copy функсия кор мекунад

### Admin Panel:
1. ✅ Admin login кор мекунад
2. ✅ Рӯйхати корбарҳо нишон дода мешавад
3. ✅ Referral count ва commissions нишон дода мешаванд
4. ✅ Adjust balance кор мекунад
5. ✅ Bulk bonus кор мекунад

---

## ✅ ХУЛОСА

**ҲАМАИ ТАЛАБОТҲО ПУРРА ВА ФАЪОЛАНД!**

- ✅ User registration & login
- ✅ Unique referral links
- ✅ Referral tracking (3-level)
- ✅ Dashboard (Referral count + Bonus balance)
- ✅ Bonus logic (Registration, Commission, Daily)
- ✅ Withdrawal system (UI + logic)
- ✅ Admin panel (View users, Adjust balances)
- ✅ Mobile-focused design
- ✅ Coffee theme
- ✅ Vercel-ready

**ЛОИҲА АЗ 0 ТО 100% ПУРРА ВА КОР МЕКУНАД!** 🎉

