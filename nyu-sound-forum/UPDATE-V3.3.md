# v3.3 Final Update - Request Limits & Cleanup

## Director/Producer Request Limits

### 1. Maximum 3 Open Requests Per User
**Implementation:**
- Directors/producers can have max 3 open requests at a time
- Checked before allowing new post
- Clear error message: "You have reached the maximum of 3 open requests. Please wait for one to be claimed or archived before posting a new one."

**Why:**
- Prevents spam and duplicate posts
- Encourages quality over quantity
- Each request gets proper visibility
- Professional appearance

**How it works:**
- Check `Request.countOpenByUser(userId)` before creating new request
- If count >= 3, reject with error message
- Once a request is claimed or archived, counter decreases
- User can then post new requests

### 2. Auto-Expire After Shoot Date
**New Feature:** Requests automatically archive after their shoot date passes

**Logic:**
```
IF shoot_date is set
AND shoot_date < today
AND status is still 'open'
THEN auto-archive
```

**Why:**
- No point keeping requests for shoots that already happened
- Automatic cleanup without manual intervention
- Keeps boards current and relevant

**Runs via:** `npm run auto-archive` (add to daily cron job)

### 3. Combined Auto-Archive System
The maintenance script now does THREE things:

1. **Archive old unclaimed** (30+ days, no claims)
2. **Archive past shoot dates** (shoot date has passed)
3. **Archive old gigs** (30+ days unfilled)

**Run daily via cron:**
```bash
0 2 * * * cd /path/to/project && npm run auto-archive
```

---

## UI Cleanup - No Emojis

### Removed All Emojis From:
- Console output
- Navigation (dark mode button now says "Dark"/"Light")
- Status indicators (Open, Claimed, Filled, Pinned, Resolved)
- Home page
- Info banners
- Stats cards

### Why:
- More professional appearance
- Better for accessibility
- Cleaner for NYU pitch
- Some emojis don't render well on all systems

### Changes:
- Dark mode toggle: "Dark" / "Light" (was moon/sun emoji)
- Status badges: "Open", "Claimed" (was checkmark/lightning)
- Pinned posts: "[PINNED]" (was pin emoji)
- Resolved: "Resolved" or "[RESOLVED]" (was checkmark)
- View/reply counts: "Views: 10", "Replies: 5" (was eye/chat emoji)

---

## Database Changes

### New Methods:
- `Request.countOpenByUser(userId)` - Count user's open requests
- `Request.autoExpirePastDates()` - Archive past shoot dates

---

## Testing Checklist

### Request Limits:
- [ ] Login as director
- [ ] Post 3 requests successfully
- [ ] Try to post 4th request - should show error
- [ ] Claim one request (as sound student)
- [ ] Now able to post new request again

### Auto-Expire:
- [ ] Create request with shoot_date in the past
- [ ] Run `npm run auto-archive`
- [ ] Verify request is archived
- [ ] Create request with future shoot_date
- [ ] Run auto-archive
- [ ] Verify request still open

### UI:
- [ ] No emojis in navigation
- [ ] Dark mode toggle shows "Dark"/"Light"
- [ ] Status indicators are text-only
- [ ] Console output has no emojis

---

## Production Setup

### Cron Job:
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cd /path/to/nyu-sound-forum && npm run auto-archive >> /path/to/logs/archive.log 2>&1
```

### Manual Run:
```bash
npm run auto-archive
```

---

## Summary of All Limits

| Limit | Value | Applies To | Why |
|-------|-------|------------|-----|
| Max open requests | 3 | Directors/Producers | Prevent spam |
| Unclaimed archive | 30 days | All open requests | Keep boards fresh |
| Past shoot date | Immediate | Requests with dates | Auto-cleanup |
| Unfilled gigs | 30 days | Open gigs | Keep boards fresh |

---

## Migration from v3.2

No database migration needed! The new methods work with existing schema.

Just:
1. Extract new version
2. Run `npm install`
3. Restart server

Existing data is preserved.

---

## For Your Professor Demo

**Key talking points:**

1. **Quality Control**
   - "We limit directors to 3 open requests to maintain quality"
   - "Prevents spam and ensures each posting gets attention"

2. **Smart Automation**
   - "Requests auto-archive after shoot date passes"
   - "30-day cleanup for unclaimed posts"
   - "System self-regulates without admin intervention"

3. **Professional Appearance**
   - "Clean, text-based interface"
   - "No emojis for professional NYU presentation"
   - "Ready for institutional deployment"

---

**Version:** 3.3.0  
**Status:** Production-ready for Mac demo  
**Date:** February 2026
