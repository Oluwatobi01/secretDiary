# Secret Diary - Download & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend features)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/Oluwatobi01/secretDiary.git
   cd secretDiary
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run the application**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## ⚙️ Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🗄️ Database Setup

1. **Go to Supabase Dashboard**
2. **Create a new project** or use existing one
3. **Run the SQL schema** from `supabase-schema.sql`
4. **Enable Row Level Security (RLS)** policies

## 🎨 Features

### ✅ **Core Features**
- **Rich Text Editor** with formatting tools
- **Voice Recording** with transcription
- **Media Upload** with drag-and-drop
- **AI Insights** for emotion analysis
- **Multiple Journals** with colors and icons
- **Search & Filtering** system
- **Dark/Light Themes** 
- **Responsive Design** for all devices

### 🔧 **Technical Features**
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for backend
- **shadcn/ui** components
- **Advanced Design System** with oklch colors

## 📱 Mobile Support

- **Fully responsive** design
- **Touch-friendly** interactions
- **Progressive Web App** features
- **Optimized** for mobile performance

## 🔒 Security Features

- **Row Level Security** (RLS)
- **Authentication** with Supabase Auth
- **Input validation** and sanitization
- **Secure file uploads**
- **HTTPS ready** deployment

## 🚀 Deployment Options

### Netlify (Recommended)
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
docker build -t secret-diary .
docker run -p 3000:3000 secret-diary
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Project Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   └── ...             # Feature components
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
└── styles/             # Global styles
```

## 🐛 Troubleshooting

### Common Issues

1. **"Save button not working"**
   - Check browser console for errors
   - Verify Supabase connection
   - Ensure journal is selected

2. **"White screen on load"**
   - Check environment variables
   - Verify Node.js version
   - Clear browser cache

3. **"Database connection errors"**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Run database migrations

### Getting Help

1. **Check the browser console** for detailed error messages
2. **Review the dev server logs** in terminal
3. **Verify all environment variables** are set correctly
4. **Ensure Supabase project** is properly configured

## 📞 Support

For issues and questions:
- Check the browser console first
- Review this README file
- Verify your Supabase configuration
- Check GitHub Issues for known problems

---

**Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS**