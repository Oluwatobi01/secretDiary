# Secret Diary - AI Agent Instructions

## Project Overview
**Secret Diary** is a feature-rich journaling application built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Supabase**. It features AI-powered insights, voice recording, multimedia uploads, rich text editing, and authentication.

**Tech Stack:**
- Frontend: Next.js 15 (App Router), React 18, TypeScript
- Styling: Tailwind CSS + Radix UI components
- Database: Supabase (PostgreSQL) with Row Level Security
- Authentication: Supabase Auth (Email/Password, OAuth)
- Rich Editor: TipTap (markdown support, tables, mentions)
- AI Features: Z-AI Web Dev SDK for image analysis, speech-to-text
- Deployment: Netlify with GitHub Actions CI/CD

## Architecture Patterns

### Data Flow
1. **Client Components** → Supabase client (`createClient()` in `src/lib/supabase.ts`)
2. **API Routes** → (`src/app/api/*`) → External services (AI, OCR, speech-to-text)
3. **Database** → Supabase with RLS policies protecting user data

### File Structure
- `src/app/` - Next.js pages and API routes (App Router)
- `src/components/` - React components (both UI and feature-specific)
- `src/lib/` - Utilities: `supabase.ts` (client init), `db.ts`, `utils.ts`
- `src/hooks/` - Custom React hooks (`use-toast.tsx`, `use-mobile.ts`)
- `prisma/` - Schema definition (currently minimal; Supabase is primary)

## Key Integration Points

### Authentication
- **Location:** `src/components/auth.tsx`
- **Pattern:** Supabase Auth with email/password and session checking
- **Flow:** `auth.tsx` handles sign-up/login → checks session on mount → calls `onAuthSuccess` callback
- **Convention:** All protected routes require `const { data: { session } } = await supabase.auth.getSession()`

### Database Schema (Supabase)
Key tables (from `supabase-schema.sql`):
- `journals` - User's journal collections (title, description, color, icon, is_default)
- `entries` - Journal entries with rich text content, tags, mood, media URLs
- `tags` - Entry categorization
- **RLS Policy:** All queries scoped to `auth.uid()` automatically

### API Routes Pattern
Located in `src/app/api/`:
- `ai/analyze/*` - AI-powered content analysis
- `ai/caption/*` - Image captioning
- `ocr/` - Optical character recognition for uploaded images
- `speech-to-text/` - Audio transcription
- **Pattern:** Extract auth token from header, validate with Supabase, call external service

### Rich Text Editor
- **Component:** `src/components/rich-text-editor.tsx`
- **Library:** TipTap with extensions for bold, italic, headers, blockquotes, tables, task lists
- **Pattern:** Controlled input with `onChange` callbacks, serializes to markdown/HTML

### Media Upload
- **Component:** `src/components/media-upload.tsx`
- **Pattern:** React Dropzone for file handling → upload to Supabase storage (`media` bucket) → save URL to entry

### Voice Recording
- **Component:** `src/components/voice-recorder.tsx`
- **Pattern:** MediaRecorder API → WAV blob → upload to storage → transcribe via `/api/speech-to-text`

## Development Workflows

### Local Setup
```bash
npm install
npm run dev  # Starts Next.js dev server on :3000
```

### Build & Deployment
```bash
npm run build      # Next.js build to .next directory
npm run lint       # ESLint + TypeScript check
npm start          # Production server (local)
```

### Environment Variables
**Required for local development:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ixdwjetlmmffgrhmtssw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

**Note:** These are public keys (exposed to browser). Sensitive keys stay server-side only.

### CI/CD (GitHub Actions)
Three workflows trigger automatically:
1. **deploy.yml** - On push to `main`: lint → build → deploy to Netlify (production)
2. **pr-preview.yml** - On PR: build preview deploy with unique alias `pr-{number}`
3. **lint-and-test.yml** - On PR/push to main: ESLint + TypeScript check

**Required GitHub Secrets:**
- `NETLIFY_AUTH_TOKEN` - Netlify personal access token
- `NETLIFY_SITE_ID` - Your Netlify site ID
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key

## Common Patterns & Conventions

### Component Conventions
- **UI Components** (`src/components/ui/`) - Radix UI + Tailwind wrappers (don't edit)
- **Feature Components** - Client components by default (`'use client'`), use hooks for state
- **Patterns:** React Hook Form for forms, Zustand for complex state, React Toast for notifications

### Styling
- **Framework:** Tailwind CSS (configured in `tailwind.config.js`)
- **Theme:** Dark/light mode via `ThemeProvider` (uses `next-themes`)
- **Pattern:** Compose classes with `clsx()` and `tailwind-merge` to avoid conflicts

### Error Handling
- **UI:** Toast notifications via `useToast()` hook
- **API:** Try-catch blocks with user-friendly error messages
- **Pattern:** Return error details to client, log server errors for debugging

### Type Safety
- **TypeScript** strict mode enabled in `tsconfig.json`
- **Database Types:** Generated from Supabase schema (see `supabase.ts` type definitions)
- **Forms:** Zod schemas for validation (imported from UI components)

## Debugging Tips

1. **Authentication Issues:** Check Supabase session with `supabase.auth.getSession()`
2. **API Failures:** Verify environment variables and auth token in request headers
3. **Build Errors:** Run `npm run lint` locally first, check TypeScript with `npx tsc --noEmit`
4. **Storage Uploads:** Verify Supabase bucket permissions and RLS policies
5. **Type Errors:** Always check generated Supabase types in `src/lib/supabase.ts`

## Making Changes Safely

- **Before modifying database schema:** Test changes in Supabase dashboard, regenerate types
- **Before adding dependencies:** Check compatibility with Next.js 15 and Node 18
- **Before deploying:** Test on preview branch via PR (triggers `pr-preview.yml`)
- **Production deployments:** Only via merged PRs to `main` (triggers `deploy.yml`)
