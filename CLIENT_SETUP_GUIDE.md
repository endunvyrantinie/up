# 📋 РАВАНДНАМАИ ПУРРА - ЧИЗҲОИ АЗ МУШТАРӢ ГИРИФТА МЕШАВАНД

## 🎯 МУҚАДДАМА

Ин файл тавсифи пурраи чизҳое аст, ки **МУШТАРӢ** бояд диҳад, то вебсайт 100% кор кунад ва барои пешниҳод ба ҷомеа омода бошад.

---

## 1. 🔐 ENVIRONMENT VARIABLES (ОБОЗАТӢ)

### Дар Vercel Dashboard → Settings → Environment Variables:

#### ✅ JWT_SECRET
**Маъно:** Secret key барои JWT token generation
**Намуна:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
**Чӣ тавр тавлид кардан:**
- Рафтан ба: https://randomkeygen.com
- Интихоб кардани "CodeIgniter Encryption Keys"
- Копи кардани яке аз ключҳо
- Ё истифодаи команда: `openssl rand -base64 32`

**Эзоҳ:** Ин ключро ҳаргиз ба касе надиҳед ва дар коди public нагузоред!

---

#### ✅ ADMIN_EMAIL
**Маъно:** Email барои admin login
**Намуна:** `admin@yourdomain.com`
**Эзоҳ:** Ин email-ро дар `/admin` саҳифа истифода мекунад

---

#### ✅ ADMIN_PASSWORD
**Маъно:** Password барои admin login
**Намуна:** `YourStrongPassword123!`
**Эзоҳ:** Password-ро мустаҳкам созед:
- Камтар аз 8 аломат
- Бо ҳарфҳои калон (A-Z)
- Бо ҳарфҳои хурд (a-z)
- Бо рақам (0-9)
- Бо аломатҳои махсус (!@#$%^&*)

---

## 2. 📱 TELEGRAM LINKS (ТАВСИЯШАВАНДА)

### Дар Vercel Dashboard → Settings → Environment Variables:

#### ✅ NEXT_PUBLIC_TELEGRAM_SUPPORT_URL
**Маъно:** Link барои Telegram Support (Admin contact)
**Намуна:** `https://t.me/your_support_username`
**Чӣ тавр гирифта мешавад:**
1. Эҷод кардани Telegram бот ё канал барои support
2. Копи кардани username (масалан: `@coffeesupport`)
3. Илова кардани ба формати: `https://t.me/coffeesupport`

**Ҷой:** Дар саҳифаи Customer Service намоиш дода мешавад

---

#### ✅ NEXT_PUBLIC_TELEGRAM_CHANNEL_URL
**Маъно:** Link барои Telegram Channel
**Намуна:** `https://t.me/your_channel_username`
**Чӣ тавр гирифта мешавад:**
1. Эҷод кардани Telegram channel
2. Копи кардани username
3. Илова кардани ба формати: `https://t.me/channelname`

**Ҷой:** Дар саҳифаи Customer Service намоиш дода мешавад

---

#### ✅ NEXT_PUBLIC_TELEGRAM_GROUP_URL
**Маъно:** Link барои Telegram Group
**Намуна:** `https://t.me/your_group_username`
**Чӣ тавр гирифта мешавад:**
1. Эҷод кардани Telegram group
2. Копи кардани username
3. Илова кардани ба формати: `https://t.me/groupname`

**Ҷой:** Дар саҳифаи Customer Service намоиш дода мешавад

**Эзоҳ:** Агар Telegram links набошанд, default links кор мекунанд, аммо бояд тағйир дода шаванд.

---

## 3. 🏦 БАНК АККАУНТҲО (Барои Withdrawal)

### Маълумоти зарурӣ:

Муштарӣ бояд маълумоти банк аккаунтҳоро диҳад:

#### ✅ Bank Account 1 (Масалан: Maybank)
- **Bank Name:** Maybank
- **Account Number:** 1234567890 (маълумоти ҳақиқӣ)
- **Account Holder Name:** Coffee Rewards Sdn Bhd (ё номи ширкат)
- **Bank Code/SWIFT:** MBBEMYKL (агар лозим бошад)

#### ✅ Bank Account 2 (Масалан: CIMB)
- **Bank Name:** CIMB
- **Account Number:** 9876543210 (маълумоти ҳақиқӣ)
- **Account Holder Name:** Coffee Rewards Sdn Bhd
- **Bank Code/SWIFT:** CIBBMYKL (агар лозим бошад)

**Чӣ тавр илова кардан:**
1. Муштарӣ маълумотҳоро медиҳад
2. Дар файли `app/withdraw/page.tsx` дар қисми `accounts` array тағйир додан лозим аст

**Намунаи код:**
```typescript
const accounts = [
  {
    id: '1',
    name: 'Maybank',
    bank: 'Maybank',
    accountNumber: '1234567890',
    accountHolder: 'Coffee Rewards Sdn Bhd'
  },
  {
    id: '2',
    name: 'CIMB',
    bank: 'CIMB',
    accountNumber: '9876543210',
    accountHolder: 'Coffee Rewards Sdn Bhd'
  }
];
```

**Файл:** `app/withdraw/page.tsx` - Сатрҳои 27-30

---

## 4. 💳 PAYMENT CHANNELS (Барои Recharge)

### Маълумоти зарурӣ:

Муштарӣ бояд маълумоти payment channels-ро диҳад:

#### ✅ Payment Channel 1 (Масалан: Bank Transfer)
- **Channel Name:** Bank Transfer
- **Type:** Bank
- **Details:** Transfer to Maybank: 1234567890
- **Instructions:** Include reference number in transfer

#### ✅ Payment Channel 2 (Масалан: Touch 'n Go)
- **Channel Name:** Touch 'n Go
- **Type:** E-Wallet
- **Details:** Scan QR code or transfer to: 0123456789
- **Instructions:** Send screenshot after transfer

**Чӣ тавр илова кардан:**
1. Муштарӣ маълумотҳоро медиҳад
2. Дар файли `app/recharge/page.tsx` дар қисми payment channel section тағйир додан лозим аст

**Намунаи код:**
```typescript
const paymentChannels = [
  {
    id: '1',
    name: 'Bank Transfer',
    type: 'bank',
    details: 'Transfer to Maybank: 1234567890',
    instructions: 'Include reference number in transfer'
  },
  {
    id: '2',
    name: "Touch 'n Go",
    type: 'ewallet',
    details: 'Scan QR code or transfer to: 0123456789',
    instructions: 'Send screenshot after transfer'
  }
];
```

**Файл:** `app/recharge/page.tsx` - Сатрҳои 163-177

---

## 5. 📧 EMAIL CONFIGURATION (ИХТИЁРӢ)

### Агар email notifications лозим бошад:

#### ✅ Email Service Provider
- SendGrid, Mailgun, AWS SES, ва ғайра

#### ✅ API Keys
- API key аз email service provider
- From email address
- Email templates

**Эзоҳ:** Айни ҳол email notifications нокоманд. Агар лозим бошад, бояд илова карда шаванд.

---

## 6. 🗄️ DATABASE (ИХТИЁРӢ)

### Айни ҳол:
- ✅ JSON file-based storage кор мекунад
- ✅ Автоматӣ эҷод мешавад дар `/tmp/data` дар Vercel

### Барои production (ихтиёрӣ):
- Мигратсия ба PostgreSQL (Vercel Postgres)
- Ё MongoDB (MongoDB Atlas)
- Ё дигар database service

**Эзоҳ:** Барои MVP, JSON files кофӣ аст. Барои production бо user-ҳои зиёд, database service тавсия дода мешавад.

---

## 7. ⏰ CRON JOBS (Барои Daily VIP Returns)

### Айни ҳол:
- ✅ Endpoint мавҷуд аст: `/api/vip/process-daily`
- ❌ Automatic cron job ноком аст

### Ислоҳ:
1. **Vercel Cron Jobs** (Тавсияшаванда):
   - Дар Vercel Dashboard → Cron Jobs
   - Илова кардани cron job:
     - Path: `/api/vip/process-daily`
     - Schedule: `0 0 * * *` (ҳар рӯз соати 00:00)
     - Headers: `Authorization: Bearer <admin-token>`

2. **External Cron Service:**
   - Истифодаи cron-job.org
   - URL: `https://your-domain.com/api/vip/process-daily`
   - Method: POST
   - Headers: `Authorization: Bearer <admin-token>`
   - Schedule: Daily at midnight

**Эзоҳ:** Агар cron job набошад, админ метавонад manually endpoint-ро call кунад.

---

## 8. 🎨 BRANDING (ИХТИЁРӢ)

### Агар мехоҳед, ки branding-ро тағйир диҳед:

#### ✅ Logo
- Илова кардани logo файл дар `public/logo.png`
- Тағйир додани coffee icon-ҳо

#### ✅ Colors
- Тағйир додани coffee colors дар `tailwind.config.ts`

#### ✅ App Name
- Тағйир додани "Coffee Rewards" ба номи дигар

---

## 📝 РАВАНДИ SETUP

### Қадам 1: Environment Variables
1. Рафтан ба Vercel Dashboard
2. Settings → Environment Variables
3. Илова кардани:
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_TELEGRAM_SUPPORT_URL`
   - `NEXT_PUBLIC_TELEGRAM_CHANNEL_URL`
   - `NEXT_PUBLIC_TELEGRAM_GROUP_URL`

### Қадам 2: Банк Аккаунтҳо
1. Муштарӣ маълумоти банк аккаунтҳоро медиҳад
2. Дар `app/withdraw/page.tsx` тағйир додан лозим аст

### Қадам 3: Payment Channels
1. Муштарӣ маълумоти payment channels-ро медиҳад
2. Дар `app/recharge/page.tsx` тағйир додан лозим аст

### Қадам 4: Testing
1. Тест кардани ҳамаи функсияҳо
2. Тест кардани mobile version
3. Тест кардани admin panel

### Қадам 5: Deploy
1. Push ба GitHub
2. Deploy дар Vercel
3. Тест кардани production version

---

## 📊 ХУЛОСА

### ✅ ЧИЗҲОИ ОБОЗАТӢ АЗ МУШТАРӢ:
1. **JWT_SECRET** - Secret key барои JWT
2. **ADMIN_EMAIL** - Email барои admin
3. **ADMIN_PASSWORD** - Password барои admin

### ✅ ЧИЗҲОИ ТАВСИЯШАВАНДА АЗ МУШТАРӢ:
1. **Telegram Links** - Support, Channel, Group URLs
2. **Банк Аккаунтҳо** - Маълумоти банк аккаунтҳо
3. **Payment Channels** - Маълумоти payment channels

### ✅ ЧИЗҲОИ ИХТИЁРӢ:
1. **Email Configuration** - Барои email notifications
2. **Database Migration** - Барои production
3. **Cron Jobs** - Барои automatic daily processing
4. **Branding** - Logo, colors, app name

---

## 🚀 НАТИҶА

**Пас аз гирифтани ин маълумотҳо:**
1. Environment variables-ро дар Vercel set кардан
2. Банк аккаунтҳо ва payment channels-ро дар код тағйир додан
3. Testing кардан
4. Deploy кардан

**Пас аз ин, вебсайт 100% омода аст барои пешниҳод ба ҷомеа!** 🎉

