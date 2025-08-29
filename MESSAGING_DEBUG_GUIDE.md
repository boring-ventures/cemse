# Messaging Functionality Debug Guide

## Issue Description
Messages sent from the My Applications page (by applicants) are not showing up in the Company Jobs page (company view). The company can only see messages they sent, but not the applicant's responses.

## Current Status
✅ **Fixed**: My Applications page now correctly shows user's own messages
❓ **Investigating**: Company view not showing applicant messages

## Debug Tools Added

### 1. Debug API Endpoint
**Endpoint**: `/api/debug-messages`
**Purpose**: Check database directly for message statistics and recent messages

**Usage**:
```bash
curl http://localhost:3000/api/debug-messages
```

**Expected Output**:
```json
{
  "totalMessages": 10,
  "applicantMessages": 6,
  "companyMessages": 4,
  "recentMessages": [...],
  "applicationsWithMessages": [...]
}
```

### 2. Console Debug Logs
Added detailed logging to:
- `useJobMessages` hook: Shows fetched messages with sender types
- Company Applications Modal: Shows message count and sender types
- My Applications page: Shows message count and sender types

### 3. Visual Debug Info (Development Mode)
Both pages now show debug information in development mode:
- Total message count
- Message sender types
- User ID for comparison

## Testing Steps

### Step 1: Verify Messages are Being Saved
1. Open browser console
2. Go to My Applications page
3. Send a message from an applicant account
4. Check console logs for message creation
5. Visit `/api/debug-messages` to verify message is in database

### Step 2: Check Company View
1. Login as a company user
2. Go to Company Jobs page
3. Open Job Applications modal
4. Check if applicant messages appear
5. Look at debug info and console logs

### Step 3: Cross-Reference Data
1. Compare application IDs between applicant and company views
2. Verify user IDs match expected sender IDs
3. Check sender types are correct ('APPLICANT' vs 'COMPANY')

## Expected Behavior

### For Applicant (My Applications Page):
```typescript
// Should show as own message when:
message.senderType === "APPLICANT" && message.senderId === user?.id

// Should show as received message when:
message.senderType === "COMPANY"
```

### For Company (Company Applications Modal):
```typescript
// Should show as own message when:
message.senderType === "COMPANY"

// Should show as received message when:
message.senderType === "APPLICANT"
```

## Debugging Checklist

- [ ] Messages are being saved to database with correct `senderType`
- [ ] Messages are being fetched correctly (check console logs)
- [ ] Application IDs match between applicant and company views
- [ ] User authentication is working for both roles
- [ ] No permission errors in API calls
- [ ] Message ownership logic is correct in both components

## Common Issues to Check

### 1. Application ID Mismatch
- Applicant and company might be looking at different application records
- Check if application IDs are consistent

### 2. Authentication Issues
- Company user might not have permission to view messages
- Check if authentication tokens are valid

### 3. Database Schema Issues
- Verify foreign key relationships are correct
- Check if messages are linked to the right applications

### 4. Hook Usage Issues
- Both components use `useJobMessages(applicationId)`
- Verify applicationId is the same in both contexts

## API Endpoints Involved

1. **GET** `/api/jobapplication-messages/[applicationId]/messages`
   - Fetches all messages for an application
   - Should return both APPLICANT and COMPANY messages

2. **POST** `/api/jobapplication-messages/[applicationId]/messages`
   - Creates new messages
   - Sets senderType based on user role

3. **GET** `/api/debug-messages` (Debug only)
   - Shows database statistics
   - Helps verify messages are being saved correctly

## Next Steps

1. **Test with real data**: Send messages from both applicant and company accounts
2. **Check console logs**: Look for detailed message information
3. **Use debug endpoint**: Verify messages exist in database
4. **Compare application IDs**: Ensure both sides reference the same application
5. **Check permissions**: Verify company users can access applicant messages

## Clean Up

After debugging is complete, remove:
- Debug console logs from `useJobMessages` hook
- Debug visual elements from both components
- Debug API endpoint (or secure it for production use)

## Files Modified

- `src/hooks/use-job-messages.ts` - Added detailed logging
- `src/app/(dashboard)/my-applications/page.tsx` - Added debug info
- `src/components/jobs/company/job-applications-modal.tsx` - Added debug info
- `src/app/api/debug-messages/route.ts` - New debug endpoint
- `debug-messaging-issue.js` - Debug script
- `MESSAGING_DEBUG_GUIDE.md` - This guide
