// NYU Sound Forum - Main Server File
// v3.1 - Steam-Inspired Design + Search + Tags

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const gigsRoutes = require('./routes/gigs');
const forumRoutes = require('./routes/forum');
const wikiRoutes = require('./routes/wiki');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');

// Passport configuration
require('./config/passport');

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Global variables for views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/requests', requestRoutes);
app.use('/gigs', gigsRoutes);
app.use('/forum', forumRoutes);
app.use('/wiki', wikiRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/search', searchRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('home', { 
    title: 'NYU Sound Forum',
    page: 'home'
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Not Found',
    message: 'Page not found',
    page: 'error'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: '500 - Server Error',
    message: 'Something went wrong',
    page: 'error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NYU Sound Forum running on http://localhost:${PORT}`);
  console.log(`Version 3.2 - Steam-Inspired Design`);
});
