# Sound Gigs Feature - Update Notes

## 🆕 What's New

**Sound Gigs Board** - A new board exclusively for sound students to post jobs when they need help on their own projects.

### The Problem
Sound students often have their own projects (thesis films, class assignments, portfolio work) where they need help from other sound students. Previously, they had no way to post these opportunities on the platform.

### The Solution
A dedicated **Sound Gigs** board where:
- Sound students can post jobs when they need a boom op, mixer, sound designer, etc.
- Other sound students can browse and fill these gigs
- It's separate from the main Request Board (which is for directors/producers)

---

## 💼 How It Works

### For Sound Students Posting Gigs
1. Navigate to **Sound Gigs** (visible in nav only for sound students)
2. Click **Post Gig**
3. Fill out job details:
   - Title (e.g., "Need Dialogue Editor for Short Film")
   - Description
   - Position needed
   - Project type
   - Date needed
   - Tags (Urgent, Paid, Student Film, Thesis)
4. Submit and wait for other students to fill it

### For Sound Students Filling Gigs
1. Browse **Sound Gigs** board
2. Filter by position, status, or tags
3. Click on a gig to view details
4. Click **Fill This Gig** to claim it
5. The poster will see who filled it and can contact you

### Key Differences from Requests Board

| Feature | Requests Board | Sound Gigs Board |
|---------|---------------|------------------|
| **Who posts** | Directors/Producers | Sound Students |
| **Who fills** | Sound Students | Sound Students |
| **Purpose** | Hire sound students for film projects | Sound students helping each other |
| **Navigation** | Visible to all | Visible only to sound students |
| **Example** | "Need boom op for thesis shoot" (posted by director) | "Need dialogue editor for my short" (posted by sound student) |

---

## 🎯 Use Cases

Perfect for:
- **Thesis projects**: "Need mixing engineer for final mix"
- **Class assignments**: "Looking for foley artist for Sound Design class"
- **Portfolio work**: "Sound designer wanted for experimental piece"
- **Collaborative projects**: "Boom op needed for documentary I'm working on"
- **Paid gigs**: Sound students with budget can hire other students

---

## 🔧 Technical Implementation

### New Database Table
```sql
CREATE TABLE gigs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  posted_by INTEGER NOT NULL,
  position_needed TEXT NOT NULL,
  project_type TEXT,
  date_needed DATE,
  status TEXT DEFAULT 'open',
  filled_by INTEGER,
  tags TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  filled_at DATETIME,
  FOREIGN KEY (posted_by) REFERENCES users(id),
  FOREIGN KEY (filled_by) REFERENCES users(id)
);
```

### New Model
- `models/Gig.js` - Handles all gig CRUD operations

### New Routes
- `routes/gigs.js` - All gig-related routes
- `/gigs` - Browse gigs
- `/gigs/new` - Post new gig (sound students only)
- `/gigs/:id` - View gig details
- `/gigs/:id/fill` - Fill a gig
- `/gigs/:id/unfill` - Unfill a gig
- `/gigs/my/posted` - My posted gigs
- `/gigs/my/filled` - Gigs I filled

### New Views
- `views/gigs/index.ejs` - Gigs listing page
- `views/gigs/new.ejs` - Post gig form
- `views/gigs/show.ejs` - Gig details page
- `views/gigs/my-gigs.ejs` - Personal gigs page

### Updated Files
- `views/partials/nav.ejs` - Added "Sound Gigs" link (sound students only)
- `routes/search.js` - Added gigs to search results
- `routes/admin.js` - Added gigs stats to dashboard
- `views/search/index.ejs` - Display gig search results
- `views/admin/dashboard.ejs` - Show gigs statistics
- `views/home.ejs` - Added gigs quick actions for sound students
- `scripts/init-db.js` - Added sample gigs

---

## 📊 Admin Dashboard Updates

New stats cards:
- **Sound Gigs** - Total number of gigs posted
- **Open Gigs** - Currently available gigs

---

## 🔍 Search Integration

Gigs are now included in the unified search:
- Search query: "dialogue editor"
- Results show: Requests + **Gigs** + Forum Posts + Wiki Pages

---

## 🎨 UI/UX Details

### Info Banner
A blue info box at the top of the Gigs page explains:
> "This is where sound students post jobs when they need help on their own projects. Got a gig and need a boom op, mixer, or sound designer? Post it here!"

### Navigation
- **Visible to:** Sound students only
- **Position:** Between "Requests" and "Forum"
- **Label:** "Sound Gigs"

### Status Badges
- ✓ Open (green)
- ⚡ Filled (blue)

### Cards Display
Shows:
- Poster's name + avatar
- Poster's specializations (badges)
- Date posted
- Project type
- Position needed
- Tags
- Status

---

## 🚀 How to Test

1. Login as sound student: `sound@nyu.edu / sound123`
2. Click **Sound Gigs** in navigation
3. View sample gigs
4. Click **Post Gig**
5. Fill out form and submit
6. Browse gigs, click **Fill This Gig**
7. View **My Posted Gigs** and **Gigs I Filled**

### Edge Cases Tested
- ✅ Sound student cannot fill their own gig
- ✅ Directors/producers don't see Sound Gigs in nav
- ✅ Gigs can be unfilled by poster or filler
- ✅ Admin can delete any gig
- ✅ Only sound students can post gigs
- ✅ Gigs appear in search results
- ✅ Gigs stats appear in admin dashboard

---

## 🎓 Why This Matters

Sound students often have multiple roles:
- They work on director/producer projects (Request Board)
- They have their own projects where they need help (Sound Gigs)
- They collaborate with each other peer-to-peer

The Sound Gigs board creates a **peer-to-peer marketplace** within the sound student community, separate from the hierarchical director → sound student relationship in the Request Board.

This mirrors real-world sound communities where professionals:
- Take jobs from filmmakers (Request Board)
- Hire other sound pros for their own projects (Sound Gigs)
- Collaborate with peers (Sound Gigs)

---

## 📈 Future Enhancements

Consider adding:
- [ ] Gigs completion status ("completed")
- [ ] Ratings/reviews after gig completion
- [ ] Gig categories (mixing, recording, post-production)
- [ ] Estimated hours/duration field
- [ ] Budget/payment field (optional)
- [ ] Direct messaging between poster and filler
- [ ] Notifications when gig is filled

---

**Version:** 3.1.1  
**Feature:** Sound Gigs Board  
**Status:** Complete and tested  
**User Feedback:** Ready for NYU pitch
