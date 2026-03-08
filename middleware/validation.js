// Input Validation Middleware
// Validates and sanitizes user input

function validateRegistration(req, res, next) {
  const { email, password, name, role } = req.body;
  
  // Check required fields
  if (!email || !password || !name || !role) {
    req.flash('error', 'All fields are required');
    return res.redirect('/auth/register');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash('error', 'Please enter a valid email address');
    return res.redirect('/auth/register');
  }
  
  // Validate password length
  if (password.length < 6) {
    req.flash('error', 'Password must be at least 6 characters long');
    return res.redirect('/auth/register');
  }
  
  // Validate role
  const validRoles = ['sound_student', 'director', 'producer'];
  if (!validRoles.includes(role)) {
    req.flash('error', 'Invalid role selected');
    return res.redirect('/auth/register');
  }
  
  next();
}

function validateRequest(req, res, next) {
  const { title, description, position_needed } = req.body;
  
  if (!title || !description || !position_needed) {
    req.flash('error', 'Title, description, and position are required');
    return res.redirect('/requests/new');
  }
  
  if (title.length > 200) {
    req.flash('error', 'Title must be less than 200 characters');
    return res.redirect('/requests/new');
  }
  
  next();
}

function validateForumPost(req, res, next) {
  const { title, content, category } = req.body;
  
  if (!title || !content || !category) {
    req.flash('error', 'Title, content, and category are required');
    return res.redirect('/forum/new');
  }
  
  if (title.length > 200) {
    req.flash('error', 'Title must be less than 200 characters');
    return res.redirect('/forum/new');
  }
  
  next();
}

function validateWikiPage(req, res, next) {
  const { title, content, category } = req.body;
  
  if (!title || !content || !category) {
    req.flash('error', 'Title, content, and category are required');
    return res.redirect('back');
  }
  
  next();
}

module.exports = {
  validateRegistration,
  validateRequest,
  validateForumPost,
  validateWikiPage
};
