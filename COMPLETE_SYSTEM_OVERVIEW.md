# 📚 ТАВСИФИ ПУРРАИ СИСТЕМА - НУҚТА БА НУҚТА

## 🎯 МУҚАДДАМА

Ин файл тавсифи пурраи вебсайти Coffee Rewards аст - як платформаи referral-based бо системаи VIP investment ва daily rewards. Ин тавсиф нуқта ба нуқта тавсиф медиҳад, ки система чӣ тавр кор мекунад, логикаи пурра, ва чӣ мешавад вақте ки муштарӣ инро истифода мекунад.

---

## 📋 1. СИСТЕМАИ САБТ НОМ (REGISTRATION)

### 🎯 ЧИЗ АСТ?

Системаи сабт ном, ки корбар метавонад бо phone number ва password сабт ном кунад.

### 📝 РАВАНДИ ПУРРА:

#### Қадам 1: Корбар ба саҳифаи Registration меравад
- URL: `/` ё `/r?v=REFERRAL_CODE`
- Агар referral code дар URL бошад, он автоматӣ дар form пур мешавад

#### Қадам 2: Корбар маълумотҳоро ворид мекунад
- **Phone Number:** (масалан: "1234567890")
- **Password:** (масалан: "password123")
- **Repeat Password:** (масалан: "password123")
- **Referral Code:** (ихтиёрӣ, агар дар URL бошад автоматӣ пур мешавад)

#### Қадам 3: Система санҷида мешавад
```typescript
// app/api/auth/register/route.ts

1. Phone number normalize мешавад (spaces ва dashes ҳазф мешаванд)
   - "123 456 7890" → "1234567890"
   - "123-456-7890" → "1234567890"

2. Санҷида мешавад, ки phone number аллакай мавҷуд нест
   - Агар мавҷуд бошад → Error: "Phone number already exists"

3. Password hash мешавад (bcrypt)
   - "password123" → "$2a$10$hashed_password_string..."

4. Referral code тавлид мешавад (6 аломат)
   - Масалан: "ABC123"
   - Уникалӣ бошад (агар мавҷуд бошад, нав тавлид мешавад)
```

#### Қадам 4: Корбари нав эҷод мешавад
```typescript
const newUser = {
  id: "1703592000000",                    // Timestamp
  username: "1234567890",                 // Phone number
  phone: "1234567890",                    // Normalized phone
  email: "1234567890@coffee.com",         // Auto-generated
  password: "$2a$10$hashed...",          // Hashed password
  referralCode: "ABC123",                 // Unique referral code
  referredBy: "XYZ789",                   // Referral code (агар бошад)
  balance: 12,                            // Registration bonus (RM 12)
  vipLevel: 0,                            // No VIP yet
  totalEarned: 12,                        // Total earned
  totalWithdrawn: 0,                      // Not withdrawn yet
  dailyRewardsBalance: 0,                // No daily rewards yet
  dailyRewardsTotal: 0,                   // No daily rewards yet
  hasSeenInfoModal: false,               // Info modal not seen
  createdAt: "2024-12-26T12:00:00.000Z", // Registration date
  checkInStreak: 0,                       // No check-in yet
};
```

#### Қадам 5: Маълумот дар Database сабт мешавад
```typescript
// lib/db.ts → writeUsers()

Файл: data/users.json
[
  {
    "id": "1703592000000",
    "username": "1234567890",
    "phone": "1234567890",
    "email": "1234567890@coffee.com",
    "password": "$2a$10$hashed...",
    "referralCode": "ABC123",
    "referredBy": "XYZ789",
    "balance": 12,
    "vipLevel": 0,
    "totalEarned": 12,
    "totalWithdrawn": 0,
    "dailyRewardsBalance": 0,
    "dailyRewardsTotal": 0,
    "hasSeenInfoModal": false,
    "createdAt": "2024-12-26T12:00:00.000Z",
    "checkInStreak": 0
  }
]
```

#### Қадам 6: Referral System кор мекунад (агар referral code бошад)
```typescript
// Агар корбар бо referral code сабт ном карда бошад:

1. Referrer корбар ёфта мешавад (аз referral code)
2. Referral records эҷод мешаванд барои 3 level:

Level 1 (L1):
{
  id: "1703592000001",
  referrerId: "referrer_user_id",    // ID-и корбари тавсиякунанда
  referredId: "new_user_id",         // ID-и корбари нав
  level: 1,                          // Level 1
  commission: 0,                     // Ҳанӯз комиссия нагирифта (баъд мегирад)
  createdAt: "2024-12-26T12:00:00.000Z"
}

Level 2 (L2) - агар referrer-и L1 низ referral дошта бошад:
{
  id: "1703592000002",
  referrerId: "level2_referrer_id",  // ID-и корбари L2
  referredId: "new_user_id",
  level: 2,
  commission: 0,
  createdAt: "2024-12-26T12:00:00.000Z"
}

Level 3 (L3) - агар referrer-и L2 низ referral дошта бошад:
{
  id: "1703592000003",
  referrerId: "level3_referrer_id",  // ID-и корбари L3
  referredId: "new_user_id",
  level: 3,
  commission: 0,
  createdAt: "2024-12-26T12:00:00.000Z"
}

Файл: data/referrals.json
```

#### Қадам 7: Auto-Login
```typescript
// app/r/page.tsx

1. Registration муваффақ мешавад
2. Auto-login кор мекунад:
   - Phone number ва password барои login фиристода мешаванд
   - Token тавлид мешавад
   - Token дар localStorage сабт мешавад
3. Redirect ба /home?showInfo=true
```

### ✅ НАТИҶА:

- ✅ Корбари нав эҷод шуд
- ✅ Balance: RM 12 (registration bonus)
- ✅ Referral code: "ABC123"
- ✅ Referral records эҷод шуданд (агар referral code бошад)
- ✅ Auto-login ва redirect ба home

---

## 🔐 2. СИСТЕМАИ ВОРИДШАВӢ (LOGIN)

### 🎯 ЧИЗ АСТ?

Системаи воридшавӣ, ки корбар метавонад бо phone number ва password ворид шавад.

### 📝 РАВАНДИ ПУРРА:

#### Қадам 1: Корбар ба саҳифаи Login меравад
- URL: `/login`

#### Қадам 2: Корбар маълумотҳоро ворид мекунад
- **Phone Number:** (масалан: "1234567890")
- **Password:** (масалан: "password123")

#### Қадам 3: Система санҷида мешавад
```typescript
// app/api/auth/login/route.ts

1. Phone number normalize мешавад
   - "123 456 7890" → "1234567890"

2. Корбар аз database мегирад
   - findUserByPhone(normalizedPhone)
   - Агар наёфта шавад → Error: "Invalid phone number or password"

3. Password санҷида мешавад
   - bcrypt.compare(password, user.password)
   - Агар дуруст набошад → Error: "Invalid phone number or password"

4. Token тавлид мешавад (JWT)
   - jwt.sign({ userId: user.id, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' })
   - Token 7 рӯз вақт дорад
```

#### Қадам 4: Token сабт мешавад
```typescript
// app/login/page.tsx

1. Token дар localStorage сабт мешавад
   localStorage.setItem('token', token);

2. Redirect ба /home
   window.location.href = '/home?showInfo=true&t=' + Date.now();
```

### ✅ НАТИҶА:

- ✅ Корбар ворид шуд
- ✅ Token сабт шуд (7 рӯз вақт дорад)
- ✅ Redirect ба home
- ✅ Маълумотҳо аз database мегиранд (balance, VIP level, ва ғайра)

---

## 💰 3. СИСТЕМАИ RECHARGE (ПУР КАРДАНИ БАЛАНС)

### 🎯 ЧИЗ АСТ?

Системаи recharge, ки корбар метавонад баланси худро пур кунад.

### 📝 РАВАНДИ ПУРРА:

#### Қадам 1: Корбар ба саҳифаи Recharge меравад
- URL: `/recharge`

#### Қадам 2: Корбар маблағро интихоб мекунад
- **Amount Chips:** 50, 100, 200, 400, 800, 1600, 3000, 6000, 12000
- **Custom Amount:** Корбар метавонад маблағи дилхоҳ ворид кунад
- **Minimum:** RM 50

#### Қадам 3: Payment Channel интихоб мешавад
- Корбар payment channel-ро интихоб мекунад (аз admin panel идора карда мешавад)
- Масалан: "Bank Transfer", "Touch 'n Go", ва ғайра

#### Қадам 4: Корбар "Recharge Now" клик мекунад
```typescript
// app/api/recharge/route.ts

1. Маблағ санҷида мешавад
   - Minimum: RM 50
   - Агар камтар бошад → Error: "Minimum deposit is RM 50"

2. QR Code тавлид мешавад
   - generateQRCode(amount)
   - QR code дар transaction сабт мешавад

3. Transaction эҷод мешавад
   {
     id: "1703592000000",
     userId: "user_id",
     type: "deposit",
     amount: 100,
     status: "pending",              // ⚠️ PENDING - Админ бояд approve кунад
     createdAt: "2024-12-26T12:00:00.000Z",
     description: "Recharge deposit",
     qrCode: "data:image/png;base64,..."  // QR code image
   }

4. Transaction дар database сабт мешавад
   Файл: data/transactions.json

5. QR Code ба корбар бармегардад
```

#### Қадам 5: QR Code намоиш дода мешавад
- Modal кушода мешавад
- QR Code намоиш дода мешавад
- Корбар метавонад QR code-ро scan кунад ва маблағро супорад

#### Қадам 6: Админ Transaction-ро Approve мекунад
```typescript
// Admin Panel → Transactions tab

1. Админ transaction-ро мебинад
2. Админ "Approve" клик мекунад
3. Balance корбар илова мешавад:
   user.balance += transaction.amount;
4. Transaction status мешавад "completed"
```

### ✅ НАТИҶА:

- ✅ Transaction эҷод шуд (status: pending)
- ✅ QR Code тавлид шуд
- ✅ Админ метавонад approve кунад
- ✅ Пас аз approval, balance илова мешавад

---

## 💸 4. СИСТЕМАИ WITHDRAWAL (БАРОВАРДАНИ МАБЛАҒ)

### 🎯 ЧИЗ АСТ?

Системаи withdrawal, ки корбар метавонад маблағро бароварад.

### 📝 РАВАНДИ ПУРРА:

#### Қадам 1: Корбар ба саҳифаи Withdrawal меравад
- URL: `/withdraw`

#### Қадам 2: Корбар маблағро ворид мекунад
- **Amount:** (масалан: RM 100)
- **Minimum:** RM 12

#### Қадам 3: Bank Account интихоб мешавад
- Корбар bank account-ро интихоб мекунад (аз admin panel идора карда мешавад)
- Масалан: "Bank Account 1", "Bank Account 2"

#### Қадам 4: Корбар "Withdraw Now" клик мекунад
```typescript
// app/api/withdraw/route.ts

1. Маблағ санҷида мешавад
   - Minimum: RM 12
   - Агар камтар бошад → Error: "Minimum withdrawal is RM 12"

2. Balance санҷида мешавад
   - Агар balance камтар бошад → Error: "Insufficient balance"

3. Tax ҳисоб карда мешавад
   - Tax: 16%
   - amountAfterTax = amount * 0.84
   - tax = amount * 0.16
   - Масалан: RM 100 → RM 84 (after tax), RM 16 (tax)

4. Balance кашида мешавад
   user.balance -= amount;  // Маблағ кашида мешавад
   user.totalWithdrawn += amount;

5. QR Code тавлид мешавад
   - generateQRCode(amountAfterTax)

6. Transaction эҷод мешавад
   {
     id: "1703592000000",
     userId: "user_id",
     type: "withdrawal",
     amount: 100,
     amountAfterTax: 84,
     tax: 16,
     status: "pending",              // ⚠️ PENDING - Админ бояд approve кунад
     createdAt: "2024-12-26T12:00:00.000Z",
     description: "Withdrawal request",
     qrCode: "data:image/png;base64,..."
   }

7. Transaction дар database сабт мешавад
   Файл: data/transactions.json
```

#### Қадам 5: QR Code намоиш дода мешавад
- Modal кушода мешавад
- QR Code намоиш дода мешавад
- Маблағи after tax намоиш дода мешавад

#### Қадам 6: Админ Transaction-ро Approve мекунад
```typescript
// app/api/admin/approve-withdrawal/route.ts

1. Админ дар Admin Panel → Users tab → Pending Withdrawals меравад
2. Админ "Approve" клик мекунад
3. Transaction status мешавад "approved"
   transaction.status = "approved";
   transaction.approveDate = new Date().toISOString();
4. Маблағ аллакай кашида шудааст (дар қадами 4)
```

### ✅ НАТИҶА:

- ✅ Transaction эҷод шуд (status: pending)
- ✅ Balance кашида шуд
- ✅ QR Code тавлид шуд
- ✅ Админ метавонад approve кунад
- ✅ Пас аз approval, transaction "approved" мешавад

---

## ☕ 5. СИСТЕМАИ VIP INVESTMENT

### 🎯 ЧИЗ АСТ?

Системаи VIP investment, ки корбар метавонад VIP package харидад ва даромади рӯзона гирад.

### 📝 РАВАНДИ ПУРРА:

#### Қадам 1: Корбар ба саҳифаи Product меравад
- URL: `/product`

#### Қадам 2: Корбар VIP Package-ро мебинад
```typescript
// lib/vipPlans.ts

9 VIP Levels:
1. VIP 1: RM 50, Daily: RM 8, 90 days, Total: RM 720
2. VIP 2: RM 100, Daily: RM 18, 90 days, Total: RM 1620
3. VIP 3: RM 200, Daily: RM 38, 90 days, Total: RM 3420
4. VIP 4: RM 400, Daily: RM 80, 90 days, Total: RM 7200
5. VIP 5: RM 800, Daily: RM 168, 90 days, Total: RM 15120
6. VIP 6: RM 1600, Daily: RM 352, 90 days, Total: RM 31680
7. VIP 7: RM 3000, Daily: RM 680, 90 days, Total: RM 61200
8. VIP 8: RM 6000, Daily: RM 1400, 90 days, Total: RM 126000
9. VIP 9: RM 12000, Daily: RM 2880, 90 days, Total: RM 259200
```

#### Қадам 3: Корбар "Buy Now" клик мекунад
```typescript
// app/api/vip/purchase/route.ts

1. Balance санҷида мешавад
   - Агар balance камтар бошад → Error: "Insufficient balance"

2. Balance кашида мешавад
   user.balance -= plan.price;
   user.totalInvested = (user.totalInvested || 0) + plan.price;

3. VIP Purchase эҷод мешавад
   {
     id: "1703592000000",
     userId: "user_id",
     productId: "VIP1",
     vipLevel: 1,
     amount: 50,
     dailyReturn: 8,
     daysRemaining: 90,
     createdAt: "2024-12-26T12:00:00.000Z",
     expiresAt: "2025-03-26T12:00:00.000Z"  // 90 рӯз пас
   }

4. VIP Purchase дар database сабт мешавад
   Файл: data/vip_purchases.json

5. Referral Commission ҳисоб карда мешавад
```

#### Қадам 4: Referral Commission ҳисоб карда мешавад
```typescript
// app/api/vip/purchase/route.ts

Агар корбари харидашуда бо referral code сабт ном карда бошад:

1. Level 1 (L1) Referrer:
   - Commission: 28% аз amount
   - Масалан: RM 50 * 0.28 = RM 14
   - referrer.balance += 14;
   - referrer.totalEarned += 14;
   - referrer.totalCommissions += 14;
   - Referral record update мешавад:
     referral.commission += 14;

2. Level 2 (L2) Referrer:
   - Commission: 1% аз amount
   - Масалан: RM 50 * 0.01 = RM 0.50
   - referrer.balance += 0.50;
   - referrer.totalEarned += 0.50;
   - referrer.totalCommissions += 0.50;
   - Referral record update мешавад:
     referral.commission += 0.50;

3. Level 3 (L3) Referrer:
   - Commission: 1% аз amount
   - Масалан: RM 50 * 0.01 = RM 0.50
   - referrer.balance += 0.50;
   - referrer.totalEarned += 0.50;
   - referrer.totalCommissions += 0.50;
   - Referral record update мешавад:
     referral.commission += 0.50;

4. Transaction records эҷод мешаванд барои ҳар як commission
   {
     id: "1703592000001",
     userId: "l1_referrer_id",
     type: "commission",
     amount: 14,
     status: "completed",
     createdAt: "2024-12-26T12:00:00.000Z",
     description: "L1 commission from VIP purchase"
   }
```

#### Қадам 5: Daily Returns Processing
```typescript
// Admin Panel → Daily tab → "Process Daily VIP Returns"

Админ метавонад manually daily returns-ро process кунад:

1. Ҳамаи active VIP purchases мегиранд
   - vipPurchase.expiresAt > new Date()
   - vipPurchase.daysRemaining > 0

2. Барои ҳар як active VIP purchase:
   - Daily return илова мешавад:
     user.balance += vipPurchase.dailyReturn;
     user.totalEarned += vipPurchase.dailyReturn;
   - Days remaining кам мешавад:
     vipPurchase.daysRemaining -= 1;
   - Transaction эҷод мешавад:
     {
       id: "1703592000000",
       userId: "user_id",
       type: "vip_return",
       amount: 8,
       status: "completed",
       createdAt: "2024-12-26T12:00:00.000Z",
       description: "Daily VIP return"
     }

3. Агар daysRemaining === 0:
   - VIP purchase "expired" мешавад
   - Дигар daily return намегирад
```

### ✅ НАТИҶА:

- ✅ VIP package харида шуд
- ✅ Balance кашида шуд
- ✅ VIP purchase эҷод шуд (90 рӯз муддат)
- ✅ Referral commissions илова шуданд (L1: 28%, L2: 1%, L3: 1%)
- ✅ Daily returns process мешаванд (ҳар рӯз)

---

## 🎁 6. СИСТЕМАИ DAILY CHECK-IN

### 🎯 ЧИЗ АСТ?

Системаи daily check-in, ки корбар метавонад ҳар рӯз check-in кунад ва reward гирад.

### 📝 РАВАНДИ ПУРРА:

#### Қадам 1: Корбар ба саҳифаи Daily Rewards меравад
- URL: `/daily-rewards`

#### Қадам 2: Корбар "Check In" клик мекунад
```typescript
// app/api/checkin/route.ts

1. Санҷида мешавад, ки корбар имрӯз check-in кардааст ё не
   - Агар карда бошад → Error: "Already checked in today"

2. Streak ҳисоб карда мешавад
   - Агар корбар дӯш check-in карда бошад:
     user.checkInStreak = (user.checkInStreak || 0) + 1;
   - Агар корбар дӯш check-in накарда бошад:
     user.checkInStreak = 1;

3. Reward ҳисоб карда мешавад
   - Base reward: RM 0.50
   - Streak bonus: (streak - 1) * 0.10
   - Total reward = 0.50 + streak_bonus
   - Масалан: Streak 5 → 0.50 + (5-1)*0.10 = RM 0.90

4. Balance илова мешавад
   user.balance += reward;
   user.dailyRewardsBalance += reward;
   user.dailyRewardsTotal += reward;
   user.lastCheckIn = new Date().toISOString();

5. Transaction эҷод мешавад
   {
     id: "1703592000000",
     userId: "user_id",
     type: "daily_reward",
     amount: 0.90,
     status: "completed",
     createdAt: "2024-12-26T12:00:00.000Z",
     description: "Daily check-in reward (Streak: 5)"
   }
```

### ✅ НАТИҶА:

- ✅ Check-in карда шуд
- ✅ Reward гирифта шуд (RM 0.50 + streak bonus)
- ✅ Streak илова шуд
- ✅ Balance илова шуд

---

## 🔗 7. СИСТЕМАИ REFERRAL

### 🎯 ЧИЗ АСТ?

Системаи referral, ки корбар метавонад дигаронро тавсия кунад ва комиссия гирад.

### 📝 РАВАНДИ ПУРРА:

#### Қадам 1: Корбар Referral Link-ро мегирад
- URL: `/?v=ABC123` ё `/r?v=ABC123`
- `ABC123` = referral code-и корбар

#### Қадам 2: Корбари нав бо Referral Link сабт ном мекунад
- Referral code автоматӣ дар form пур мешавад
- Корбари нав сабт ном мекунад

#### Қадам 3: Referral Records эҷод мешаванд
```typescript
// app/api/auth/register/route.ts

1. Level 1 (L1) Referral:
   {
     id: "1703592000001",
     referrerId: "referrer_user_id",     // Корбари тавсиякунанда
     referredId: "new_user_id",           // Корбари нав
     level: 1,
     commission: 0,                       // Ҳанӯз комиссия нагирифта
     createdAt: "2024-12-26T12:00:00.000Z"
   }

2. Level 2 (L2) Referral (агар referrer-и L1 низ referral дошта бошад):
   {
     id: "1703592000002",
     referrerId: "level2_referrer_id",    // Корбари L2
     referredId: "new_user_id",
     level: 2,
     commission: 0,
     createdAt: "2024-12-26T12:00:00.000Z"
   }

3. Level 3 (L3) Referral (агар referrer-и L2 низ referral дошта бошад):
   {
     id: "1703592000003",
     referrerId: "level3_referrer_id",    // Корбари L3
     referredId: "new_user_id",
     level: 3,
     commission: 0,
     createdAt: "2024-12-26T12:00:00.000Z"
   }
```

#### Қадам 4: Вақте ки Корбари Тавсияшуда VIP мехарад
```typescript
// app/api/vip/purchase/route.ts

1. Level 1 (L1) Referrer мегирад:
   - Commission: 28% аз VIP purchase amount
   - Масалан: RM 50 * 0.28 = RM 14
   - referrer.balance += 14;
   - referrer.totalEarned += 14;
   - referrer.totalCommissions += 14;

2. Level 2 (L2) Referrer мегирад:
   - Commission: 1% аз VIP purchase amount
   - Масалан: RM 50 * 0.01 = RM 0.50

3. Level 3 (L3) Referrer мегирад:
   - Commission: 1% аз VIP purchase amount
   - Масалан: RM 50 * 0.01 = RM 0.50
```

#### Қадам 5: Referral Tree намоиш дода мешавад
- URL: `/team`
- Корбар метавонад referral tree-ро бинад:
  - Level 1 referrals
  - Level 2 referrals
  - Level 3 referrals
  - Commission stats

### ✅ НАТИҶА:

- ✅ Referral link эҷод шуд
- ✅ Корбари нав бо referral link сабт ном кард
- ✅ Referral records эҷод шуданд (L1, L2, L3)
- ✅ Вақте ки корбари тавсияшуда VIP мехарад, комиссия илова мешавад

---

## 👨‍💼 8. ADMIN PANEL

### 🎯 ЧИЗ АСТ?

Admin Panel барои идора кардани система, корбарҳо, транзакцияҳо, ва маълумотҳо.

### 📝 РАВАНДИ ПУРРА:

#### Қадам 1: Админ ба Admin Panel меравад
- URL: `/admin`

#### Қадам 2: Админ Login мекунад
```typescript
// app/api/auth/login/route.ts

1. Админ email ва password-ро ворид мекунад
   - Email: process.env.ADMIN_EMAIL || 'admin@coffee.com'
   - Password: process.env.ADMIN_PASSWORD || 'admin123'

2. Система санҷида мешавад
   - Агар дуруст бошад → Token тавлид мешавад
   - Token дар localStorage сабт мешавад (adminToken)

3. Redirect ба /admin (dashboard)
```

#### Қадам 3: Админ Dashboard мебинад
```typescript
// app/api/admin/stats/route.ts

Statistics:
- Total Users
- Total Balance
- Total Earned
- Total Withdrawn
- Total Referrals
- Total Commissions
- Total Transactions
- Active VIP
- Recent Users (last 7 days)
- Pending Withdrawals
- Pending Amount
```

#### Қадам 4: Админ Users-ро идора мекунад
```typescript
// Admin Panel → Users tab

1. Рӯйхати тамоми корбарҳо
2. Search функсия (phone, username, referral code)
3. Filter (VIP level)
4. Pagination
5. User details modal
6. Adjust balance:
   - Add/Deduct маблағ
   - Reason field
   - Transaction record
7. Bulk bonus:
   - Маблағ ба ҳамаи корбарҳо илова мешавад
   - Transaction records эҷод мешаванд
```

#### Қадам 5: Админ Transactions-ро идора мекунад
```typescript
// Admin Panel → Transactions tab

1. Рӯйхати тамоми транзакцияҳо
2. Filter (type, status)
3. Withdrawal approval:
   - Pending withdrawals
   - Approve/Reject
4. Export CSV
```

#### Қадам 6: Админ Products-ро идора мекунад
```typescript
// Admin Panel → Products tab

1. Рӯйхати VIP products
2. Edit product:
   - Price
   - Daily Income
   - Validity Days
3. Total Income автоматӣ ҳисоб карда мешавад
```

#### Қадам 7: Админ Settings-ро идора мекунад
```typescript
// Admin Panel → Settings tab

1. Bank Accounts Management:
   - ➕ Add Bank Account
   - ✏️ Edit Bank Account
   - 🗑️ Delete Bank Account
   - Active/Inactive toggle

2. Payment Channels Management:
   - ➕ Add Payment Channel
   - ✏️ Edit Payment Channel
   - 🗑️ Delete Payment Channel
   - Active/Inactive toggle

3. Customer Support Settings:
   - 📞 Telegram Support URL
   - 📢 Telegram Channel URL
   - 👥 Telegram Group URL
   - 💾 Save Settings
```

#### Қадам 8: Админ Daily VIP Returns-ро Process мекунад
```typescript
// Admin Panel → Daily tab

1. Админ "Process Daily VIP Returns" клик мекунад
2. Ҳамаи active VIP purchases process мешаванд
3. Daily returns илова мешаванд
4. Days remaining кам мешаванд
```

### ✅ НАТИҶА:

- ✅ Админ метавонад ҳама чизро идора кунад
- ✅ Корбарҳо, транзакцияҳо, products, settings
- ✅ Банк аккаунтҳо ва payment channels
- ✅ Telegram links

---

## 📊 9. DATABASE STRUCTURE

### 🎯 ЧИЗ АСТ?

JSON file-based database, ки ҳамаи маълумотҳоро сабт мекунад.

### 📝 ФАЙЛҲО:

#### 1. `data/users.json`
```json
[
  {
    "id": "1703592000000",
    "username": "1234567890",
    "phone": "1234567890",
    "email": "1234567890@coffee.com",
    "password": "$2a$10$hashed...",
    "referralCode": "ABC123",
    "referredBy": "XYZ789",
    "balance": 150.50,
    "vipLevel": 3,
    "totalEarned": 500.00,
    "totalWithdrawn": 100.00,
    "totalInvested": 200.00,
    "dailyRewardsBalance": 5.50,
    "dailyRewardsTotal": 10.00,
    "hasSeenInfoModal": true,
    "createdAt": "2024-12-26T12:00:00.000Z",
    "lastCheckIn": "2024-12-26T12:00:00.000Z",
    "checkInStreak": 5
  }
]
```

#### 2. `data/referrals.json`
```json
[
  {
    "id": "1703592000001",
    "referrerId": "referrer_user_id",
    "referredId": "referred_user_id",
    "level": 1,
    "commission": 14.00,
    "createdAt": "2024-12-26T12:00:00.000Z"
  }
]
```

#### 3. `data/transactions.json`
```json
[
  {
    "id": "1703592000000",
    "userId": "user_id",
    "type": "withdrawal",
    "amount": 100,
    "amountAfterTax": 84,
    "tax": 16,
    "status": "approved",
    "createdAt": "2024-12-26T12:00:00.000Z",
    "description": "Withdrawal request",
    "qrCode": "data:image/png;base64,...",
    "approveDate": "2024-12-26T13:00:00.000Z"
  }
]
```

#### 4. `data/vip_purchases.json`
```json
[
  {
    "id": "1703592000000",
    "userId": "user_id",
    "productId": "VIP1",
    "vipLevel": 1,
    "amount": 50,
    "dailyReturn": 8,
    "daysRemaining": 85,
    "createdAt": "2024-12-26T12:00:00.000Z",
    "expiresAt": "2025-03-26T12:00:00.000Z"
  }
]
```

#### 5. `data/bank_accounts.json`
```json
[
  {
    "id": "1",
    "name": "Bank Account 1",
    "bank": "Maybank",
    "account": "1234567890",
    "accountHolder": "Coffee Rewards Sdn Bhd",
    "swift": "MBBEMYKL",
    "isActive": true
  }
]
```

#### 6. `data/payment_channels.json`
```json
[
  {
    "id": "1",
    "name": "Payment Channel 1",
    "type": "bank",
    "details": "Transfer to Maybank: 1234567890",
    "instructions": "Include reference number in transfer",
    "isActive": true
  }
]
```

#### 7. `data/settings.json`
```json
{
  "telegramSupport": "https://t.me/coffeesupport",
  "telegramChannel": "https://t.me/coffeerewards",
  "telegramGroup": "https://t.me/coffeerewardsgroup"
}
```

---

## 🔄 10. РАВАНДИ УМУМИИ КОРБАР

### 📱 СЦЕНАРИИ ПУРРА:

#### Сценарий 1: Корбари Нав
```
1. Корбар ба /r?v=ABC123 меравад (referral link)
2. Сабт ном мекунад:
   - Phone: "1234567890"
   - Password: "password123"
3. Registration bonus: RM 12
4. Auto-login ва redirect ба /home
5. Information modal намоиш дода мешавад
6. Корбар метавонад:
   - VIP package харидад
   - Recharge кунад
   - Withdraw кунад
   - Daily check-in кунад
   - Referral link-ро share кунад
```

#### Сценарий 2: Корбари Кадим
```
1. Корбар ба /login меравад
2. Ворид мешавад:
   - Phone: "1234567890"
   - Password: "password123"
3. Token тавлид мешавад
4. Redirect ба /home
5. Маълумотҳо аз database мегиранд:
   - Balance: RM 150.50
   - VIP investments: 2 active
   - Referral count: 5
   - Commission: RM 50.00
```

#### Сценарий 3: VIP Investment
```
1. Корбар ба /product меравад
2. VIP 1 package-ро интихоб мекунад (RM 50)
3. "Buy Now" клик мекунад
4. Balance санҷида мешавад
5. Balance кашида мешавад (RM 50)
6. VIP purchase эҷод мешавад (90 рӯз)
7. Referral commissions илова мешаванд:
   - L1: RM 14 (28%)
   - L2: RM 0.50 (1%)
   - L3: RM 0.50 (1%)
8. Daily returns process мешаванд (ҳар рӯз RM 8)
```

#### Сценарий 4: Withdrawal
```
1. Корбар ба /withdraw меравад
2. Маблағ ворид мекунад (RM 100)
3. Bank account интихоб мекунад
4. "Withdraw Now" клик мекунад
5. Tax ҳисоб карда мешавад (16% = RM 16)
6. Amount after tax: RM 84
7. Balance кашида мешавад (RM 100)
8. QR Code тавлид мешавад
9. Transaction эҷод мешавад (status: pending)
10. Админ approve мекунад
11. Transaction "approved" мешавад
```

---

## 🎯 11. ЛОГИКАИ ПУРРА

### 💡 МАНТИҚИ СИСТЕМА:

#### 1. Registration Bonus
- Ҳар корбари нав: RM 12
- Автоматӣ илова мешавад
- Баланси ибтидоӣ

#### 2. Referral Commission
- Level 1: 28% аз VIP purchase
- Level 2: 1% аз VIP purchase
- Level 3: 1% аз VIP purchase
- Комиссия фавран илова мешавад вақте ки корбари тавсияшуда VIP мехарад

#### 3. VIP Daily Returns
- Ҳар рӯз: daily return илова мешавад
- 90 рӯз муддат
- Пас аз 90 рӯз, VIP purchase "expired" мешавад

#### 4. Withdrawal Tax
- Tax: 16%
- Amount after tax = amount * 0.84
- Tax = amount * 0.16

#### 5. Daily Check-in Rewards
- Base reward: RM 0.50
- Streak bonus: (streak - 1) * 0.10
- Total = 0.50 + streak_bonus

---

## ✅ 12. ХУЛОСА

### 🎯 СИСТЕМА ЧИЗ АСТ?

Вебсайти referral-based бо системаи VIP investment ва daily rewards, ки корбарҳо метавонанд:
- Сабт ном кунанд
- VIP package харанд
- Даромади рӯзона гиранд
- Referral link share кунанд ва комиссия гиранд
- Recharge ва withdraw кунанд
- Daily check-in кунанд

### 🎯 АДМИН ЧИЗ МЕТАВОНАД КУНАД?

- Корбарҳоро идора кунад
- Balance-ҳоро тағйир диҳад
- Transactions-ро approve кунад
- Products-ро тағйир диҳад
- Банк аккаунтҳо ва payment channels-ро идора кунад
- Telegram links-ро идора кунад
- Daily VIP returns-ро process кунад

### 🎯 МУШТАРӢ ЧИЗ МЕТАВОНАД КУНАД?

- Банк аккаунтҳо ва payment channels-ро идора кунад
- Telegram links-ро идора кунад
- Ҳамаи маълумотҳоро худаш тағйир диҳад
- Вебсайтро ба ҷомеа пешниҳод кунад

---

## 🚀 НАТИҶА

**СИСТЕМА ПУРРА ВА КОР МЕКУНАД!**

Ҳамаи функсияҳо иҷро шудаанд ва кор мекунанд. Муштарӣ метавонад вебсайтро ба ҷомеа пешниҳод кунад.
