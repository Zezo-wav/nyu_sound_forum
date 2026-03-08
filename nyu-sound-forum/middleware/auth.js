// Authentication Middleware
// Protects routes and checks user roles

// Check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/auth/login');
}

// Check if user is admin
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'You do not have permission to access this page');
  res.redirect('/');
}

// Check if user is sound student
function ensureSoundStudent(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'sound_student') {
    return next();
  }
  req.flash('error', 'Only sound students can access this page');
  res.redirect('/');
}

// Check if user is director or producer
function ensureDirectorOrProducer(req, res, next) {
  if (req.isAuthenticated() && (req.user.role === 'director' || req.user.role === 'producer')) {
    return next();
  }
  req.flash('error', 'Only directors and producers can access this page');
  res.redirect('/');
}

// Check if user is NOT logged in (for login/register pages)
function ensureGuest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  ensureSoundStudent,
  ensureDirectorOrProducer,
  ensureGuest
};
