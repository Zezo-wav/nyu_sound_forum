// Authentication Routes
// Handles login, register, logout

const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { ensureGuest } = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validation');

// Login page
router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    page: 'login'
  });
});

// Login POST
router.post('/login', ensureGuest, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Register page
router.get('/register', ensureGuest, (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    page: 'register'
  });
});

// Register POST
router.post('/register', ensureGuest, validateRegistration, async (req, res) => {
  try {
    const { email, password, name, role, bio, year, specializations, primary_position } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash('error', 'An account with this email already exists');
      return res.redirect('/auth/register');
    }
    
    // Parse specializations if sound student
    let parsedSpecializations = null;
    if (role === 'sound_student' && specializations) {
      parsedSpecializations = Array.isArray(specializations) ? specializations : [specializations];
    }
    
    // Create user
    await User.create({
      email,
      password,
      name,
      role,
      bio: bio || null,
      year: year || null,
      specializations: parsedSpecializations,
      primary_position: (role === 'sound_student' && primary_position) ? primary_position : null
    });
    
    req.flash('success', 'Account created successfully! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error creating account');
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    req.flash('success', 'You have been logged out');
    res.redirect('/');
  });
});

module.exports = router;
