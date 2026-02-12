# Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   cd admin-v2
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` if needed (default should work)

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   Open http://localhost:3001 in your browser

## Project Structure

```
admin-v2/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth routes
│   │   └── login/           # Login page
│   ├── (dashboard)/         # Protected routes
│   │   ├── dashboard/       # Dashboard page
│   │   └── certificates/    # Certificates page
│   ├── layout.tsx           # Root layout
│   ├── providers.tsx        # React Query provider
│   └── globals.css          # Global styles
├── components/               # React components
│   └── layout/              # Layout components
│       ├── Sidebar.tsx      # Sidebar navigation
│       └── Header.tsx        # Top header
├── lib/                     # Utilities
│   ├── api.ts              # API client
│   └── store.ts            # Zustand stores
└── public/                  # Static assets
```

## Next Steps

1. Complete remaining pages (Deceased, Users, Audit)
2. Add form components for Create/Edit
3. Add toast notifications
4. Add loading states
5. Add error handling
6. Deploy to production

## API Endpoints

The React app communicates with PHP backend at:
- `https://mbola.org/applications/api/`

Available endpoints:
- `POST /api/login` - Login
- `GET /api/me` - Get current user
- `POST /api/logout` - Logout
- `GET /api/dashboard` - Dashboard stats
- `GET /api/certificates` - List certificates

## Development Tips

- Use React Query DevTools (bottom right corner) to inspect API calls
- Check browser console for errors
- API responses are logged in the console
