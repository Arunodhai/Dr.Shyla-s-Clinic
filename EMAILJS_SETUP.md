# EmailJS Setup Instructions

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account (free tier allows 200 emails/month)

## Step 2: Create an Email Service
1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred email provider)
4. Connect your email account (arunodhai007@gmail.com)
5. Copy the **Service ID** (you'll need this)

## Step 3: Create an Email Template
1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template:

**Template Name:** Contact Form Submission

**Subject:** New Appointment Request from {{from_name}}

**Content:**
```
New appointment request received!

Name: {{from_name}}
Phone: {{phone}}
Concern: {{concern}}
Description: {{concern_description}}

Please contact them at {{phone}} to schedule an appointment.

---
This email was sent from Dr. Shyla's Skin & Cosmetic Clinic contact form.
```

4. Save the template and copy the **Template ID**

## Step 4: Get Your Public Key
1. Go to **Account** → **General** in the dashboard
2. Copy your **Public Key** (also called API Key)

## Step 5: Update script.js
Open `script.js` and replace these three values:

1. Replace `YOUR_PUBLIC_KEY` with your Public Key
2. Replace `YOUR_SERVICE_ID` with your Service ID
3. Replace `YOUR_TEMPLATE_ID` with your Template ID

Example:
```javascript
emailjs.init('abc123xyz'); // Your Public Key
await emailjs.send(
  'service_abc123',    // Your Service ID
  'template_xyz789',   // Your Template ID
  templateParams
);
```

## Step 6: Test the Form
1. Open your website
2. Fill out the contact form
3. Submit it
4. Check arunodhai007@gmail.com for the email

## Troubleshooting
- Make sure all three IDs are correctly replaced in script.js
- Check the browser console (F12) for any error messages
- Verify your EmailJS service is connected and active
- Free tier allows 200 emails/month - upgrade if you need more
