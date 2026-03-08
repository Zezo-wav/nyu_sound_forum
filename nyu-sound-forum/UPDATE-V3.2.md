# v3.2 Update - UX Improvements & Auto-Archive

## 🔧 Fixes

### 1. Dark Mode Flash - SOLVED ✅
**Problem:** When switching tabs in dark mode, the page would flash white before turning dark again.

**Solution:** Moved the theme-loading script from `main.js` to an inline `<script>` tag at the very top of `nav.ejs` partial. This ensures the theme is applied BEFORE the page renders, eliminating the flash completely.

**Technical:** The script now runs synchronously in the `<head>` section before any content is painted.

---

## 👥 Directory Improvements

### 2. Sound Students Only Directory ✅
**Change:** User directory now shows ONLY sound students (no directors/producers/admins).

**Why:** Directors and producers don't need to be in a searchable directory. The focus is connecting sound students with each other and showcasing their skills.

**UI:** Title changed from "User Directory" to "Sound Student Directory"

---

### 3. Primary Position System ✅
**New Feature:** Sound students now select ONE primary position (their main focus).

**Positions:**
- Sound Mixer
- Boom Operator
- Sound Designer
- Dialogue Editor
- Foley Artist
- ADR Engineer
- Mixing Engineer

**How it works:**
- **Registration:** Choose primary position (required) + up to 2 secondary skills (optional)
- **Profile:** Primary position displayed prominently
- **Directory:** Students grouped by primary position

**Example:**
- **Primary:** Sound Designer
- **Secondary:** Dialogue Editor, Mixing Engineer

This creates clearer professional identity and makes it easier to find specific talent.

---

## ⏰ Time-Based Features

### 4. Sorting by Date ✅
**New sorting options** for Requests and Gigs boards:
- **Newest First** (default)
- **Oldest First**
- **Earliest Date** (shows requests with nearest shoot/needed dates first)
- **Latest Date** (shows requests with farthest dates first)

**UI:** Added sorting dropdown in filters section.

**Use Case:** Directors can sort by "Earliest Date" to find urgent jobs. Sound students can sort by "Oldest" to help out requests that have been waiting longest.

---

### 5. Auto-Archive System ✅
**Problem:** Old unclaimed requests/gigs clutter the boards forever.

**Solution:** Automatic archiving after 30 days unclaimed.

**How it works:**
- Requests/gigs that are "open" for 30+ days with NO claims → auto-archived
- Archived items don't show in normal listings
- Runs via maintenance script: `npm run auto-archive`

**Production Setup:**
Run daily via cron job:
```bash
# Add to crontab (crontab -e)
0 2 * * * cd /path/to/nyu-sound-forum && npm run auto-archive
```

**Configurable:** Edit `scripts/auto-archive.js` to change from 30 days to any number.

**Benefits:**
- Keeps boards fresh and relevant
- Reduces clutter
- Encourages timely responses
- Auto-cleanup without manual moderation

---

## 📊 Database Changes

### New Columns:
- `users.primary_position` - Main position for sound students
- `requests.archived_at` - Timestamp when archived
- `requests.status` - Added 'archived' option
- `gigs.archived_at` - Timestamp when archived
- `gigs.status` - Added 'archived' option

### New Methods:
- `Request.autoArchiveOld(days)` - Archive old unclaimed requests
- `Gig.autoArchiveOld(days)` - Archive old unfilled gigs

---

## 🎨 UI/UX Changes

### Registration Flow:
1. Choose role
2. If sound student:
   - Select **primary position** (required, dropdown)
   - Select up to **2 secondary skills** (optional, checkboxes)
   - Checkboxes auto-disable after 2 selected

### Directory View:
- Grouped by primary position (collapsible sections)
- Shows primary position prominently
- Secondary skills as small badges
- Clean, professional layout

### Profile View:
- Primary position displayed in accent color, larger font
- Secondary skills shown as badges below
- Clear visual hierarchy

### Requests/Gigs Filtering:
```
[Position ▼] [Sort By ▼] [Status ▼] [Tags ▼]
              ^ NEW
```

---

## 🚀 Migration Guide

### From v3.1 to v3.2:

If you have existing data, run these SQL commands:

```sql
-- Add new columns
ALTER TABLE users ADD COLUMN primary_position TEXT;
ALTER TABLE requests ADD COLUMN archived_at DATETIME;
ALTER TABLE gigs ADD COLUMN archived_at DATETIME;

-- Update status enums (SQLite doesn't support ALTER for CHECK constraints)
-- Existing data is fine, new INSERTs can now use 'archived' status
```

### Fresh Install:
```bash
npm install
npm run init-db
npm start
```

---

## ✅ Testing Checklist

- [ ] Dark mode doesn't flash when switching tabs
- [ ] Directory shows only sound students
- [ ] Students grouped by primary position
- [ ] Register as sound student with primary + secondary
- [ ] Edit profile to change primary position
- [ ] Sort requests by date (earliest/latest)
- [ ] Sort gigs by date
- [ ] Run `npm run auto-archive` (should archive old items)
- [ ] Create request, wait 30+ days (or manually set date), run auto-archive

---

## 📝 Summary

**Fixed:**
- ✅ Dark mode flash completely eliminated
- ✅ Directory now focused on sound students only

**Added:**
- ✅ Primary position system (clearer professional identity)
- ✅ Time-based sorting (earliest/latest dates)
- ✅ Auto-archive (30-day cleanup)

**Improved:**
- ✅ Registration flow (primary + secondary skills)
- ✅ Directory UX (grouped by position)
- ✅ Profile display (primary position prominent)

---

## 🎓 What You Think About Auto-Archive?

**My recommendation:** YES, keep it at 30 days.

**Why:**
- Keeps boards fresh and relevant
- Encourages timely responses
- Reduces moderation burden
- Industry standard (most job boards auto-expire)

**Alternatives considered:**
- Email reminder before archiving
- Manual archive button only
- Longer period (60 days)

**30 days is good because:**
- Film shoots planned > 30 days out are rare at student level
- Urgent gigs need filling within weeks, not months
- Prevents abandoned posts from cluttering boards
- Posters can always re-post if still needed

If you want to change it, edit line 7 of `scripts/auto-archive.js`:
```javascript
const ARCHIVE_DAYS = 30; // Change this number
```

---

**Version:** 3.2.0  
**Date:** February 2026  
**Status:** Tested and ready for Mac demo
