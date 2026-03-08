// Request Routes
// Job requests from directors/producers
// v3.1: Added tag filtering and better sorting

const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureDirectorOrProducer, ensureSoundStudent, ensureAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const Request = require('../models/Request');

// List all requests (with filters)
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const filters = {
      position: req.query.position || null,
      status: req.query.status || null,
      tag: req.query.tag || null,
      sort: req.query.sort || 'newest'
    };
    
    const requests = await Request.findAll(filters);
    
    res.render('requests/index', {
      title: 'Browse Requests',
      page: 'requests',
      requests,
      filters
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading requests');
    res.redirect('/');
  }
});

// New request form
router.get('/new', ensureAuthenticated, ensureDirectorOrProducer, (req, res) => {
  res.render('requests/new', {
    title: 'Post New Request',
    page: 'requests'
  });
});

// Create request
router.post('/', ensureAuthenticated, ensureDirectorOrProducer, validateRequest, async (req, res) => {
  try {
    // Check if user has reached the limit of 3 open requests
    const openCount = await Request.countOpenByUser(req.user.id);
    
    if (openCount >= 3) {
      req.flash('error', 'You have reached the maximum of 3 open requests. Please wait for one to be claimed or archived before posting a new one.');
      return res.redirect('/requests');
    }
    
    const { title, description, position_needed, project_type, shoot_date, tags } = req.body;
    
    // Parse tags
    let parsedTags = null;
    if (tags && Array.isArray(tags)) {
      parsedTags = tags;
    } else if (tags) {
      parsedTags = [tags];
    }
    
    await Request.create({
      title,
      description,
      posted_by: req.user.id,
      position_needed,
      project_type: project_type || null,
      shoot_date: shoot_date || null,
      tags: parsedTags
    });
    
    req.flash('success', 'Request posted successfully!');
    res.redirect('/requests');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error creating request');
    res.redirect('/requests/new');
  }
});

// View single request
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      req.flash('error', 'Request not found');
      return res.redirect('/requests');
    }
    
    res.render('requests/show', {
      title: request.title,
      page: 'requests',
      request
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading request');
    res.redirect('/requests');
  }
});

// My requests (posted by user)
router.get('/my/posted', ensureAuthenticated, ensureDirectorOrProducer, async (req, res) => {
  try {
    const requests = await Request.findByUser(req.user.id);
    
    res.render('requests/my-requests', {
      title: 'My Posted Requests',
      page: 'requests',
      requests,
      type: 'posted'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading your requests');
    res.redirect('/requests');
  }
});

// My claimed requests (claimed by sound student)
router.get('/my/claimed', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const requests = await Request.findClaimedByUser(req.user.id);
    
    res.render('requests/my-requests', {
      title: 'My Claimed Requests',
      page: 'requests',
      requests,
      type: 'claimed'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading your claimed requests');
    res.redirect('/requests');
  }
});

// Claim request
router.post('/:id/claim', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      req.flash('error', 'Request not found');
      return res.redirect('/requests');
    }
    
    if (request.status !== 'open') {
      req.flash('error', 'This request is no longer available');
      return res.redirect(`/requests/${req.params.id}`);
    }
    
    await Request.claim(req.params.id, req.user.id);
    req.flash('success', 'Request claimed successfully!');
    res.redirect(`/requests/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error claiming request');
    res.redirect(`/requests/${req.params.id}`);
  }
});

// Unclaim request
router.post('/:id/unclaim', ensureAuthenticated, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      req.flash('error', 'Request not found');
      return res.redirect('/requests');
    }
    
    // Only the claimer or admin can unclaim
    if (request.claimed_by !== req.user.id && req.user.role !== 'admin') {
      req.flash('error', 'You cannot unclaim this request');
      return res.redirect(`/requests/${req.params.id}`);
    }
    
    await Request.unclaim(req.params.id);
    req.flash('success', 'Request unclaimed successfully');
    res.redirect(`/requests/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error unclaiming request');
    res.redirect(`/requests/${req.params.id}`);
  }
});

// Delete request (admin or poster)
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      req.flash('error', 'Request not found');
      return res.redirect('/requests');
    }
    
    // Only poster or admin can delete
    if (request.posted_by !== req.user.id && req.user.role !== 'admin') {
      req.flash('error', 'You do not have permission to delete this request');
      return res.redirect(`/requests/${req.params.id}`);
    }
    
    await Request.delete(req.params.id);
    req.flash('success', 'Request deleted successfully');
    res.redirect('/requests');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting request');
    res.redirect(`/requests/${req.params.id}`);
  }
});

module.exports = router;
