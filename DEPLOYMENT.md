# Deployment Guide for NexusBot

This guide will walk you through deploying NexusBot to Vercel.

## Prerequisites

1. **GitHub Account**: Create one at [github.com](https://github.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (use your GitHub account)
3. **OpenAI API Key**: Get one from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - NexusBot"
   ```

2. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name it `nexusbot`
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nexusbot.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"

2. **Import Repository**:
   - Select your `nexusbot` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: Your OpenAI API key
   - Click "Add"

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)

6. **Visit Your Site**:
   - Once deployed, click "Visit" to see your live site
   - Your NexusBot is now live! 🎉

## Step 3: Custom Domain (Optional)

1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

## Updating Your Deployment

Whenever you push changes to GitHub, Vercel will automatically redeploy:

```bash
git add .
git commit -m "Update: description of changes"
git push
```

## Environment Variables

Make sure these are set in Vercel:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

## Troubleshooting

### Build Fails

**Issue**: Build fails with module errors

**Solution**: 
- Check that all dependencies are in `package.json`
- Ensure `--legacy-peer-deps` is used if needed
- Add to `package.json` scripts:
  ```json
  "build": "npm install --legacy-peer-deps && next build"
  ```

### API Key Not Working

**Issue**: Chat doesn't respond or shows errors

**Solution**:
- Verify `OPENAI_API_KEY` is set in Vercel environment variables
- Redeploy after adding environment variables
- Check OpenAI API key is valid and has credits

### Knowledge Base Not Loading

**Issue**: Bot says it has no information

**Solution**:
- Ensure `/knowledge` folder is committed to Git
- Check markdown files are properly formatted
- Verify files are in the correct location

## Alternative Deployment Platforms

### Netlify

1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard

### Railway

1. Create new project from GitHub repo
2. Add environment variables
3. Railway auto-detects Next.js and deploys

### AWS Amplify

1. Connect repository
2. Configure build settings
3. Add environment variables
4. Deploy

## Performance Optimization

For production, consider:

1. **Caching**: Implement caching for knowledge base queries
2. **CDN**: Use Vercel's Edge Network (automatic)
3. **Image Optimization**: Use Next.js Image component
4. **Analytics**: Add Vercel Analytics for insights

## Monitoring

Monitor your deployment:

1. **Vercel Dashboard**: View deployment logs and analytics
2. **OpenAI Dashboard**: Monitor API usage and costs
3. **Error Tracking**: Consider adding Sentry or similar

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth
- **OpenAI**: Pay per API call (~$0.002 per request with GPT-3.5)
- Estimate: ~500 requests = $1

## Security Checklist

- ✅ `.env` is in `.gitignore`
- ✅ API keys are in environment variables, not code
- ✅ CORS is properly configured
- ✅ Rate limiting is implemented (if needed)

## Next Steps

After deployment:

1. Test the chat widget thoroughly
2. Monitor API usage
3. Gather user feedback
4. Update knowledge base as needed
5. Consider adding analytics

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Next.js documentation
3. Check OpenAI API status
4. Open an issue on GitHub

---

**Congratulations! Your NexusBot is now live! 🚀**
