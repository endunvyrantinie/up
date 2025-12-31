# Quick Start Guide

## 🚀 How to Run the Project

### **Development Mode:**

```bash
npm run dev
```

**Wait for:** "Ready on http://localhost:3000"

**Then open:** http://localhost:3000 in your browser

---

### **Test Build:**

```bash
npm run build
```

**Expected:** "✓ Compiled successfully"

---

### **Production Mode (after build):**

```bash
npm run start
```

---

## ⚠️ Important:

**Run commands separately, one at a time:**

❌ **Wrong:**
```bash
npm run dev      # Тест дар development
npm run build    # Тест build
```

✅ **Correct:**
```bash
npm run dev
```

**Then in a new terminal:**
```bash
npm run build
```

---

## 📝 Common Commands:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Check for errors
npm run lint
```

---

## 🔧 Troubleshooting:

### **Error: "Invalid project directory"**
- Make sure you're in the project directory: `cd /Users/ayubmuhabbatzoda/Desktop/up`
- Don't add comments in the command line
- Run commands one at a time

### **Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### **Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## ✅ Quick Test:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   - Go to: http://localhost:3000

3. **Test registration:**
   - Register a new user
   - Login
   - Check all features

---

**That's it!** Simple and straightforward. 🎉

