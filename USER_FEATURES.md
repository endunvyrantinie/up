# 📱 ФУНКСИЯҲОИ МУШТАРӢ - ТАВСИФИ ПУРРА

## 🎯 САҲИФАҲОИ АСОСӢ

### 1. 🏠 HOME (`/home`)
**Функсияҳо:**
- ✅ **Top Banner** - Welcome message бо coffee icon
- ✅ **Daily Rewards Button** - Линк ба `/daily-rewards`
- ✅ **Support Button** - Линк ба `/customer-service`
- ✅ **Action Buttons:**
  - 💰 **Recharge** → `/recharge`
  - 💸 **Withdrawal** → `/withdraw`
  - 💬 **Customer Service** → `/customer-service`
- ✅ **Stats Cards:**
  - 💳 **Account Balance** - Баланси ҷории корбар
  - 📈 **Today's Income** - Даромади рӯзона
  - 💰 **Total Income** - Даромади умумии корбар
- ✅ **Featured Products Grid** - 6 coffee icons
- ✅ **Bottom Tab Bar** - Навигатсия (Home, Product, Team, Mine)

---

### 2. ☕ PRODUCT (`/product`)
**Функсияҳо:**
- ✅ **VIP Plans Display** - 9 сатҳи VIP (VIP1 - VIP9)
- ✅ **Барои ҳар VIP план:**
  - ☕ Product image
  - 📅 Validity period (90 days)
  - 💰 Total income
  - 📈 Daily income
  - 💵 Price
  - ⏰ Auto-settlement info
  - 🛒 **Buy Button** - Харидани VIP пакет
- ✅ **Balance Check** - Санҷидани баланс пеш аз харид
- ✅ **Purchase Logic** - Харид ва комиссия ба L1/L2/L3
- ✅ **Bottom Tab Bar** - Навигатсия

---

### 3. 👥 TEAM (`/team`)
**Функсияҳо:**
- ✅ **Top Section:**
  - 🔗 **Invitation Code** - Коди тавсияи корбар
  - 🔗 **Referral Link** - Линки тавсия бо Copy функсия
  - 📊 **Info Cards:**
    - Valid users count
    - Total income
- ✅ **Level Sections:**
  - **Level 1 (L1):**
    - Commission rate: 28%
    - Valid users count
    - Total income
  - **Level 2 (L2):**
    - Commission rate: 1%
    - Valid users count
    - Total income
  - **Level 3 (L3):**
    - Commission rate: 1%
    - Valid users count
    - Total income
- ✅ **Referral Tree Visualization** - Намоиши дарахти тавсия
- ✅ **Invitation Reward Info** - Тавсифи комиссияҳо
- ✅ **Bottom Tab Bar** - Навигатсия

---

### 4. 👤 MINE (`/mine`)
**Функсияҳо:**
- ✅ **Top Card:**
  - ☕ Coffee icon
  - 👤 Username/Email
  - 📅 Member since date
  - 💰 Account Balance
- ✅ **Action Icons:**
  - 💰 **Recharge** → `/recharge`
  - 💸 **Withdrawal** → `/withdraw`
  - 📜 **Account Log** → `/dashboard`
- ✅ **Menu List:**
  - 👥 Inviting friends → `/team`
  - 📋 Platform rules (static)
  - ℹ️ About us (static)
  - 💬 Customer service → `/customer-service`
  - 🏦 Bank account management (static)
- ✅ **Logout Button** - Баромад аз система
- ✅ **Bottom Tab Bar** - Навигатсия

---

### 5. 💰 RECHARGE (`/recharge`)
**Функсияҳо:**
- ✅ **Balance Card** - Баланси ҷории корбар
- ✅ **Amount Selection:**
  - 💳 Amount chips: 50, 100, 200, 400, 800, 1600, 3000, 6000, 12000
  - 📝 Custom amount input
  - Minimum: RM 50
- ✅ **Payment Channel** - Channel selection
- ✅ **Recharge Button** - Пур кардани баланс
- ✅ **Recharge Rules:**
  1. Minimum deposit is 50
  2. Verify account information before transferring
  3. If funds are delayed, contact online service
  4. Never transfer to strangers
  5. Officials never ask for password

---

### 6. 💸 WITHDRAW (`/withdraw`)
**Функсияҳо:**
- ✅ **Balance Card** - Баланси ҷории корбар
- ✅ **Withdrawal Amount:**
  - 📝 Amount input
  - 💰 Amount received (after tax)
  - 📊 Tax: 16%
  - Minimum: RM 12
- ✅ **Bank Account Selection:**
  - 🏦 Bank account modal
  - Maybank, CIMB (dummy accounts)
- ✅ **QR Code Generation** - QR code барои payment
- ✅ **Instant Withdrawal Button** - Фиристодани request
- ✅ **Withdrawal History:**
  - 📋 Table бо status (Pending, Approved, Rejected)
  - ⏰ Time remaining
  - 💰 Amount
- ✅ **Withdrawal Instructions:**
  1. Minimum withdrawal amount is 12
  2. Withdrawals are 24/7, multiple per day
  3. Withdrawal fee is 16%
  4. Arrival time about 2 hours; depends on bank
  5. Wrong info can cause failure
  6. To protect rights, must have VIP device to withdraw

---

### 7. 🎁 DAILY REWARDS (`/daily-rewards`)
**Функсияҳо:**
- ✅ **Header** - Coffee image/icon
- ✅ **Rewards Card:**
  - 💰 Daily rewards: RM 0.50
  - 💵 Available balance
  - 💰 Total rewards received
  - 🎁 **Get Rewards Button** - Гузаронидани check-in
- ✅ **Rules:**
  1. You can check in once a day
  2. You can check in again the following day
  3. The check-in bonus is RM 0.50

---

### 8. 💬 CUSTOMER SERVICE (`/customer-service`)
**Функсияҳо:**
- ✅ **Top Banner** - Coffee image/icon
- ✅ **Contact Links:**
  - 📱 Telegram (Admin contact)
  - 📢 Telegram channel
  - 👥 Telegram group
- ✅ **Service Info:**
  - ⏰ Online customer service time: 9:00–20:00
  - ℹ️ Service instructions
  - 💡 Tips ва guidelines

---

### 9. 📊 DASHBOARD (`/dashboard`)
**Функсияҳо:**
- ✅ **Balance Card:**
  - 💰 Bonus Balance
  - 🔗 Referral Link (бо Copy функсия)
- ✅ **Stats Cards:**
  - 👥 Referral Count
  - 💵 Total Commissions
- ✅ **Tabs:**
  - **Referrals Tab:**
    - Referral link display
    - Referral code
    - Total referrals
    - Total commissions
    - Referral tree visualization
  - **Withdraw Tab:**
    - Withdrawal form
    - Amount input
    - Tax calculation
    - Bank account selection
  - **Transactions Tab:**
    - Transaction history
    - Status badges (Pending, Approved, Rejected)
    - Amount, date, type

---

## 🔐 АУТЕНТИФИКАЦИЯ

### 1. 📝 REGISTRATION (`/` ва `/r?v=CODE`)
**Функсияҳо:**
- ✅ **Landing Page:**
  - Login button → `/login`
  - Register button
  - Admin login link → `/admin`
- ✅ **Registration Form:**
  - 📱 Mobile phone input (+60 prefix)
  - 🔒 Password input
  - 🔒 Repeat password
  - 🔗 Referral code (pre-filled аз URL)
  - ✅ **Create Account Button**
- ✅ **Auto-login** пас аз регистратсия
- ✅ **Registration Bonus:** RM 12
- ✅ **Redirect** ба `/home?showInfo=true`

---

### 2. 🔑 LOGIN (`/login`)
**Функсияҳо:**
- ✅ **Login Form:**
  - 📧 Email input
  - 🔒 Password input
  - ✅ **Login Button**
- ✅ **Error Handling** - Invalid credentials
- ✅ **Token Management** - JWT token storage
- ✅ **Redirect:**
  - User → `/home`
  - Admin → `/admin`

---

## 🎁 БОНУСҲО ВА ДАРОМАД

### 1. 💰 Registration Bonus
- ✅ **RM 12** барои ҳар корбари нав
- ✅ Автоматӣ илова мешавад пас аз регистратсия

### 2. 🎁 Daily Check-in Bonus
- ✅ **RM 0.50** ҳар рӯз
- ✅ Як маротиба дар рӯз
- ✅ Streak tracking

### 3. 💵 Referral Commission
- ✅ **Level 1:** 28% комиссия
- ✅ **Level 2:** 1% комиссия
- ✅ **Level 3:** 1% комиссия
- ✅ Комиссия вақте ки корбари тавсияшуда VIP мехарад

### 4. 📈 VIP Daily Returns
- ✅ VIP1-VIP9 пакетҳо
- ✅ Даромади рӯзона
- ✅ 90 рӯз муддат
- ✅ Автоматӣ settlement

---

## 🔗 РЕФЕРРАЛ СИСТЕМА

### 1. 🔗 Referral Link
- ✅ Ҳар корбар коди тавсияи беназир мегирад
- ✅ Link формат: `/?v=REFERRAL_CODE` ё `/r?v=REFERRAL_CODE`
- ✅ Copy функсия дар dashboard ва team page

### 2. 📊 Referral Tracking
- ✅ 3-level referral system
- ✅ Referral records эҷод мешаванд
- ✅ Commission calculation
- ✅ Referral tree visualization

---

## 💳 ТРАНЗАКЦИЯҲО

### 1. 💰 Recharge (Deposit)
- ✅ Minimum: RM 50
- ✅ Amount chips ва custom input
- ✅ Mock payment (фавран пур мешавад)
- ✅ Transaction record

### 2. 💸 Withdrawal
- ✅ Minimum: RM 12
- ✅ Tax: 16%
- ✅ Bank account selection
- ✅ QR code generation
- ✅ 24-hour processing delay
- ✅ Status tracking (Pending, Approved, Rejected)

---

## 📱 МОБИЛ ОПТИМИЗАЦИЯ

### 1. 📱 Mobile-First Design
- ✅ Responsive layout
- ✅ Touch-optimized buttons
- ✅ Mobile-friendly forms
- ✅ Safe area support (iOS)

### 2. 🎨 Bottom Tab Bar
- ✅ Home 🏠
- ✅ Product ☕
- ✅ Team 👥
- ✅ Mine 👤

### 3. 🎯 Touch Optimization
- ✅ Minimum touch targets: 48px
- ✅ Active states
- ✅ Touch manipulation
- ✅ Tap highlight removal

---

## 🎨 UI/UX ФИЧУРҲО

### 1. 🎨 Coffee Theme
- ✅ Coffee colors (brown, latte, cream)
- ✅ Coffee icons (☕)
- ✅ Gradient backgrounds
- ✅ Consistent branding

### 2. ✨ Animations
- ✅ Slide-in animations
- ✅ Pulse effects
- ✅ Bounce animations
- ✅ Scale transitions
- ✅ Rotate effects

### 3. 📊 Real-time Updates
- ✅ Balance updates
- ✅ Referral count updates
- ✅ Commission updates
- ✅ Auto-refresh (30 seconds)

---

## 🔔 НОТИФИКАЦИЯҲО

### 1. ✅ Success Messages
- ✅ Registration successful
- ✅ Login successful
- ✅ Recharge successful
- ✅ Withdrawal submitted
- ✅ Daily reward claimed
- ✅ VIP purchased
- ✅ Link copied

### 2. ⚠️ Error Messages
- ✅ Invalid credentials
- ✅ Insufficient balance
- ✅ Connection error
- ✅ Validation errors

---

## 📋 ХУЛОСА

### ✅ САҲИФАҲОИ МУШТАРӢ:
1. 🏠 **Home** - Dashboard бо баланс, даромад, action buttons
2. ☕ **Product** - VIP пакетҳо (9 levels)
3. 👥 **Team** - Referral tree ва комиссияҳо
4. 👤 **Mine** - Профили корбар
5. 💰 **Recharge** - Пур кардани баланс
6. 💸 **Withdraw** - Баровардани маблағ
7. 🎁 **Daily Rewards** - Daily check-in
8. 💬 **Customer Service** - Support links
9. 📊 **Dashboard** - Detailed stats ва tabs

### ✅ ФУНКСИЯҲО:
- ✅ Registration & Login
- ✅ Referral system (3-level)
- ✅ VIP investment (9 levels)
- ✅ Daily check-in rewards
- ✅ Recharge & Withdrawal
- ✅ Transaction history
- ✅ Real-time updates
- ✅ Mobile optimization

### ✅ БОНУСҲО:
- ✅ Registration: RM 12
- ✅ Daily check-in: RM 0.50
- ✅ Referral commission: 28%/1%/1%
- ✅ VIP daily returns

**ҲАМА ЧИЗ БАРОИ МУШТАРӢ ПУРРА ВА КОР МЕКУНАД!** 🎉

