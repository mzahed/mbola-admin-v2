# Deploying to Vercel (Frontend) + DreamHost (PHP Backend)

This guide explains how to deploy the React frontend to Vercel while keeping the PHP backend on DreamHost.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Vercel        │  ────>  │   DreamHost      │
│   (Next.js)     │  HTTPS  │   (PHP API)      │
│   Frontend      │         │   Backend        │
└─────────────────┘         └──────────────────┘
```

## Prerequisites

1. **Vercel Account** (free tier works)
   - Sign up at https://vercel.com
   - Connect your GitHub account (recommended)

2. **DreamHost Backend** (already set up)
   - PHP backend at `https://mbola.org/applications/`
   - API endpoints at `https://mbola.org/applications/api/`

## Step 1: Prepare Your Code

### 1.1 Push to GitHub (Recommended)

```bash
cd admin-v2
git init
git add .
git commit -m "Initial commit: Modern React admin panel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mbola-admin-v2.git
git push -u origin main
```

### 1.2 Or Deploy Directly from Local

You can also deploy directly from your local machine using Vercel CLI.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository (or connect it)

2. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `admin-v2` (if repo is at root) or leave blank
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Environment Variables**
   Add this environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://mbola.org/applications/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd admin-v2
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time)
# - Project name? mbola-admin (or your choice)
# - Directory? ./
# - Override settings? No

# For production deployment:
vercel --prod
```

## Step 3: Configure CORS on DreamHost Backend

The PHP backend (`applications/application/controllers/api.php`) is already configured with CORS headers, but verify:

✅ **Already configured in `api.php`:**
- Allows Vercel domains
- Allows localhost for development
- Handles OPTIONS preflight requests
- Allows credentials (cookies/sessions)

## Step 4: Test the Deployment

1. **Visit your Vercel URL**
   - Format: `https://mbola-admin.vercel.app` (or your custom domain)
   - Try logging in with your admin credentials

2. **Check Browser Console**
   - Open DevTools (F12)
   - Check for any CORS errors
   - Verify API calls are going to `https://mbola.org/applications/api/`

3. **Test Features**
   - Login
   - Dashboard stats
   - Certificates list
   - Navigation

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. Go to your project in Vercel dashboard
2. Settings → Domains
3. Add domain: `admin.mbola.org` (or your choice)
4. Follow DNS instructions

### 5.2 Update DNS on DreamHost

Add a CNAME record:
```
Type: CNAME
Name: admin (or your subdomain)
Value: cname.vercel-dns.com
```

### 5.3 Update API URL (if needed)

If you use a custom domain, you might want to update the API URL:
- Vercel Environment Variable: `NEXT_PUBLIC_API_URL`
- Or keep it pointing to `https://mbola.org/applications/api`

## Environment Variables Reference

### Production (Vercel)
```
NEXT_PUBLIC_API_URL=https://mbola.org/applications/api
```

### Local Development
```
NEXT_PUBLIC_API_URL=https://mbola.org/applications/api
```
(Or use `http://localhost/applications/api` if testing locally)

## Troubleshooting

### CORS Errors

**Problem**: Browser shows CORS errors

**Solution**:
1. Check `api.php` CORS headers are correct
2. Verify the origin is in the allowed list
3. Check browser console for exact error

### API Calls Failing

**Problem**: API returns 404 or errors

**Solution**:
1. Verify API URL: `https://mbola.org/applications/api/login`
2. Check PHP backend is accessible
3. Test API endpoint directly in browser
4. Check Vercel environment variables

### Session/Cookie Issues

**Problem**: Login works but session doesn't persist

**Solution**:
1. Ensure `withCredentials: true` in `lib/api.ts` (already set)
2. Check CORS allows credentials
3. Verify session cookies are being set
4. Check browser DevTools → Application → Cookies

### Build Errors

**Problem**: Vercel build fails

**Solution**:
1. Check build logs in Vercel dashboard
2. Test build locally: `npm run build`
3. Verify all dependencies are in `package.json`
4. Check Node.js version (Vercel uses 18.x by default)

## Deployment Checklist

- [ ] Code pushed to GitHub (or ready to deploy)
- [ ] Vercel account created
- [ ] Project imported/created in Vercel
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set
- [ ] Build successful on Vercel
- [ ] CORS configured on PHP backend
- [ ] Tested login flow
- [ ] Tested API calls
- [ ] Custom domain configured (optional)

## Cost Estimate

### Vercel (Free Tier)
- ✅ **Free**: 100GB bandwidth/month
- ✅ **Free**: Unlimited deployments
- ✅ **Free**: Custom domains
- 💰 **Paid**: Only if you exceed limits (unlikely for admin panel)

### DreamHost
- Already hosting PHP backend
- No additional cost for API endpoints

## Benefits of This Setup

✅ **Fast Frontend**: Vercel's global CDN
✅ **Scalable**: Auto-scales with traffic
✅ **Easy Updates**: Push to GitHub = auto-deploy
✅ **Preview Deployments**: Every PR gets a preview URL
✅ **Analytics**: Built-in performance monitoring
✅ **SSL**: Automatic HTTPS certificates

## Next Steps After Deployment

1. **Set up monitoring**
   - Vercel Analytics (built-in)
   - Error tracking (Sentry integration available)

2. **Optimize performance**
   - Image optimization (Next.js Image component)
   - Code splitting (automatic)

3. **Add features**
   - Remaining pages (Deceased, Users, Audit)
   - Forms and CRUD operations
   - Real-time updates (if needed)

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Support**: support@vercel.com
