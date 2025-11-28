# Email Configuration for Render Deployment

## ✅ What Was Fixed

1. **Updated SMTP Configuration**: Changed from simple `service: "gmail"` to explicit SMTP configuration that works better on cloud platforms like Render
2. **Added Connection Verification**: Server now verifies email connection on startup
3. **Better Error Logging**: Detailed error messages to help debug email issues
4. **Fixed FRONTEND_URL**: Now properly uses ServerConfig for deployment URLs

## 🔧 Required Setup on Render

### Step 1: Get Gmail App-Specific Password

**IMPORTANT**: You MUST use an App-Specific Password, NOT your regular Gmail password.

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Under "How you sign in to Google", enable **2-Step Verification** (if not already enabled)
4. After enabling 2FA, go back to **Security** → **2-Step Verification**
5. Scroll down and click **App passwords**
6. Select:
   - App: **Mail**
   - Device: **Other (Custom name)**
   - Enter name: **Zepul Render**
7. Click **Generate**
8. **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)
9. **Save this password** - you'll need it for Render

### Step 2: Configure Environment Variables on Render

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your backend service
3. Click **Environment** in the left sidebar
4. Add these environment variables:

```
FRONTEND_URL = https://your-vercel-frontend.vercel.app
EMAIL_USER = your-gmail@gmail.com
EMAIL_PASS = xxxx xxxx xxxx xxxx
```

**Replace:**
- `https://your-vercel-frontend.vercel.app` with your actual Vercel frontend URL
- `your-gmail@gmail.com` with your Gmail address
- `xxxx xxxx xxxx xxxx` with the 16-character app password you generated

### Step 3: Save and Redeploy

1. Click **Save Changes** (Render will automatically redeploy)
2. Wait for deployment to complete
3. Check the logs

## 🔍 Verify It's Working

After deployment, check your Render logs. You should see:

```
Creating email transporter with config: { host: 'smtp.gmail.com', port: 587, secure: false, user: 'configured' }
✅ Email transporter verified and ready to send emails
```

If you see this, email is configured correctly!

### When Creating a Recruiter

You should see logs like:
```
ServerConfig.Frontend_URL: https://your-frontend.vercel.app
Password set URL: https://your-frontend.vercel.app/recruiter/set_password/...
EMAIL_USER configured: true
EMAIL_PASS configured: true
📧 Attempting to send email to: recruiter@example.com
✅ SMTP connection verified
✅ Password set email sent successfully!
Message ID: <some-message-id>
```

## ❌ Troubleshooting

### Issue 1: "Email transporter verification failed"

**Symptoms:**
```
❌ Email transporter verification failed: Invalid login
```

**Solutions:**
1. Make sure you're using the **App-Specific Password**, not your regular Gmail password
2. Check that EMAIL_USER is your complete Gmail address (e.g., `yourname@gmail.com`)
3. Verify no extra spaces in EMAIL_PASS
4. Regenerate a new App-Specific Password and try again

### Issue 2: "Email configuration missing"

**Symptoms:**
```
❌ Email configuration missing: EMAIL_USER or EMAIL_PASS not set
EMAIL_USER: NOT SET
EMAIL_PASS: NOT SET
```

**Solutions:**
1. Verify you added the variables in Render's Environment section
2. Check for typos in variable names (they're case-sensitive)
3. Click "Save Changes" after adding variables
4. Wait for automatic redeploy to complete

### Issue 3: "Connection timeout" or "ETIMEDOUT"

**Symptoms:**
```
❌ Email sending error: Connection timeout
Error code: ETIMEDOUT
```

**Solutions:**
1. This is usually NOT a configuration issue
2. Render's free tier might have network restrictions
3. Consider upgrading to a paid Render plan
4. OR use a dedicated email service (see alternatives below)

### Issue 4: Still seeing localhost URL

**Symptoms:**
```
Password set URL: http://localhost:5173/recruiter/set_password/...
```

**Solutions:**
1. Verify FRONTEND_URL is set in Render environment variables
2. Make sure it doesn't have a trailing slash
3. Check Render logs to confirm the variable is loaded:
   ```
   FRONTEND_URL: https://your-frontend.vercel.app
   ```
4. If still not working, manually redeploy the service

### Issue 5: Gmail blocks the login

**Symptoms:**
```
❌ Email sending error: Invalid login
```

**Solutions:**
1. Use App-Specific Password (most important!)
2. Check Gmail security settings: https://myaccount.google.com/lesssecureapps
3. Check Gmail recent security activity: https://myaccount.google.com/notifications
4. Try logging into Gmail from your browser to ensure account is not locked

## 🚀 Alternative Email Services (Recommended for Production)

Gmail has rate limits (500 emails/day) and may block cloud servers. For production, consider:

### Option 1: SendGrid (Recommended)

**Pros:**
- 100 emails/day free
- Reliable on all cloud platforms
- No 2FA hassles

**Setup:**
1. Sign up at https://sendgrid.com/
2. Get API key
3. Update environment variables:
   ```
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your-api-key
   ```

### Option 2: Mailgun

**Pros:**
- First 5,000 emails free for 3 months
- Professional email tracking

**Setup:**
1. Sign up at https://www.mailgun.com/
2. Get API key and domain
3. Update environment variables:
   ```
   EMAIL_SERVICE=mailgun
   MAILGUN_API_KEY=your-api-key
   MAILGUN_DOMAIN=your-domain
   ```

### Option 3: Resend (Modern Alternative)

**Pros:**
- 100 emails/day free
- Simple API
- Great for transactional emails

**Setup:**
1. Sign up at https://resend.com/
2. Get API key
3. Update environment variables:
   ```
   EMAIL_SERVICE=resend
   RESEND_API_KEY=your-api-key
   ```

## 📝 Environment Variables Checklist

Make sure ALL these are set on Render:

- [x] `FRONTEND_URL` - Your Vercel frontend URL
- [x] `EMAIL_USER` - Your Gmail address
- [x] `EMAIL_PASS` - 16-character App-Specific Password
- [x] `PORT` - Usually 5000 or 10000
- [x] `DB_URL` - Your MongoDB connection string
- [x] `JWT_SECRET` - Your JWT secret
- [x] `ACCESS_TOKEN_SECRET` - Your access token secret
- [x] `NODE_ENV` - Set to `production`

## 🆘 Still Not Working?

1. **Check Render Logs**:
   - Go to your service → Logs
   - Look for email-related errors
   - Screenshot the error and check against troubleshooting guide

2. **Test Locally First**:
   - Set the same environment variables locally
   - Try creating a recruiter
   - If it works locally but not on Render, it's likely a Render network issue

3. **Contact Support**:
   - If using Render free tier, network restrictions might apply
   - Consider upgrading or switching to alternative email service

## ✨ Quick Test Command

To test if your email is configured correctly, you can add this temporary route:

```javascript
// Add to your routes for testing
app.get('/test-email', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ success: true, message: 'Email is configured correctly!' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
```

Visit: `https://your-render-backend.onrender.com/test-email`

## 📧 Support

If you've followed all steps and emails still don't work:
- It's likely a Render network restriction on free tier
- **Recommendation**: Switch to SendGrid or another dedicated email service
- Gmail SMTP is great for development but not ideal for production on cloud platforms

