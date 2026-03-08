# v3.4 Update - Forum Restrictions & UX Improvements

## Changes

### 1. Forum Restricted to Sound Students Only
**Why:** Forum is for sound students to ask technical questions and help each other. Directors/producers don't need access.

**Implementation:**
- All forum routes now require `ensureSoundStudent` middleware
- Forum nav link hidden from directors/producers
- If director/producer tries to access `/forum`, they get error: "Only sound students can access this page"

**Affected routes:**
- GET `/forum` - Browse posts
- GET `/forum/new` - Create post form
- POST `/forum` - Submit post
- GET `/forum/:id` - View post
- POST `/forum/:id/reply` - Reply to post
- POST `/forum/:id/resolve` - Mark resolved
- GET `/forum/resolved` - Resolved archive

**Who can access forum:**
- ✅ Sound students
- ✅ Admins (still have access for moderation)
- ❌ Directors
- ❌ Producers

---

### 2. Collapsible Directory Sections
**Why:** With 7 positions, the directory page was getting long. Collapsible sections make it easier to navigate.

**How it works:**
- Click position header to collapse/expand that section
- Arrow rotates to show state (▼ = open, ▶ = closed)
- All sections open by default
- Smooth CSS transitions

**UI:**
```
Sound Designer (1)  ▼
[shows students]

Boom Operator (1)  ▶
[hidden]
```

**Benefits:**
- Cleaner view
- Easier to focus on specific positions
- Better for mobile

---

### 3. Auto-Detect System Theme
**Before:** Always defaulted to light mode on first visit

**Now:** Checks user's system preference
- Mac dark mode → Site starts in dark mode
- Mac light mode → Site starts in light mode
- Uses `window.matchMedia('(prefers-color-scheme: dark)')`
- Only applies on first visit (respects manual toggle after that)

**How it works:**
1. Check if user has saved preference in localStorage
2. If no saved preference, check system theme
3. Apply detected theme
4. Save to localStorage
5. Manual toggle overrides system preference

---

## Testing

### Forum Restrictions:
1. Login as `director@nyu.edu / director123`
2. Notice "Forum" is missing from nav
3. Try visiting `/forum` directly - should get error
4. Login as `sound@nyu.edu / sound123`
5. Forum appears in nav and is accessible

### Collapsible Directory:
1. Go to Directory page
2. See 7 position sections (all expanded)
3. Click "Sound Designer (1)" header
4. Section collapses, arrow rotates
5. Click again to expand

### Auto Theme:
1. Clear localStorage: `localStorage.clear()`
2. Set Mac to dark mode (System Preferences → General → Appearance → Dark)
3. Refresh page
4. Site should load in dark mode
5. Toggle to light mode manually
6. Refresh - should stay light (manual preference saved)

---

## Migration from v3.3

No database changes - just extract and run!

```bash
cd ~/Downloads
tar -xzf nyu-sound-forum-v3.4.tar.gz
cd nyu-sound-forum-v3.1
npm install
npm run init-db
npm start
```

---

## Summary

**Forum Access:**
- Sound students: Full access
- Directors/Producers: No access
- Admins: Full access (moderation)

**Directory:**
- Collapsible position sections
- Click headers to toggle
- Cleaner navigation

**Theme:**
- Auto-detects system preference
- Respects manual changes
- No more default to light mode

---

**Version:** 3.4.0  
**Status:** Ready for demo  
**Date:** February 2026
