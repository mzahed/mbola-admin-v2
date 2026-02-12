# 🚀 Start Here - Local Development First

## Step 1: Install Dependencies

```bash
cd admin-v2
npm install
```

This will install all required packages (Next.js, React, etc.)

## Step 2: Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3001
- ready started server on 0.0.0.0:3001
```

## Step 3: Open in Browser

Visit: **http://localhost:3001**

You should see the login page!

## Step 4: Test Login

1. Enter your admin email and password
2. Click "Sign In"
3. Should redirect to dashboard

## ✅ What to Test Locally

- [ ] Login works
- [ ] Dashboard shows stats
- [ ] Certificates page loads
- [ ] Navigation works
- [ ] Logout works

## 🐛 If Something Doesn't Work

### Port Already in Use?
```bash
PORT=3002 npm run dev
```

### Dependencies Not Installing?
```bash
rm -rf node_modules package-lock.json
npm install
```

### API Errors?
- Check browser console (F12)
- Verify backend is accessible: https://mbola.org/applications/api/dashboard
- Check Network tab for API calls

## 📚 More Help

- **Detailed Local Setup**: See `LOCAL_SETUP.md`
- **Troubleshooting**: See `LOCAL_SETUP.md` → Troubleshooting section

## 🎯 Once Everything Works Locally

Then you can deploy to Vercel:
- See `VERCEL_DEPLOY.md` for deployment steps
- Or `DEPLOYMENT_QUICK.md` for quick reference

---

**Current Setup:**
- Frontend: Running locally on `localhost:3001`
- Backend: PHP API on `https://mbola.org/applications/api/` (DreamHost)
