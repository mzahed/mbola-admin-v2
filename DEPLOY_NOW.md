# Quick Deploy to Vercel

## Option 1: Vercel Dashboard (Easiest)

1. **Push to GitHub** (if not already):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mbola-admin-v2.git
   git push -u origin main
   ```

2. **Go to Vercel**: https://vercel.com/new

3. **Import your GitHub repository** or drag & drop the `admin-v2` folder

4. **Configure**:
   - Framework: Next.js (auto-detected)
   - Root Directory: Leave blank (or `admin-v2` if repo is at root)
   - Environment Variable:
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: `https://mbola.org/applications/api`

5. **Click "Deploy"**

## Option 2: Vercel CLI with Token

1. **Get your Vercel token**:
   - Go to https://vercel.com/account/tokens
   - Create a new token

2. **Deploy**:
   ```bash
   export VERCEL_TOKEN=your_token_here
   vercel --prod --token=$VERCEL_TOKEN
   ```

## After Deployment

Your app will be live at: `https://your-project-name.vercel.app`

To add a custom domain (e.g., `admin.mbola.org`):
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS on DreamHost
