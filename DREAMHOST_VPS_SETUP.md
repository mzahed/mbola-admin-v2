# Deploying Next.js on DreamHost VPS

If you want to host the React app on DreamHost VPS instead of Vercel, follow these steps:

## Prerequisites

- DreamHost VPS plan (VPS Basic $15/month minimum)
- SSH access to your VPS
- Basic command line knowledge

## Step 1: Connect to Your VPS

```bash
ssh username@your-server.dreamhost.com
```

## Step 2: Install Node.js

```bash
# Update system
sudo apt-get update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x or higher
npm --version
```

## Step 3: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

PM2 will keep your Next.js app running and restart it if it crashes.

## Step 4: Clone Your Repository

```bash
cd ~
git clone https://github.com/your-username/mbola-admin-v2.git
# OR upload files via SFTP to ~/admin-v2
cd admin-v2
```

## Step 5: Install Dependencies and Build

```bash
npm install
npm run build
```

## Step 6: Start the App with PM2

```bash
# Start the app
pm2 start npm --name "admin-v2" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on server reboot
pm2 startup
# Follow the instructions it gives you (usually involves running a sudo command)
```

## Step 7: Configure Apache/Nginx Reverse Proxy

### Option A: Apache (if DreamHost uses Apache)

Create or edit `.htaccess` in your domain's public directory:

```apache
<IfModule mod_proxy.c>
    ProxyPass /admin-v2 http://localhost:3001
    ProxyPassReverse /admin-v2 http://localhost:3001
</IfModule>
```

Or add to Apache config:

```apache
<VirtualHost *:80>
    ServerName admin.mbola.org
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/
</VirtualHost>
```

### Option B: Nginx (if DreamHost uses Nginx)

Edit your Nginx config:

```nginx
server {
    listen 80;
    server_name admin.mbola.org;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Step 8: Set Environment Variables

Create `.env.production` file:

```bash
cd ~/admin-v2
nano .env.production
```

Add:
```
NEXT_PUBLIC_API_URL=https://mbola.org/applications/api
```

Restart PM2:
```bash
pm2 restart admin-v2
```

## Step 9: Set Up SSL (Optional but Recommended)

If you have SSL certificate:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-apache
# OR for Nginx:
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --apache -d admin.mbola.org
# OR
sudo certbot --nginx -d admin.mbola.org
```

## Useful PM2 Commands

```bash
# View logs
pm2 logs admin-v2

# Restart app
pm2 restart admin-v2

# Stop app
pm2 stop admin-v2

# View status
pm2 status

# Monitor
pm2 monit
```

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 3001
sudo lsof -i :3001

# Kill the process or change port in package.json
```

### App Won't Start
```bash
# Check PM2 logs
pm2 logs admin-v2 --lines 50

# Check if Node.js is running
node --version

# Check if dependencies are installed
ls node_modules
```

### Can't Access from Browser
- Check firewall: `sudo ufw status`
- Verify PM2 is running: `pm2 status`
- Check reverse proxy configuration
- Verify port 3001 is accessible: `curl http://localhost:3001`

## Updating the App

```bash
cd ~/admin-v2
git pull  # OR upload new files via SFTP
npm install
npm run build
pm2 restart admin-v2
```

## Cost Estimate

- **VPS Basic**: $15/month (1GB RAM, 30GB storage)
- **VPS Business**: $30/month (2GB RAM, 60GB storage) - Recommended
- **VPS Professional**: $60/month (4GB RAM, 120GB storage)

For a Next.js app, **VPS Business ($30/month)** is recommended for better performance.

---

## Alternative: Use DreamHost's Node.js Support (If Available)

Some DreamHost plans offer Node.js support. Check your panel:
1. Go to DreamHost Panel
2. Domains → Manage Domains
3. Look for "Node.js" option
4. Enable it and follow DreamHost's instructions

This might be easier than VPS setup!
