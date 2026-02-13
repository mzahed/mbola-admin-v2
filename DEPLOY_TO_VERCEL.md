# Deploy to Vercel - Quick Guide

## ✅ Build Status
✅ **Build is working!** `npm run build` completes successfully.

## 🚀 Deploy via Vercel Dashboard (Recommended)

### Step 1: Go to Vercel
Visit: **https://vercel.com/new**

### Step 2: Import Project
- Click **"Import Git Repository"** (if you have GitHub)
- OR click **"Browse"** and select the `admin-v2` folder

### Step 3: Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: Leave blank (or `admin-v2` if repo is at root)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 4: Add Environment Variable
Click **"Environment Variables"** and add:
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://mbola.org/applications/api`
- **Environment**: Production, Preview, Development (select all)

### Step 5: Deploy
Click **"Deploy"** and wait ~2-3 minutes.

## 🎉 After Deployment

Your app will be live at: `https://your-project-name.vercel.app`

### Optional: Add Custom Domain
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add: `admin.mbola.org` (or your choice)
3. Update DNS on DreamHost:
   - Type: CNAME
   - Name: admin
   - Value: cname.vercel-dns.com

## 📝 Notes
- Frontend: Vercel (free tier)
- Backend: DreamHost (existing PHP at `https://mbola.org/applications/api`)
- CORS: Already configured in PHP backend
- Build: ✅ Working and ready to deploy
