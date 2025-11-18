# Deployment Configuration Guide

## Required Environment Variables for Email and Password Reset

Your deployed server needs the following environment variables configured:

### 1. Frontend URL Configuration
```env
FRONTEND_URL=https://your-deployed-frontend-url.com
```

**Important:**
- Replace `https://your-deployed-frontend-url.com` with your actual frontend deployment URL
- Do NOT include a trailing slash
- Example: `FRONTEND_URL=https://zepul.vercel.app`

### 2. Email Configuration (Gmail SMTP)
```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-app-specific-password
```

**Important for Gmail:**
- You MUST use an App-Specific Password, not your regular Gmail password
- To generate an App-Specific Password:
  1. Go to https://myaccount.google.com/security
  2. Enable 2-Factor Authentication if not already enabled
  3. Go to "App passwords"
  4. Select "Mail" and "Other (Custom name)"
  5. Generate and copy the 16-character password
  6. Use this password as `EMAIL_PASS`

### 3. Other Required Variables
```env
PORT=5000
DB_URL=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
NODE_ENV=production
```

## Platform-Specific Configuration

### Render.com
1. Go to your service dashboard
2. Navigate to "Environment" tab
3. Add each variable as Key-Value pairs
4. Click "Save Changes"
5. Service will automatically redeploy

### Railway.app
1. Open your project
2. Click on "Variables" tab
3. Add each variable
4. Changes are applied automatically

### Heroku
1. Go to your app dashboard
2. Click "Settings" → "Reveal Config Vars"
3. Add each variable as Key-Value pairs

### Vercel (for Node.js API)
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add variables for Production environment

### DigitalOcean App Platform
1. Go to your app
2. Click "Settings" → "App-Level Environment Variables"
3. Add each variable
4. Redeploy the app

## Verification Steps

After deployment, check your server logs for:

```
Environment variables:
PORT: 5000
FRONTEND_URL: https://your-frontend-url.com
NODE_ENV: production

CORS allowed origins: [...]
ServerConfig.Frontend_URL: https://your-frontend-url.com
```

When creating a recruiter, you should see:
```
ServerConfig.Frontend_URL: https://your-frontend-url.com
Password set URL: https://your-frontend-url.com/recruiter/set_password/...
EMAIL_USER configured: true
EMAIL_PASS configured: true
```

## Troubleshooting

### Issue 1: Still seeing localhost URL
**Problem:** Password reset URL shows `http://localhost:5173`
**Solution:** 
- Verify `FRONTEND_URL` is set in your deployment platform
- Check server logs to confirm it's being loaded
- Restart/redeploy your server after adding the variable

### Issue 2: Emails not sending
**Problem:** Emails work locally but not on deployed server
**Possible causes:**
1. **EMAIL_USER or EMAIL_PASS not set**
   - Solution: Add both variables in deployment platform
   
2. **Using regular Gmail password instead of App Password**
   - Solution: Generate and use an App-Specific Password (see above)
   
3. **Gmail blocking sign-ins from deployed server**
   - Solution: 
     - Use App-Specific Password (recommended)
     - OR enable "Less secure app access" (not recommended)
     - OR use a different SMTP service (SendGrid, Mailgun, etc.)

4. **Gmail rate limiting**
   - Solution: Wait a few minutes and try again
   - Consider using a transactional email service for production

5. **Firewall or network restrictions**
   - Solution: Ensure your hosting platform allows outbound SMTP connections on port 587/465

### Issue 3: Email credentials showing as NOT SET
**Problem:** Logs show `EMAIL_USER: NOT SET` or `EMAIL_PASS: NOT SET`
**Solution:**
- Double-check variable names (case-sensitive)
- Ensure no extra spaces in variable values
- Redeploy after adding variables

## Alternative Email Services (Recommended for Production)

For production, consider using dedicated email services:

### SendGrid
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key
```

### Mailgun
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain
```

### AWS SES
```env
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

## Testing Email Configuration

You can test if emails are working by:
1. Creating a new recruiter from the manager dashboard
2. Checking server logs for email sending confirmation
3. Checking the recipient's inbox (and spam folder)

## Support

If issues persist after following this guide:
1. Check server logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure your hosting platform allows SMTP connections
4. Consider switching to a transactional email service

