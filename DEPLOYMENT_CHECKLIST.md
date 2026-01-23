# WhatsApp Scheduling - Deployment Checklist

## Pre-Deployment ✅

- [ ] All components merged to main branch
- [ ] No TypeScript compilation errors
- [ ] Firebase security rules updated
- [ ] Twilio account created and WhatsApp sandbox enabled
- [ ] Environment variables documented

---

## Deployment Phase

### 1. Netlify Configuration

- [ ] Add Twilio credentials to Netlify environment:
  ```
  TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  TWILIO_AUTH_TOKEN = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  TWILIO_WHATSAPP_PHONE = +1234567890
  ```
- [ ] Verify env vars appear in Netlify Dashboard → Settings → Environment
- [ ] Redeploy main branch to apply env vars

### 2. Firebase Setup

- [ ] Update Firestore security rules (see guide)
- [ ] Deploy rules:
  ```bash
  firebase deploy --only firestore:rules
  ```

### 3. Cloud Functions Deployment

- [ ] Navigate to functions directory:
  ```bash
  cd /Users/mac/budoor/functions
  ```
- [ ] Install/update dependencies:
  ```bash
  npm install
  ```
- [ ] Build TypeScript:
  ```bash
  npm run build
  ```
- [ ] Deploy functions:
  ```bash
  npm run deploy
  # or
  firebase deploy --only functions
  ```
- [ ] Verify functions appear in Firebase Console:
  - sendScheduledWhatsAppReports (Pub/Sub trigger)
  - initializeScheduleNextSendTime (Firestore trigger)

### 4. Cloud Scheduler Job

- [ ] Create Cloud Scheduler job (run from gcloud CLI):
  ```bash
  gcloud scheduler jobs create pubsub send-whatsapp-reports \
    --schedule="*/15 * * * *" \
    --timezone="Africa/Casablanca" \
    --message-body="{}" \
    --topic=send-whatsapp-reports \
    --location=us-central1
  ```
- [ ] Verify job in Google Cloud Console:
  - Scheduler → Jobs
  - Should show "send-whatsapp-reports" with "Every 15 minutes"

### 5. Pub/Sub Topic

- [ ] Create topic (if not auto-created):
  ```bash
  gcloud pubsub topics create send-whatsapp-reports
  ```
- [ ] Verify Cloud Function subscription created
- [ ] Test topic by triggering manually:
  ```bash
  gcloud pubsub topics publish send-whatsapp-reports --message="{}"
  ```

---

## Testing Phase

### 1. UI Testing

- [ ] Navigate to `/dashboard/settings`
- [ ] Locate "Planifications WhatsApp" section
- [ ] "New Schedule" form appears
- [ ] Can select field (parcelle)
- [ ] Frequency picker works (daily/weekly/monthly)
- [ ] Time input accepts 24-hour format
- [ ] Timezone dropdown shows options
- [ ] Can toggle audio/charts options
- [ ] Can type custom message
- [ ] Submit button creates schedule in Firestore

### 2. Database Testing

- [ ] Check Firestore:
  ```
  Collection: users/{userId}/whatsappSchedules
  Document should contain all fields from WhatsAppSchedule interface
  ```
- [ ] Verify `nextSendAt` calculated correctly
- [ ] Confirm `createdAt` timestamp set

### 3. Manual Function Trigger

- [ ] Manually trigger Cloud Function:
  ```bash
  gcloud functions call sendScheduledWhatsAppReports \
    --data='{}' \
    --region=us-central1
  ```
- [ ] Check logs for execution:
  ```bash
  gcloud functions logs read sendScheduledWhatsAppReports --limit 20
  ```

### 4. Twilio Integration Test

- [ ] Create test schedule with known time window
- [ ] Add phone number to Firestore user document:
  ```
  Field: phoneNumber
  Value: +212612345678 (your Twilio sandbox number)
  ```
- [ ] Wait for scheduled time OR trigger manually
- [ ] Check if WhatsApp message received
- [ ] Verify message contains:
  - Report summary
  - Recommendations
  - Audio link (if included)
  - Darija script (if included)

### 5. Error Scenarios

- [ ] Test with inactive schedule (should skip)
- [ ] Test with missing phone number (should log error)
- [ ] Test with invalid timezone (should handle gracefully)
- [ ] Test with offline user (function should continue)
- [ ] Check Twilio logs for any 400/401 errors

---

## Production Validation

### 1. Logs Monitoring

- [ ] Set up Cloud Function logging:
  ```bash
  gcloud functions logs read sendScheduledWhatsAppReports \
    --limit 50 \
    --follow
  ```

### 2. Performance Metrics

- [ ] Monitor execution time (target: < 5 seconds per batch)
- [ ] Track success/failure rates:
  ```bash
  gcloud logging read \
    "resource.type=cloud_function AND \
     resource.labels.function_name=sendScheduledWhatsAppReports" \
    --limit 100
  ```

### 3. Firestore Monitoring

- [ ] Check Firestore usage in Cloud Console
- [ ] Monitor write operations (especially `nextSendAt` updates)
- [ ] Verify indexes created for queries

### 4. Twilio Metrics

- [ ] View Twilio logs: https://www.twilio.com/console/sms/logs
- [ ] Check message delivery status
- [ ] Monitor costs per message
- [ ] Note: Sandbox mode is free but limited to pre-approved numbers

---

## Post-Deployment

### 1. Documentation

- [ ] Update README with WhatsApp scheduling feature description
- [ ] Document admin procedures for managing schedules
- [ ] Create user-facing documentation

### 2. User Communication

- [ ] Announce feature to existing users
- [ ] Create in-app tutorial/onboarding for schedule creation
- [ ] Set expectations on delivery reliability

### 3. Monitoring Setup

- [ ] Enable Cloud Function error notifications
- [ ] Create Cloud Monitoring alert for:
  - Function execution failures
  - High error rates (> 5% failed sends)
  - Function timeouts

### 4. Backup & Recovery

- [ ] Document Firestore backup strategy
- [ ] Create disaster recovery procedure if Cloud Functions fail
- [ ] Plan for graceful degradation (e.g., if Twilio is down)

---

## Rollback Plan

If issues arise:

1. **Disable Scheduler**:
   ```bash
   gcloud scheduler jobs pause send-whatsapp-reports
   ```

2. **Disable Schedules** (all):
   ```bash
   # Update all schedules to isActive: false in Firestore
   ```

3. **Pause Cloud Functions**:
   ```bash
   # In Firebase Console, pause all scheduled functions
   ```

4. **Communicate Status**:
   - Update status page
   - Notify users in settings page

---

## Sign-Off

- [ ] Deployment Lead: _____________ Date: _______
- [ ] QA Verification: _____________ Date: _______
- [ ] Ops Handoff: ______________ Date: _______

---

## Contacts

- **Twilio Support**: https://support.twilio.com
- **Firebase Support**: https://firebase.google.com/support
- **Google Cloud Support**: https://cloud.google.com/support
