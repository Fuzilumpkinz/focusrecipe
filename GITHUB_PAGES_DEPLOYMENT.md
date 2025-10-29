# GitHub Pages Deployment Guide

This guide will help you deploy the FocusRecipe app to GitHub Pages with automated CI/CD.

## Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to a GitHub repository
2. **Supabase Project**: Have your Supabase project set up with the required tables
3. **Environment Variables**: Have your Supabase URL and anon key ready

## Step 1: Configure Environment Variables

Create environment variables in your GitHub repository:

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Step 2: Enable GitHub Pages

1. Go to **Settings** → **Pages** in your repository
2. Under "Build and deployment", select **GitHub Actions** as the source
3. Save the settings

## Step 3: Update Base Path (if needed)

The current configuration assumes your repository is named `recipeApp`. If your repository has a different name, update the `base` path in `vite.config.js`:

```javascript
base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
```

## Step 4: Deploy

### Automatic Deployment

1. Push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy your app
3. Check the **Actions** tab to monitor the deployment process
4. Once complete, your app will be available at: `https://your-username.github.io/recipeApp/`

### Manual Deployment (Optional)

If you want to test locally before deploying:

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

## Step 5: Configure Supabase CORS

Add your GitHub Pages URL to your Supabase project's CORS settings:

1. Go to your Supabase dashboard
2. Navigate to **Project Settings** → **API**
3. Under "CORS", add your GitHub Pages URL: `https://your-username.github.io`
4. Save the settings

## Step 6: Test the Deployment

1. Visit your deployed app
2. Test user registration and login
3. Test the family invitation feature
4. Verify all functionality works as expected

## Troubleshooting

### Common Issues

1. **404 Errors**: Make sure the `base` path in `vite.config.js` matches your repository name
2. **Environment Variables**: Ensure they're correctly set in GitHub Secrets
3. **CORS Issues**: Add your GitHub Pages URL to Supabase CORS settings
4. **Build Failures**: Check the Actions tab for detailed error logs

### Debug Mode

To debug deployment issues:

1. Check the GitHub Actions logs in the **Actions** tab
2. Look for any build errors or warnings
3. Ensure all dependencies are properly installed
4. Verify the build output in the `dist` folder

## Security Notes

- The `.gitignore` file ensures sensitive files like `.env` are not committed
- Environment variables are stored securely in GitHub Secrets
- Database migration files are excluded from the deployment
- API keys and credentials are never exposed in the client-side code

## Custom Domain (Optional)

If you want to use a custom domain:

1. Go to **Settings** → **Pages** → **Custom domain**
2. Add your custom domain
3. Configure DNS settings as directed by GitHub
4. Update your Supabase CORS settings to include the custom domain

## Performance Optimization

The deployment includes several optimizations:

- Code splitting for better loading performance
- PWA capabilities for offline access
- Optimized asset bundling
- Minified CSS and JavaScript

## Maintenance

- Regular updates to dependencies
- Monitor GitHub Actions for any build issues
- Keep Supabase credentials secure
- Test new features before deploying to production

---

**Note**: Make sure your Supabase project has the proper RLS (Row Level Security) policies configured to ensure data security in the deployed environment.
