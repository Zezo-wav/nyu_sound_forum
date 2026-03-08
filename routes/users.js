// User Routes
// User profiles and directory

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const User = require('../models/User');

// User directory
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const allUsers = await User.findAll();
    
    // Only show sound students in directory
    const users = allUsers.filter(u => u.role === 'sound_student');
    
    // Group by primary position
    const grouped = {};
    users.forEach(u => {
      const position = u.primary_position || 'Other';
      if (!grouped[position]) grouped[position] = [];
      grouped[position].push(u);
    });
    
    res.render('users/directory', {
      title: 'Sound Student Directory',
      page: 'users',
      users,
      grouped
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading user directory');
    res.redirect('/');
  }
});

// View user profile
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/users');
    }
    
    res.render('users/profile', {
      title: user.name,
      page: 'users',
      profileUser: user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading user profile');
    res.redirect('/users');
  }
});

// Edit profile page (own profile only)
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    if (parseInt(req.params.id) !== req.user.id) {
      req.flash('error', 'You can only edit your own profile');
      return res.redirect(`/users/${req.params.id}`);
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/users');
    }
    
    res.render('users/edit', {
      title: 'Edit Profile',
      page: 'users',
      profileUser: user
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading profile');
    res.redirect('/users');
  }
});

// Update profile
router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    if (parseInt(req.params.id) !== req.user.id) {
      req.flash('error', 'You can only edit your own profile');
      return res.redirect(`/users/${req.params.id}`);
    }
    
    const { name, bio, year, specializations, primary_position } = req.body;
    
    // Parse specializations if provided
    let parsedSpecializations = null;
    if (req.user.role === 'sound_student' && specializations) {
      parsedSpecializations = Array.isArray(specializations) ? specializations : [specializations];
    }
    
    await User.update(req.params.id, {
      name,
      bio: bio || null,
      year: year || null,
      specializations: parsedSpecializations,
      primary_position: (req.user.role === 'sound_student' && primary_position) ? primary_position : null
    });
    
    req.flash('success', 'Profile updated successfully!');
    res.redirect(`/users/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating profile');
    res.redirect(`/users/${req.params.id}/edit`);
  }
});

module.exports = router;
