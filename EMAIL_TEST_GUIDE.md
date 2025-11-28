# Email Configuration Testing Guide

## 🧪 Test Email Endpoint

A test endpoint has been added to help you verify your email configuration is working correctly on Render.

## How to Test

### Method 1: Quick Verification (No Email Sent)

Visit this URL in your browser:
```
https://your-render-backend.onrender.com/api/recruiter/test-email
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Email configuration verified successfully",
  "details": {
    "smtpVerified": true,
    "emailUser": "your-email@gmail.com",
    "frontendUrl": "https://your-frontend.vercel.app",
    "hint": "Add ?email=your@email.com to send a test email"
  }
}
```

### Method 2: Send Actual Test Email

Visit this URL with your email address:
```
https://your-render-backend.onrender.com/api/recruiter/test-email?email=your@email.com
```

This will:
1. Verify SMTP connection
2. Send an actual test email to the provided address
3. Confirm the email was sent successfully

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Email configuration is working!",
  "details": {
    "smtpVerified": true,
    "testEmailSent": true,
    "messageId": "<some-message-id@gmail.com>",
    "emailUser": "your-email@gmail.com",
    "frontendUrl": "https://your-frontend.vercel.app"
  }
}
```

## Error Responses

### If Email Not Configured

```json
{
  "success": false,
  "message": "Email configuration test failed",
  "error": "Invalid login",
  "details": {
    "emailUser": "NOT SET",
    "emailPass": "NOT SET",
    "frontendUrl": "NOT SET",
    "errorCode": "EAUTH"
  },
  "troubleshooting": [
    "Verify EMAIL_USER is set to your Gmail address",
    "Verify EMAIL_PASS is set to your 16-character App-Specific Password",
    "Make sure 2FA is enabled on your Gmail account",
    "Generate a new App-Specific Password if needed",
    "Check Render logs for detailed error messages"
  ]
}
```

## Interpreting Results

### ✅ Success Indicators

1. **SMTP Verified**: Connection to Gmail SMTP server successful
2. **Test Email Sent**: Email delivered successfully (if you used ?email parameter)
3. **Frontend URL Set**: Shows your Vercel URL (not localhost)
4. **Email User Set**: Shows your Gmail address

### ❌ Common Errors

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `EAUTH` | Authentication failed | Use App-Specific Password, not regular password |
| `ETIMEDOUT` | Connection timeout | Network issue (Render might be blocking SMTP) |
| `ECONNREFUSED` | Connection refused | SMTP server unreachable |
| `Invalid login` | Wrong credentials | Double-check EMAIL_USER and EMAIL_PASS |

## Step-by-Step Testing Process

### Step 1: Deploy with Environment Variables

On Render, set these variables:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  (16-char App Password)
```

### Step 2: Check Server Startup Logs

After deployment, look for this in logs:
```
Creating email transporter with config: { host: 'smtp.gmail.com', port: 587, secure: false, user: 'configured' }
✅ Email transporter verified and ready to send emails
```

If you see ❌ instead, email won't work.

### Step 3: Test the Endpoint

Visit: `https://your-backend.onrender.com/api/recruiter/test-email`

### Step 4: Send Test Email

Visit: `https://your-backend.onrender.com/api/recruiter/test-email?email=your@email.com`

Check your inbox (and spam folder!)

### Step 5: Test Real Recruiter Creation

From your frontend, try creating a recruiter through the manager dashboard.

## Checking Logs on Render

1. Go to Render Dashboard
2. Select your backend service
3. Click "Logs" tab
4. Look for these indicators:

**When server starts:**
```
✅ Email transporter verified and ready to send emails
```

**When creating recruiter:**
```
📧 Attempting to send email to: recruiter@example.com
✅ SMTP connection verified
✅ Password set email sent successfully!
Message ID: <xyz@gmail.com>
```

## Still Not Working?

### Option 1: Switch to SendGrid (Recommended)

SendGrid works reliably on all cloud platforms:

1. Sign up at https://sendgrid.com/
2. Get API key
3. Install: `npm install @sendgrid/mail`
4. Update code to use SendGrid instead of Gmail

### Option 2: Use Render's Email Add-on

Check if Render offers email sending add-ons.

### Option 3: Use Alternative SMTP Service

- Mailgun
- AWS SES
- Postmark
- Resend

## Quick Troubleshooting Checklist

- [ ] Environment variables set on Render?
- [ ] Using App-Specific Password (not regular password)?
- [ ] 2FA enabled on Gmail?
- [ ] App-Specific Password has no spaces?
- [ ] FRONTEND_URL points to Vercel (not localhost)?
- [ ] Test endpoint returns success?
- [ ] Server logs show "✅ Email transporter verified"?
- [ ] Checked spam folder for test email?

## Support

If all checks pass but emails still don't work:
- This is likely a Render network restriction
- Gmail SMTP may be blocked on Render's free tier
- **Solution**: Use SendGrid or another transactional email service

For further help, provide:
1. Screenshot of test endpoint response
2. Render logs from server startup
3. Render logs when creating recruiter
4. Confirmation that env variables are set

