# ⚡ WhatsApp Scheduling - Quick Start (30 minutes)

**Goal**: Deploy WhatsApp scheduling feature to production  
**Time**: 30-45 minutes  
**Difficulty**: Intermediate  

---

## 🎯 What This Does

Users can schedule WhatsApp reports at custom times/frequencies:
- ✅ Creates schedules from Settings page UI
- ✅ Runs every 15 minutes automatically
- ✅ Sends WhatsApp messages via Twilio
- ✅ Tracks delivery metrics

---

## 📋 Prerequisites

Before you start, have these ready:

- [ ] **Twilio Account** (https://www.twilio.com)
  - Twilio Account SID
  - Twilio Auth Token
  - WhatsApp Phone Number
- [ ] **Google Cloud CLI** installed (`gcloud`)
- [ ] **Firebase CLI** installed (`firebase`)
- [ ] **Git** (for code updates)
- [ ] Access to Netlify environment variables

---

## 🚀 Deploy in 4 Steps

### Step 1: Get Twilio Credentials (5 min)

1. Go to https://www.twilio.com/console
2. Copy your **Account SID** (ACC...)
3. Copy your **Auth Token** (long string)
4. Get **WhatsApp Phone** (looks like +1234567890)

Example:
```
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_PHONE = +1234567890
```

### Step 2: Update Environment Variables (5 min)

**On Netlify**:
1. Go to your site settings
2. Settings → Environment
3. Add three new variables:
   ```
   TWILIO_ACCOUNT_SID = (paste SID)
   TWILIO_AUTH_TOKEN = (paste token)
   TWILIO_WHATSAPP_PHONE = (paste phone)
   ```
4. Click "Save"
5. Trigger redeploy of main branch

**In Terminal** (for Cloud Functions):
```bash
# Set same variables locally
export TWILIO_ACCOUNT_SID=AC...
export TWILIO_AUTH_TOKEN=...
export TWILIO_WHATSAPP_PHONE=+1234567890
```

### Step 3: Deploy Cloud Functions (10 min)

```bash
# Navigate to functions folder
cd /Users/mac/budoor/functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Firebase
npm run deploy
# or: firebase deploy --only functions

# Wait 2-3 minutes for deployment
```

**Verify in Firebase Console**:
- Go to https://console.firebase.google.com
- Select your project
- Cloud Functions section
- Should see:
  - ✅ `sendScheduledWhatsAppReports`
  - ✅ `initializeScheduleNextSendTime`

### Step 4: Create Cloud Scheduler Job (10 min)

```bash
# Create Pub/Sub topic
gcloud pubsub topics create send-whatsapp-reports

# Create scheduler job
gcloud scheduler jobs create pubsub send-whatsapp-reports \
  --schedule="*/15 * * * *" \
  --timezone="Africa/Casablanca" \
  --message-body="{}" \
  --topic=send-whatsapp-reports \
  --location=us-central1
```

**Verify in Google Cloud Console**:
- Go to https://console.cloud.google.com
- Cloud Scheduler
- Should see job "send-whatsapp-reports"
- Status should be "ENABLED"

---

## ✅ Quick Test (5 min)

### Test 1: UI Works
1. Go to your site: `https://budoor.me/dashboard/settings`
2. Scroll to "Planifications WhatsApp"
3. Click "New Schedule"
4. Form should appear with:
   - ✅ Field selector
   - ✅ Frequency picker (daily/weekly/monthly)
   - ✅ Time input
   - ✅ Audio/chart checkboxes

### Test 2: Database Works
1. Create a test schedule via the form
2. Check Firestore:
   - Collection: `users/{YOUR_USER_ID}/whatsappSchedules`
   - Should see your new schedule
   - Field `nextSendAt` should have a date

### Test 3: Message Sends
1. Create schedule for 5 minutes from now
2. Add your phone to user profile:
   - In Firestore: `users/{YOUR_USER_ID}`
   - Add field: `phoneNumber: "+212612345678"`
3. Wait 5+ minutes
4. Check your WhatsApp for message from Twilio number
5. Message should include:
   - 📊 Field name and status
   - 🎯 Recommendations
   - 🎵 Audio link (if enabled)

---

## 🐛 If Something Goes Wrong

### "I don't see the UI component"
- Did you redeploy Netlify? (new env vars require redeploy)
- Check browser console for errors
- Clear browser cache (Ctrl+Shift+Delete)

### "Cloud Function deployment failed"
```bash
# Check what went wrong
firebase deploy --only functions --verbose

# Try again
npm run deploy
```

### "Function never triggers"
```bash
# Check if job exists
gcloud scheduler jobs list

# Check if it's running
gcloud scheduler jobs describe send-whatsapp-reports

# View function logs
gcloud functions logs read sendScheduledWhatsAppReports --limit 50
```

### "No message received"
1. Check phone number format: `+212...` (needs country code)
2. Verify Twilio credentials in env vars
3. Check Twilio logs: https://www.twilio.com/console/sms/logs
4. View Cloud Function logs:
   ```bash
   gcloud functions logs read sendScheduledWhatsAppReports --follow
   ```

---

## 📞 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `401 Unauthorized from Twilio` | Check TWILIO_AUTH_TOKEN is correct |
| `No function deployed` | Run `npm run deploy` from `/functions` folder |
| `Message not received` | Add phone number to Firestore user profile |
| `Schedule not sending` | Check `isActive: true` in Firestore |
| `Scheduler job not found` | Run gcloud commands in Step 4 again |

---

## 🎓 Understanding the System

### User Creates Schedule (Frontend)
```
Settings Page → New Schedule Form → Firestore Document Created
```

### Schedule Auto-Sends (Backend)
```
Cloud Scheduler (every 15 min) 
  ↓
Pub/Sub Topic triggered
  ↓
Cloud Function runs
  ↓
Finds due schedules
  ↓
Generates report
  ↓
Sends WhatsApp via Twilio
  ↓
Updates Firestore (lastSent, nextSend)
```

### What User Sees
```
💬 WhatsApp Message:
📊 Champ de Maïs Report
✅ Status: Healthy
🎯 Recommendations: 
• Water your field
• Check soil pH
• Apply fertilizer
🎵 Audio: [link]
Budoor 🌾
```

---

## 📊 Cost Per Month

| Service | Cost | Notes |
|---------|------|-------|
| Firestore | ~$1-2 | 20K reads/writes per day |
| Cloud Functions | ~$5-10 | ~1,500 invocations/day |
| Cloud Scheduler | Free | Within free tier |
| Twilio | $0.01-0.50 per message | Main cost |
| **Total** | **$50-500** | Depends on volume |

---

## 📚 Need More Help?

### Documentation Files
- **Overview**: `WHATSAPP_IMPLEMENTATION_SUMMARY.md`
- **Technical Setup**: `WHATSAPP_SCHEDULING_GUIDE.md`
- **Detailed Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Developer Guide**: `WHATSAPP_DEVELOPER_GUIDE.md`

### For Specific Topics
- **Architecture**: `WHATSAPP_ARCHITECTURE_DIAGRAMS.md`
- **Finding Files**: `WHATSAPP_FILE_MANIFEST.md`
- **Navigation**: `WHATSAPP_DOCUMENTATION_INDEX.md`

---

## ✨ Success Indicators

When everything is working, you should see:

✅ **Frontend**:
- Settings page has "Planifications WhatsApp" section
- Can create/edit/delete schedules
- Form validates input

✅ **Database**:
- Schedules saved in Firestore
- `nextSendAt` calculated correctly
- Status updates on successful send

✅ **Backend**:
- Cloud Functions deployed (no errors)
- Cloud Scheduler job running (every 15 min)
- Function logs show successful executions

✅ **WhatsApp**:
- Messages received at scheduled times
- Content formatted correctly
- Includes audio link and recommendations

---

## 🎉 You're Done!

Your WhatsApp scheduling feature is now live!

**Next Steps**:
1. Monitor Cloud Function logs for 24 hours
2. Announce feature to users
3. Collect feedback
4. Plan enhancements

---

## 💡 Pro Tips

- **Monitor Logs**: 
  ```bash
  gcloud functions logs read sendScheduledWhatsAppReports --follow
  ```

- **Test Manually**:
  ```bash
  gcloud pubsub topics publish send-whatsapp-reports --message="{}"
  ```

- **Check Scheduler Status**:
  ```bash
  gcloud scheduler jobs describe send-whatsapp-reports
  ```

- **Scale Tips**:
  - Increase Cloud Scheduler frequency if needed
  - Monitor Firestore costs
  - Set Twilio budget limits

---

**Questions?** See `WHATSAPP_DOCUMENTATION_INDEX.md` for the right documentation file!

**Status**: ✅ Ready to Deploy  
**Estimated Time**: 30-45 minutes  
**Complexity**: Intermediate  

Good luck! 🚀
