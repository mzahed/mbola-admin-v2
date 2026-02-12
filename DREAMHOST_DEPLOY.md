# Deploying Next.js App to DreamHost

## Option 1: Static Export (Recommended - Easiest)

This builds your Next.js app as static HTML/CSS/JS files that DreamHost can serve like a regular website.

### Step 1: Update Next.js Config for Static Export

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export
  },
  // No rewrites needed - API calls go directly to PHP backend
}

module.exports = nextConfig
```

### Step 2: Build the Static Files

```bash
cd admin-v2
npm install
npm run build
```

This creates a `out/` directory with all static files.

### Step 3: Upload to DreamHost

1. **Via FTP/SFTP:**
   ```bash
   # Upload the entire 'out' folder contents to:
   # /home/yourusername/mbola.org/admin-v2/
   ```

2. **Or via SSH:**
   ```bash
   # On your local machine:
   cd admin-v2/out
   rsync -avz . yourusername@mbola.org:~/mbola.org/admin-v2/
   ```

### Step 4: Configure DreamHost

Create `.htaccess` in the `admin-v2` directory:

```apache
# Enable clean URLs
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /admin-v2/
    
    # Handle client-side routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /admin-v2/index.html [L]
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Step 5: Access Your App

Visit: `https://mbola.org/admin-v2/`

---

## Option 2: Node.js on DreamHost VPS (If Available)

If you have a DreamHost VPS plan with Node.js support:

### Step 1: Install Node.js on DreamHost

SSH into your DreamHost server and install Node.js (if not already installed):

```bash
# Check if Node.js is installed
node --version

# If not, install via nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### Step 2: Upload Project Files

```bash
# Upload entire admin-v2 folder to:
# /home/yourusername/mbola.org/admin-v2/
```

### Step 3: Install Dependencies

```bash
cd ~/mbola.org/admin-v2
npm install --production
```

### Step 4: Build the App

```bash
npm run build
```

### Step 5: Run with PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
cd ~/mbola.org/admin-v2
pm2 start npm --name "mbola-admin" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on reboot
pm2 startup
```

### Step 6: Configure Reverse Proxy

Create/update `.htaccess` in your domain root:

```apache
# Proxy requests to Node.js app
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Proxy /admin-v2 requests to Node.js
    RewriteCond %{REQUEST_URI} ^/admin-v2/
    RewriteRule ^admin-v2/(.*)$ http://localhost:3001/$1 [P,L]
</IfModule>
```

---

## Option 3: Hybrid Approach (Best of Both Worlds)

Keep React app static, but use Next.js API routes for some features:

1. Build as static export (Option 1)
2. API calls go directly to PHP backend at `/applications/api/`
3. No Node.js server needed

This is the **recommended approach** for DreamHost!

---

## Recommended Setup: Static Export

### Complete Setup Steps:

1. **Update `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // API calls go directly to PHP backend
  env: {
    NEXT_PUBLIC_API_URL: 'https://mbola.org/applications/api',
  },
}

module.exports = nextConfig
```

2. **Build:**
```bash
npm run build
```

3. **Upload `out/` folder contents to DreamHost:**
   - Via FTP: Upload to `/home/yourusername/mbola.org/admin-v2/`
   - Or via SSH: `rsync -avz out/ user@mbola.org:~/mbola.org/admin-v2/`

4. **Create `.htaccess` in `admin-v2/` directory:**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /admin-v2/
    
    # Handle client-side routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /admin-v2/index.html [L]
</IfModule>
```

5. **Done!** Visit `https://mbola.org/admin-v2/`

---

## Troubleshooting

### 401 Errors / Session Issues
- Make sure cookies are being sent (check browser DevTools)
- Verify PHP session cookies work across subdirectories
- May need to adjust `session.cookie_path` in PHP config

### API Calls Failing
- Check CORS headers in `api.php`
- Verify API URL is correct: `https://mbola.org/applications/api/`
- Check browser console for errors

### Routing Not Working
- Ensure `.htaccess` is in place
- Check that `mod_rewrite` is enabled on DreamHost
- Verify file permissions (644 for files, 755 for directories)

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check Node.js version (need 18+)
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

---

## Advantages of Static Export

✅ **No Node.js server needed** - Works on any hosting  
✅ **Fast loading** - Pre-rendered HTML  
✅ **Easy deployment** - Just upload files  
✅ **Low cost** - Uses existing DreamHost plan  
✅ **Reliable** - No server processes to manage  

---

## File Structure on DreamHost

```
mbola.org/
├── applications/          # Existing PHP backend
│   └── application/
│       └── controllers/
│           └── api.php    # API endpoints
└── admin-v2/              # New React frontend (static files)
    ├── index.html
    ├── _next/
    │   └── static/
    ├── dashboard/
    │   └── index.html
    └── .htaccess
```

---

## Next Steps After Deployment

1. Test all pages work correctly
2. Verify API calls are working
3. Check authentication flow
4. Test on mobile devices
5. Set up monitoring/analytics if needed
