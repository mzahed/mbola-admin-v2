# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd admin-v2
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to: **http://localhost:3001**

## ✅ What's Working

- ✅ Modern React UI with Next.js 14
- ✅ Login page with authentication
- ✅ Dashboard with stats cards
- ✅ Certificates list page
- ✅ Sidebar navigation
- ✅ API integration with PHP backend
- ✅ TypeScript for type safety
- ✅ Tailwind CSS styling (matching MBOLA design)

## 📁 Project Structure

```
admin-v2/
├── app/
│   ├── (auth)/login/      # Login page
│   ├── (dashboard)/      # Protected pages
│   │   ├── dashboard/    # Dashboard
│   │   └── certificates/ # Certificates list
│   └── layout.tsx        # Root layout
├── components/
│   └── layout/           # Sidebar, Header
├── lib/
│   ├── api.ts           # API client
│   └── store.ts         # State management
└── public/              # Static files
```

## 🔌 API Endpoints

The React app connects to PHP backend at:
- `https://mbola.org/applications/api/`

**Available endpoints:**
- `POST /api/login` - User login
- `GET /api/me` - Get current user
- `POST /api/logout` - Logout
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/certificates` - List certificates

## 🎨 Design System

Matches MBOLA website:
- **Primary Color**: `#e07e27` (Orange)
- **Dark Background**: `#0B0D10`
- **Fonts**: Roboto (body), Raleway (headings), Pacifico (logo)

## 🛠️ Next Steps

1. **Add remaining pages:**
   - Deceased records
   - Users management
   - Audit trail

2. **Add features:**
   - Create/Edit forms
   - Toast notifications
   - Better error handling
   - Loading states

3. **Deploy:**
   - Can deploy to Vercel (recommended)
   - Or any Node.js hosting

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Change port in package.json or use:
PORT=3002 npm run dev
```

**API errors?**
- Check browser console
- Verify PHP backend is running
- Check CORS settings in `api.php`

**Build errors?**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
