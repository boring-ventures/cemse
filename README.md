# Boring Next.js Template

A modern Next.js template with Supabase authentication, profiles, and file uploads.

## 🚀 Features

- ⚡️ Next.js 14 with App Router
- 🔋 Backend API Integration
- 🔑 Authentication with Supabase Auth
- 🎨 Tailwind CSS + shadcn/ui
- 📁 File uploads with Supabase Storage
- 🔄 Type-safe database queries
- 🎭 Dark mode with next-themes
- 🛠 Complete TypeScript support

## 📦 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

## 🛠 Setup

1. Fork the repository:
   - Go to [boring-next](https://github.com/yourusername/boring-next)
   - Click the "Fork" button in the top right corner
   - Clone your forked repository:
   ```bash
   git clone https://github.com/yourusername/boring-next.git
   cd boring-next
   ```

2. Install dependencies:
```bash
pnpm install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

4. Create a Supabase project:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project credentials from Settings > API
   - Create a storage bucket named "avatars" in Storage

5. Configure your `.env.local`:
```env
# Supabase Project Settings
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database URLs
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:5432/postgres"

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=avatars
```

6. Configure Backend Connection:
```bash
# Set your backend URL in .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

## 🚀 Development

Start the development server:
```bash
pnpm dev
```

Your app will be available at `http://localhost:3000`

## 🏗 Project Structure

```
├── app/                   # Next.js App Router
│   ├── api/              # API routes
│   ├── auth/             # Auth routes
│   └── (dashboard)/      # Protected routes
├── components/           # React components
│   ├── ui/              # UI components
│   └── settings/        # Settings components
├── lib/                  # Utility functions
├── providers/           # React context providers
└── public/              # Static assets
```

## 📝 Backend Management

### API Configuration
The application connects to the backend API for all data operations. No local database management is needed.

### Environment Variables
Make sure to set your backend URL in `.env.local`:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

## 🔧 Common Issues & Solutions

### Image Loading Issues
Add your Supabase storage domain to `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "your-project-ref.supabase.co"
    ],
  },
}
```

### Backend Connection Issues
- Verify your NEXT_PUBLIC_BACKEND_URL in .env.local
- Ensure the backend server is running
- Check if the backend API endpoints are accessible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)


## Credentials

### Supabase
- Project name: POSITIVE-Next-Template
- DB Password: e9zKY_Km5HbkiiF
- Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Zmd2ZmhwbWljd3B0dXBqeWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjY4NDksImV4cCI6MjA1NTY0Mjg0OX0.OiccFqJXdAM6tPIvULA3EaZxtCOsuwhiMugjyGzXNFk
- Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Zmd2ZmhwbWljd3B0dXBqeWtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA2Njg0OSwiZXhwIjoyMDU1NjQyODQ5fQ.jOx413xoAvBdez9ofCGU8DEIunRI2SU9SXWJsm_IY2Q
- Project URL: https://swfgvfhpmicwptupjyko.supabase.co

- BACKEND URL:
    # Backend API URL for data operations
    NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
        
