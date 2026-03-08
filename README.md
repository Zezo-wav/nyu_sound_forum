# NYU Sound Forum v3.1 - Steam-Inspired Design

**Version:** 3.1.0  
**Release:** February 2026  
**Font:** Inter  
**Design:** Steam Community-inspired

## 🎨 What's New in v3.1

### Visual Improvements
- **Inter font** throughout for professional, modern look
- **Steam-inspired card design** - cleaner spacing, better typography
- **Fixed dark mode flash** - theme loads immediately, no white flash
- **Improved badge readability** in dark mode
- **Better contrast** and visual hierarchy

### New Features
- **Pinned posts** (admin can pin important threads)
- **Reply count badges** on forum posts
- **Last activity timestamps** (shows when threads were last active)
- **Thread sorting** (Recent Activity, Most Replies, Newest, Most Viewed)
- **Tag system for requests** (Urgent, Paid, Student Film, Thesis)
- **Sound Gigs board** (sound students can post jobs when they need help)
- **Unified search** across requests, gigs, forum, and wiki
- **Subcategory filters** for forum posts
- **View count display** on forum threads
- **Status indicators** (pinned 📌, resolved ✓, hot 🔥)

### Technical Improvements
- Better database indexing for performance
- Optimized SQL queries with reply counting
- Improved dark mode CSS variables
- Enhanced mobile responsiveness

## 🚀 Quick Start

### Installation

```bash
# 1. Extract the archive
tar -xzf nyu-sound-forum-v3.1.tar.gz
cd nyu-sound-forum-v3.1

# 2. Install dependencies
npm install

# 3. Initialize database with sample data
npm run init-db

# 4. Start the server
npm start
```

Server runs at: `http://localhost:3000`

### Test Accounts

- **Admin:** admin@nyu.edu / admin123
- **Sound Student:** sound@nyu.edu / sound123
- **Director:** director@nyu.edu / director123
- **Producer:** producer@nyu.edu / producer123

## 📋 Features

### Request Board
- Directors/producers post sound job requests
- Sound students browse and claim requests
- Filter by position, status, and tags
- Tag system: Urgent, Paid, Student Film, Thesis
- Unclaim functionality
- Admin delete powers

### Sound Gigs Board (NEW!)
- **Sound students post their own jobs** when they need help
- Need a boom op, mixer, or sound designer for your project? Post a gig!
- Other sound students can fill gigs
- Same filtering and tagging as requests
- Separate from director/producer requests
- Visible only to sound students in navigation

### Forum System
- Q&A with categories (Production Sound, Post Sound, Equipment, General)
- **NEW:** Pin important threads (admin only)
- **NEW:** Reply count display
- **NEW:** Last activity tracking
- **NEW:** Multiple sorting options
- **NEW:** Unsolved questions filter
- Threaded replies
- Mark as resolved
- Specialization badges
- View count tracking

### Wiki
- Educational guides (production/post-production)
- Markdown support
- Admin-only create/edit
- Category organization

### User System
- Roles: admin, sound_student, director, producer
- Specialization badges for sound students
- Profile avatars (initials-based, unique colors)
- User directory
- Bio and graduation year

### Admin Dashboard
- Site statistics
- User management table
- Recent activity feed
- Moderation powers (delete posts, pin threads, resolve questions)

### Dark Mode
- **FIXED:** No more white flash on page load
- Toggle button in nav (🌙/☀️)
- Persists via localStorage
- Fully themed: cards, badges, forms, buttons
- **Improved** badge readability in dark mode

### Search
- **NEW:** Unified search bar
- Search across requests, forum posts, and wiki pages
- Accessible from navigation

## 🎨 Design Philosophy

v3.1 takes inspiration from Steam Community forums:
- **Clean card layouts** with generous whitespace
- **Subtle visual hierarchy** - titles are prominent, metadata is understated
- **Minimal color** usage - grays + one accent color
- **Compact info bars** - author, date, stats in one line
- **Status indicators** that don't overwhelm
- **Professional typography** with Inter font

## 📁 Project Structure

```
nyu-sound-forum-v3.1/
├── config/           # Database and passport configuration
├── models/           # Data models (User, Request, ForumPost, etc.)
├── routes/           # Express routes
├── middleware/       # Auth and validation middleware
├── views/            # EJS templates
├── public/           
│   ├── css/          # Styles (Inter font, Steam-inspired design)
│   └── js/           # Client-side JavaScript (dark mode)
├── database/         # Schema and database file
├── scripts/          # Database initialization
└── server.js         # Main application file
```

## 🔧 Configuration

### Environment Variables (.env)
```
PORT=3000
SESSION_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
DATABASE_PATH=./database/sound-forum.db
```

### Database
- **Development:** SQLite (included)
- **Production:** PostgreSQL (recommended for deployment)

## 🛠️ Development

### Commands
```bash
npm start          # Start server (production)
npm run dev        # Start with nodemon (auto-restart)
npm run init-db    # Reset database with sample data
```

### Adding Specializations
Edit `views/auth/register.ejs` and `views/users/edit.ejs` to add new specializations to the checkbox list.

### Customizing Colors
Edit CSS variables in `public/css/style.css`:
```css
:root {
  --accent-primary: #4a90e2;  /* Change to NYU purple: #57068c */
  /* ... */
}
```

## 📊 Database Schema

### New in v3.1
- `forum_posts.is_pinned` - Pinned thread indicator
- `forum_posts.last_activity_at` - Last reply timestamp
- `requests.tags` - JSON array of tags
- Indexes on `is_pinned` and `last_activity_at` for performance

### Tables
- `users` - User accounts and profiles
- `requests` - Job requests
- `forum_posts` - Forum threads
- `forum_replies` - Forum replies (threaded)
- `wiki_pages` - Wiki documentation

## 🚀 Deployment (Future)

### NYU Integration Checklist
- [ ] Contact NYU IT Service Desk
- [ ] Request *.nyu.edu subdomain
- [ ] Set up Microsoft Azure AD SSO
- [ ] Switch to PostgreSQL database
- [ ] Configure production environment variables
- [ ] Set up HTTPS/SSL
- [ ] Faculty sponsor approval
- [ ] Beta testing with students

### Production Recommendations
- Use PostgreSQL instead of SQLite
- Change `SESSION_SECRET` in .env
- Enable HTTPS
- Set up email notifications (SendGrid/Mailgun)
- Implement rate limiting
- Add logging (Winston/Morgan)
- Set up monitoring (PM2)

## 🐛 Known Issues (Fixed in v3.1)

✅ Dark mode flash on page load - **FIXED**  
✅ Badge readability in dark mode - **FIXED**  
✅ Specialization badges hard to update - **FIXED** (now in easy-to-edit checkboxes)

## 📝 Version History

### v3.1 (Current - February 2026)
- Steam-inspired design overhaul
- Inter font implementation
- Pinned posts feature
- Reply counts and last activity tracking
- Thread sorting options
- Tag system for requests
- Unified search
- Fixed dark mode flash
- Improved badge readability

### v3.0 (January 2026)
- Admin dashboard and controls
- Dark mode toggle
- Delete/moderate powers

### v2.0 (December 2025)
- Unclaim request button
- Threaded forum replies
- Specialization badges
- Initials-based avatars

### v1.0 (November 2025)
- Initial release
- Basic CRUD functionality
- Authentication system

## 🎓 Educational Purpose

This project is built for learning web development. It demonstrates:
- MVC architecture
- RESTful routing
- Authentication with Passport.js
- Database operations with SQLite
- Server-side rendering with EJS
- Responsive CSS design
- Dark mode implementation
- Role-based access control

## 📬 Support

For questions or issues:
1. Check this README
2. Review code comments (heavily commented for learning)
3. Check `GETTING-STARTED.md` for troubleshooting

## 📄 License

MIT License - This is a student project for NYU Tisch.

## 🙏 Credits

- Built by z (NYU Tisch Film Student)
- Design inspiration: Steam Community
- Font: Inter by Rasmus Andersson
- Icon references: Unicode emojis

---

**Ready to pitch to NYU!** 🎬🔊
