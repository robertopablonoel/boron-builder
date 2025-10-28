# Task 15: Deployment

⏱ **Estimated Time:** 3 hours

## Objectives

- Configure production environment variables
- Deploy to Vercel
- Set up monitoring
- Test production build

## Steps

### 1. Production Environment

```bash
# Add production env vars in Vercel dashboard
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add ANTHROPIC_API_KEY production
```

### 3. Test Production

```bash
# Visit your deployed URL
open https://your-app.vercel.app

# Test funnel generation
# Test iteration
# Check mobile responsiveness
```

### 4. Monitoring Setup

- Add error tracking (Sentry)
- Set up analytics (Plausible/PostHog)
- Configure uptime monitoring

## Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] API key works in production
- [ ] Mobile Safari tested
- [ ] Desktop Chrome tested
- [ ] Error boundaries working
- [ ] Rate limiting tested
- [ ] Lighthouse score > 90
- [ ] Accessibility audit passed

---

**Status:** ✅ MVP Complete! 🎉
