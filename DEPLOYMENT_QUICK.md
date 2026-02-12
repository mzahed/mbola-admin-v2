# Quick Deployment Guide: Vercel + DreamHost

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub
```bash
cd admin-v2
git init
git add .
git commit -m "Ready for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/mbola-admin-v2.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub repository
3. **Add Environment Variable**:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://mbola.org/applications/api`
4. **Click Deploy**

That's it! 🎉

### Step 3: Test

Visit your Vercel URL (e.g., `https://mbola-admin.vercel.app`) and login.

## ✅ What's Already Configured

- ✅ CORS headers in PHP backend (`api.php`)
- ✅ API client configured for production
- ✅ Environment variables setup
- ✅ Vercel configuration file

## 🔧 Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add: `admin.mbola.org`
3. Update DNS on DreamHost:
   - Type: CNAME
   - Name: admin
   - Value: cname.vercel-dns.com

## 📝 Notes

- Frontend: Vercel (free tier)
- Backend: DreamHost (existing PHP)
- API: `https://mbola.org/applications/api`
- Sessions: Work via cookies (CORS configured)

## 🐛 Troubleshooting

**CORS Error?**
- Check `applications/application/controllers/api.php` has CORS headers
- Verify API URL is correct

**Build Failed?**
- Check Vercel build logs
- Test locally: `npm run build`

**Login Not Working?**
- Check browser console for errors
- Verify API endpoint: `https://mbola.org/applications/api/login`
- Check cookies are being set
