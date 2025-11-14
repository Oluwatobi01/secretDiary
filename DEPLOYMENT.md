# Secret Diary - Netlify Deployment Guide

## Overview
Secret Diary is a feature-rich journaling application with AI-powered insights, voice recording, and multimedia support.

## Features Implemented
- ✅ Rich text editor with markdown support
- ✅ Voice recording and audio transcription
- ✅ Photo/video upload with OCR scanning
- ✅ Multiple journals and tagging system
- ✅ AI-powered emotion detection and insights
- ✅ User authentication with Supabase
- ✅ Search and filtering capabilities
- ✅ Dark/light theme support
- ✅ Responsive design

## Environment Variables
Create these in your Netlify dashboard under Site settings > Build & deploy > Environment:

```
NEXT_PUBLIC_SUPABASE_URL=https://ixdwjetlmmffgrhmtssw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZHdqZXRsbW1mZmdyaG10c3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjA0MTUsImV4cCI6MjA3ODY5NjQxNX0.WYPBGBeehClZGLZbNWBrTgh10Rn6PYOmlPsVuWGjmy8
```

## Database Setup
1. Run the SQL schema in `supabase-schema.sql` in your Supabase SQL editor
2. Enable storage and create the 'media' bucket
3. Set up Row Level Security policies as defined in the schema

## Deployment Steps

### 1. Connect to Git
```bash
# If not already done, push to GitHub
git add .
git commit -m "Deploy Secret Diary to Netlify"
git push origin main
```

### 2. Netlify Configuration
1. Go to Netlify dashboard
2. Click "Add new site" > "Import an existing project"
3. Connect to your GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

### 3. Environment Variables
Add the environment variables listed above in Netlify's dashboard.

### 4. Deploy
Netlify will automatically deploy on push to main branch.

## Post-Deployment Setup
1. Test authentication flow
2. Verify Supabase connection
3. Test file uploads to storage
4. Test AI features (requires ZAI SDK configuration)

## Premium Features (Future Implementation)
- Unlimited photo uploads (currently limited)
- Advanced AI insights
- Export functionality
- Custom themes
- Priority support

## Security Considerations
- All API routes are protected with authentication
- File uploads are validated and scanned
- Row Level Security enabled in Supabase
- Content Security Policy headers configured
- XSS protection enabled

## Performance Optimizations
- Next.js Image optimization
- Lazy loading for media
- Efficient database queries
- CDN distribution via Netlify

## Monitoring
- Netlify Analytics for performance
- Supabase dashboard for database metrics
- Error tracking via console logs

## Support
For issues or questions:
1. Check Netlify build logs
2. Verify Supabase configuration
3. Review browser console for errors
4. Check environment variables