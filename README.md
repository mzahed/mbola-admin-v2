# MBOLA Admin V2 - Modern React Frontend

Modern admin panel built with Next.js and React, connecting to the existing PHP backend on DreamHost.

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Visit: **http://localhost:3001**

## 📁 Project Structure

```
admin-v2/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes (login)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # React Query provider
│   └── globals.css        # Global styles
├── components/            # React components
│   └── layout/           # Layout components (Sidebar, Header)
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API client
│   └── store.ts          # Zustand stores
└── public/               # Static assets
```

## 🔌 API Integration

The frontend communicates with the PHP backend at:
- **Production**: `https://mbola.org/applications/api/`
- **Local**: Same (connects to DreamHost backend)

## 🎨 Design System

Matches MBOLA website:
- **Colors**: Orange (#e07e27), Dark backgrounds (#0B0D10, #413c38)
- **Fonts**: Roboto (body), Raleway (headings), Pacifico (logo)

## 📚 Documentation

- **Local Setup**: See `LOCAL_SETUP.md`
- **Deployment**: See `VERCEL_DEPLOY.md`
- **Quick Deploy**: See `DEPLOYMENT_QUICK.md`

## 🛠️ Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Lint code
npm run lint
```

## ✅ Current Features

- ✅ Modern React UI with Next.js 14
- ✅ Login page with authentication
- ✅ Dashboard with stats cards
- ✅ Certificates list page
- ✅ Sidebar navigation
- ✅ API integration with PHP backend
- ✅ TypeScript for type safety
- ✅ Tailwind CSS styling

## 🚧 Coming Soon

- [ ] Deceased records page
- [ ] Users management page
- [ ] Audit trail page
- [ ] Create/Edit forms
- [ ] Toast notifications
- [ ] Better error handling

## 🐛 Troubleshooting

See `LOCAL_SETUP.md` for common issues and solutions.

## 📦 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Icons**: Heroicons
- **Backend**: PHP CodeIgniter (on DreamHost)

## 🔐 Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://mbola.org/applications/api
```

## 📝 Development Workflow

1. **Local Development**: `npm run dev` → Test locally
2. **Build Test**: `npm run build` → Verify production build
3. **Deploy**: Push to GitHub → Deploy to Vercel

## 🌐 Deployment

When ready for production:
1. Test everything locally ✅
2. Push to GitHub
3. Deploy to Vercel (see `VERCEL_DEPLOY.md`)

Frontend: Vercel (free tier)
Backend: DreamHost (existing PHP)

## 📞 Support

- Check `LOCAL_SETUP.md` for local development help
- Check `VERCEL_DEPLOY.md` for deployment help
