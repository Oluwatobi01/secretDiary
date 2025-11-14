# GitHub Actions Setup Guide

This guide walks you through connecting your repository to GitHub and configuring the automated deployment pipeline to Netlify.

## Step 1: Create GitHub Repository

### Option A: Create a new repository on GitHub
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `secretdia` (or your preferred name)
3. Visibility: **Public** (as specified)
4. Click "Create repository"
5. Copy the repository URL (e.g., `https://github.com/yourusername/secretdia.git`)

### Option B: If you already have an existing repo
Skip to Step 2

## Step 2: Connect Local Repository to GitHub

In your project directory (`c:\Users\USER\Desktop\secretdia`), run:

```cmd
cd c:\Users\USER\Desktop\secretdia
git init
git add .
git commit -m "Initial commit: Secret Diary with GitHub Actions workflows"
git branch -M main
git remote add origin https://github.com/yourusername/secretdia.git
git push -u origin main
```

Replace `yourusername` with your GitHub username.

## Step 3: Obtain Netlify Credentials

### Get NETLIFY_AUTH_TOKEN
1. Log into [Netlify Dashboard](https://app.netlify.com)
2. Click your avatar (bottom-left) → "User settings"
3. Go to "Applications" → "Netlify API tokens"
4. Click "New token" → give it a name (e.g., "GitHub Actions")
5. Copy the token (you'll only see it once!)

### Get NETLIFY_SITE_ID
1. In Netlify Dashboard, open your site
2. Go to "Site settings" → "General"
3. Look for "Site ID" (should be a random string)
4. Copy it

### Create a New Netlify Site (if you don't have one)
1. In Netlify Dashboard, click "Add new site" → "Deploy manually"
2. Name it (e.g., `secretdia`)
3. Deploy any placeholder file
4. You'll get a Site ID immediately

## Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add these 4 secrets:

| Secret Name | Value | Where to find |
|------------|-------|---------------|
| `NETLIFY_AUTH_TOKEN` | Your Netlify personal access token | Netlify Dashboard → User settings → API tokens |
| `NETLIFY_SITE_ID` | Your Netlify site ID | Netlify Dashboard → Site settings → General |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ixdwjetlmmffgrhmtssw.supabase.co` | Already in your `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Already in your `.env.local` |

**Important:** These are marked `NEXT_PUBLIC_*` intentionally - they're public keys exposed in browser. Never add private keys like service_role keys to GitHub!

## Step 5: Verify Workflows Are Ready

After pushing to GitHub:
1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see 3 workflows listed:
   - "Lint & Type Check"
   - "Deploy to Netlify"
   - "PR Preview Deployment"

They're ready to run on your next push!

## Step 6: Test the Pipeline

### Test 1: Create a PR
1. Create a new branch: `git checkout -b test-workflow`
2. Make a small change to `README.md`
3. Commit: `git add . && git commit -m "Test workflow"`
4. Push: `git push origin test-workflow`
5. Create a PR on GitHub
6. Watch the "Lint & Type Check" and "PR Preview Deployment" workflows run
7. You'll see a preview URL comment on your PR (from Netlify)

### Test 2: Merge to Main (Production Deploy)
1. Merge the PR to `main` on GitHub
2. Go to **Actions** tab
3. Watch "Deploy to Netlify" workflow run
4. After completion, your site will be live on Netlify!

## Workflow Behavior

### On Every Push to `main`
- ✅ Runs linting and TypeScript check
- ✅ Builds the application
- ✅ Deploys to Netlify production (overwrites live site)
- ✅ Creates a GitHub commit status check

### On Every Pull Request
- ✅ Runs linting and TypeScript check
- ✅ Builds the application
- ✅ Deploys a preview to unique Netlify URL (e.g., `pr-123.yoursite.netlify.app`)
- ✅ Posts preview URL as a comment on the PR
- ✅ No main production site is affected

### Manual Trigger
- You can manually run "Deploy to Netlify" from the Actions tab if needed

## Troubleshooting

### Workflows Don't Appear
- **Solution:** Make sure you've pushed the `.github/workflows/*.yml` files to `main`
- Check: `git log --oneline` and verify commits are on GitHub

### Build Fails with "Environment Variables Not Found"
- **Solution:** Verify all 4 secrets are added in GitHub Settings
- The secrets must exactly match the names in the workflows

### Netlify Deployment Shows 404
- **Solution:** Check that `NETLIFY_SITE_ID` is correct
- Verify the site exists in your Netlify Dashboard
- Check the Netlify build logs (click site → "Deploys")

### Preview URL Not Posted to PR
- **Solution:** This requires `pull-requests: write` permission (already configured)
- Verify the workflow file has the right permissions (see `pr-preview.yml`)

## Next Steps

1. **Monitor first deployment:** Check the Actions tab to ensure workflows complete successfully
2. **Update environment locally:** Copy Netlify's assigned domain to your `.env.local` for testing
3. **Configure custom domain (optional):** In Netlify Settings → "Domain management"
4. **Set up notifications (optional):** GitHub Actions → Choose how to be notified of failures

## Questions?

- **GitHub Actions:** See [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Netlify Deployment:** See [Netlify CI/CD Documentation](https://docs.netlify.com/configure-builds/overview/)
- **Environment Variables:** See [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)
