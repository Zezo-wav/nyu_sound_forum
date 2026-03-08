// Admin Routes
// Admin dashboard and controls

const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Request = require('../models/Request');
const Gig = require('../models/Gig');
const ForumPost = require('../models/ForumPost');

// Admin dashboard
router.get('/dashboard', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    // Get statistics
    const stats = {
      totalUsers: await User.count(),
      totalRequests: await Request.count(),
      openRequests: await Request.countOpen(),
      totalGigs: await Gig.count(),
      openGigs: await Gig.countOpen(),
      totalPosts: await ForumPost.count(),
      unresolvedPosts: await ForumPost.countUnresolved()
    };
    
    // Get recent activity
    const recentUsers = await User.getRecent(5);
    const recentPosts = await ForumPost.getRecent(5);
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      page: 'admin',
      stats,
      recentUsers,
      recentPosts
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
});

// View all users
router.get('/users', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    
    res.render('admin/users', {
      title: 'Manage Users',
      page: 'admin',
      users
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading users');
    res.redirect('/admin/dashboard');
  }
});

module.exports = router;
