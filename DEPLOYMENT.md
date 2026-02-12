# Deployment Options for MBOLA Admin V2

## Option 1: Hybrid Approach (Recommended) ⭐

**Keep PHP backend on DreamHost, deploy React frontend to Vercel (FREE)**

### Why This Works Best:
- ✅ **Free hosting** for React app (Vercel)
- ✅ **No changes** to existing DreamHost PHP setup
- ✅ **Best performance** (CDN, edge caching)
- ✅ **Easy deployment** (git push)
- ✅ **Free SSL** certificates

### Setup:
1. **Deploy React app to Vercel:**
   ```bash
   npm install -g vercel
   cd admin-v2
   vercel
   ```

2. **Update API URL** in `.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://mbola.org/applications/api
   ```

3. **Done!** Your React app will be live at something like:
   - `https://mbola-admin-v2.vercel.app`
   - Or use custom domain: `admin.mbola.org`

### Cost: **FREE** (Vercel free tier is generous)

---

## Option 2: DreamHost VPS

**Run Next.js on DreamHost VPS**

### Requirements:
- DreamHost VPS plan ($15-240/month depending on resources)
- Node.js installed
- PM2 or similar process manager

### Setup Steps:

1. **SSH into your VPS:**
   ```bash
   ssh user@your-server.dreamhost.com
   ```

2. **Install Node.js:**
   ```bash
   # Using NodeSource
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and build your app:**
   ```bash
   cd ~
   git clone your-repo-url admin-v2
   cd admin-v2
   npm install
   npm run build
   ```

4. **Install PM2 (process manager):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "admin-v2" -- start
   pm2 save
   pm2 startup  # Auto-start on server reboot
   ```

5. **Set up reverse proxy** (if using Apache):
   ```apache
   # In your Apache config or .htaccess
   ProxyPass /admin-v2 http://localhost:3001
   ProxyPassReverse /admin-v2 http://localhost:3001
   ```

### Cost: **$15-240/month** (VPS plan)

---

## Option 3: Static Export (Limited)

**Build Next.js as static site, host on DreamHost**

### Limitations:
- ❌ No server-side features
- ❌ No API routes
- ❌ Limited to static pages

### Setup:

1. **Update `next.config.js`:**
   ```js
   module.exports = {
     output: 'export',
     // ... rest of config
   }
   ```

2. **Build static site:**
   ```bash
   npm run build
   ```

3. **Upload `out/` folder** to DreamHost via FTP/SFTP

### Cost: **FREE** (uses existing hosting)

**Note:** This won't work well for your app since you need API calls to PHP backend.

---

## Option 4: Docker on DreamHost VPS

**Containerize the Next.js app**

### Setup:
1. Install Docker on VPS
2. Create Dockerfile
3. Run container with docker-compose

### Cost: **VPS plan** ($15+/month)

---

## Recommended: Option 1 (Vercel + DreamHost)

### Architecture:
```
┌─────────────────┐         ┌──────────────────┐
│   React App     │  ────>  │   PHP Backend    │
│   (Vercel)      │  API    │   (DreamHost)    │
│   admin.mbola.org│         │  mbola.org/app   │
└─────────────────┘         └──────────────────┘
```

### Benefits:
- ✅ **Zero cost** for frontend hosting
- ✅ **Better performance** (global CDN)
- ✅ **Easy updates** (git push to deploy)
- ✅ **Automatic SSL**
- ✅ **No server management**

### Setup Time: **~10 minutes**

---

## Quick Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd admin-v2
   vercel
   ```

4. **Add environment variable:**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL=https://mbola.org/applications/api`

5. **Custom domain (optional):**
   - Add `admin.mbola.org` in Vercel dashboard
   - Update DNS at DreamHost to point to Vercel

---

## DreamHost VPS Setup (If You Prefer)

If you want everything on DreamHost:

### Minimum Requirements:
- **RAM**: 1GB+ (2GB recommended)
- **Storage**: 20GB+
- **Plan**: VPS Basic ($15/month) or higher

### Steps:
1. Purchase VPS plan
2. Install Node.js 18+
3. Clone repo
4. Build and run with PM2
5. Configure reverse proxy

### Estimated Setup Time: **1-2 hours**

---

## Comparison

| Option | Cost | Setup Time | Performance | Maintenance |
|--------|------|------------|-------------|-------------|
| **Vercel + DreamHost** | FREE | 10 min | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| DreamHost VPS | $15+/mo | 1-2 hours | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Static Export | FREE | 30 min | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## My Recommendation

**Go with Vercel for the React app** because:
1. It's **free** and **fast**
2. **Zero server management**
3. **Automatic deployments** from git
4. **Better performance** than self-hosted
5. Your PHP backend stays on DreamHost (no changes needed)

The React app will make API calls to your existing PHP backend on DreamHost, so everything works together seamlessly!
