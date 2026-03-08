# Getting Started - NYU Sound Forum v3.1

## Quick Setup (Windows)

1. **Extract the folder**
   ```
   Right-click nyu-sound-forum-v3.1.tar.gz → Extract All
   ```

2. **Open terminal in the folder**
   ```
   cd Documents\nyu-sound-forum-v3.1
   ```

3. **Install dependencies**
   ```
   npm install
   ```

4. **Create database**
   ```
   npm run init-db
   ```

5. **Start server**
   ```
   npm start
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

## Test Accounts

- **Admin:** admin@nyu.edu / admin123
- **Sound Student:** sound@nyu.edu / sound123  
- **Director:** director@nyu.edu / director123
- **Producer:** producer@nyu.edu / producer123

## Common Issues

**"Cannot find module"**
→ Run `npm install`

**"Port already in use"**
→ Close other terminals, restart

**Changes not showing**
→ Hard refresh browser (Ctrl+F5)

**Database errors**
→ Delete `database/sound-forum.db` and run `npm run init-db`

## What's New in v3.1

✅ Inter font (looks professional)  
✅ Steam-inspired design (cleaner, better spacing)  
✅ Dark mode no longer flashes white on load  
✅ Badges readable in dark mode  
✅ Pin important forum threads (admin)  
✅ Reply counts on forum posts  
✅ Tag system for requests (Urgent, Paid, etc.)  
✅ Unified search bar  
✅ Thread sorting options  

## Key Features to Test

1. **Dark mode** - Click 🌙 in nav, reload page (no flash!)
2. **Pin a post** - Login as admin, pin a forum thread
3. **Tag a request** - Create request, select tags
4. **Search** - Click 🔍, search across all content
5. **Sort forum** - Use dropdowns to sort by activity, replies, etc.

## Next Steps

1. Test all features
2. Customize colors (edit `public/css/style.css`)
3. Add specializations (edit `views/auth/register.ejs`)
4. Write wiki content (login as admin)
5. Plan NYU pitch

## File Structure

```
nyu-sound-forum-v3.1/
├── server.js          ← Main app
├── package.json       ← Dependencies
├── .env              ← Configuration
├── config/           ← Database & auth
├── models/           ← Data logic
├── routes/           ← URL handling
├── views/            ← Templates
├── public/
│   ├── css/          ← Styles (Inter font)
│   └── js/           ← Dark mode script
└── database/         ← SQLite database
```

## Development Workflow

1. Make changes to code
2. Restart server (Ctrl+C, then `npm start`)
3. Refresh browser (Ctrl+F5)

**Pro tip:** Use `npm run dev` for auto-restart with nodemon

## Need Help?

Check:
1. This file
2. README.md (full documentation)
3. Code comments (heavily commented)

---

**You're ready to go! 🚀**
