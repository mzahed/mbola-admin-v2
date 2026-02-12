# Local Development Setup

Run the React frontend locally while connecting to your DreamHost PHP backend.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Your PHP backend accessible at `https://mbola.org/applications/api/`

## Quick Start

### 1. Install Dependencies

```bash
cd admin-v2
npm install
```

### 2. Set Environment Variables

The `.env.local` file is already configured, but verify it exists:

```bash
# .env.local should contain:
NEXT_PUBLIC_API_URL=https://mbola.org/applications/api
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open in Browser

Visit: **http://localhost:3001**

## What's Running

- **Frontend**: Next.js dev server on `localhost:3001`
- **Backend**: PHP API on `https://mbola.org/applications/api/` (DreamHost)

## Testing Locally

### Test Login

1. Go to http://localhost:3001/login
2. Enter your admin credentials
3. Should redirect to dashboard on success

### Test Dashboard

- Should show stats cards
- Data comes from PHP backend

### Test Certificates

- Navigate to Certificates page
- Should load list from PHP backend
- Search functionality should work

## Troubleshooting

### Port Already in Use?

```bash
# Use a different port
PORT=3002 npm run dev
```

### CORS Errors?

The PHP backend (`api.php`) is already configured to allow `localhost:3001`. If you see CORS errors:

1. Check browser console for exact error
2. Verify API URL: `https://mbola.org/applications/api/login`
3. Test API directly: Open `https://mbola.org/applications/api/dashboard` in browser (should return JSON)

### API Not Responding?

1. **Test API directly:**
   ```bash
   curl https://mbola.org/applications/api/dashboard
   ```
   Should return JSON (might need authentication)

2. **Check Network Tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try logging in
   - Check if API calls are being made
   - Check response status codes

### Session/Cookie Issues?

1. Check browser DevTools → Application → Cookies
2. Should see `ci_session` cookie after login
3. If not, check CORS credentials are enabled (already configured)

### Build Errors?

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Development Workflow

1. **Make Changes**
   - Edit files in `admin-v2/`
   - Changes auto-reload (Hot Module Replacement)

2. **Test Changes**
   - Browser auto-refreshes
   - Check console for errors

3. **Check API Calls**
   - Open DevTools → Network tab
   - See all API requests/responses

4. **Debug**
   - Use React DevTools (browser extension)
   - Use React Query DevTools (bottom right corner in dev mode)
   - Check browser console

## Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production (test locally)
npm run build

# Start production build locally
npm start

# Lint code
npm run lint
```

## Project Structure

```
admin-v2/
├── app/                    # Next.js pages
│   ├── (auth)/            # Login page
│   ├── (dashboard)/       # Protected pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── layout/           # Sidebar, Header
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── store.ts          # State management
└── public/               # Static files
```

## Environment Variables

### Local Development (`.env.local`)
```
NEXT_PUBLIC_API_URL=https://mbola.org/applications/api
```

### Production (Vercel)
Will be set in Vercel dashboard when deploying

## Next Steps After Local Testing

Once everything works locally:

1. ✅ Test all features
2. ✅ Fix any bugs
3. ✅ Add remaining pages
4. ✅ Then deploy to Vercel

## Common Issues & Solutions

### Issue: "Module not found"
**Solution**: Run `npm install` again

### Issue: "Port 3001 already in use"
**Solution**: 
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Issue: "API returns 404"
**Solution**: 
- Check API URL is correct
- Verify PHP backend is accessible
- Check `.htaccess` routing

### Issue: "Login works but redirects to login again"
**Solution**:
- Check cookies are being set
- Verify CORS credentials enabled
- Check session storage in browser

## Tips

- **Hot Reload**: Changes auto-reload (no need to refresh)
- **React Query DevTools**: Bottom right corner shows API calls
- **Console Logging**: Use `console.log()` for debugging
- **Network Tab**: See all API requests/responses
- **React DevTools**: Install browser extension for component inspection

## Ready for Production?

Once local testing is complete:
1. See `VERCEL_DEPLOY.md` for deployment steps
2. Push to GitHub
3. Deploy to Vercel
