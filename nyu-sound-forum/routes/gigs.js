// Gigs Routes
// Sound students posting jobs when they need help
// v3.1: New feature - sound students can hire each other

const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureSoundStudent, ensureAdmin } = require('../middleware/auth');
const Gig = require('../models/Gig');

// Validation middleware for gigs
function validateGig(req, res, next) {
  const { title, description, position_needed } = req.body;
  
  if (!title || !description || !position_needed) {
    req.flash('error', 'Title, description, and position are required');
    return res.redirect('/gigs/new');
  }
  
  if (title.length > 200) {
    req.flash('error', 'Title must be less than 200 characters');
    return res.redirect('/gigs/new');
  }
  
  next();
}

// List all gigs (with filters)
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const filters = {
      position: req.query.position || null,
      status: req.query.status || null,
      tag: req.query.tag || null,
      sort: req.query.sort || 'newest'
    };
    
    const gigs = await Gig.findAll(filters);
    
    res.render('gigs/index', {
      title: 'Sound Gigs',
      page: 'gigs',
      gigs,
      filters
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading gigs');
    res.redirect('/');
  }
});

// New gig form (sound students only)
router.get('/new', ensureAuthenticated, ensureSoundStudent, (req, res) => {
  res.render('gigs/new', {
    title: 'Post New Gig',
    page: 'gigs'
  });
});

// Create gig (sound students only)
router.post('/', ensureAuthenticated, ensureSoundStudent, validateGig, async (req, res) => {
  try {
    const { title, description, position_needed, project_type, date_needed, tags } = req.body;
    
    // Parse tags
    let parsedTags = null;
    if (tags && Array.isArray(tags)) {
      parsedTags = tags;
    } else if (tags) {
      parsedTags = [tags];
    }
    
    await Gig.create({
      title,
      description,
      posted_by: req.user.id,
      position_needed,
      project_type: project_type || null,
      date_needed: date_needed || null,
      tags: parsedTags
    });
    
    req.flash('success', 'Gig posted successfully!');
    res.redirect('/gigs');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error creating gig');
    res.redirect('/gigs/new');
  }
});

// View single gig
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      req.flash('error', 'Gig not found');
      return res.redirect('/gigs');
    }
    
    res.render('gigs/show', {
      title: gig.title,
      page: 'gigs',
      gig
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading gig');
    res.redirect('/gigs');
  }
});

// My gigs (posted by user)
router.get('/my/posted', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const gigs = await Gig.findByUser(req.user.id);
    
    res.render('gigs/my-gigs', {
      title: 'My Posted Gigs',
      page: 'gigs',
      gigs,
      type: 'posted'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading your gigs');
    res.redirect('/gigs');
  }
});

// My filled gigs (filled by sound student)
router.get('/my/filled', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const gigs = await Gig.findFilledByUser(req.user.id);
    
    res.render('gigs/my-gigs', {
      title: 'My Filled Gigs',
      page: 'gigs',
      gigs,
      type: 'filled'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading your filled gigs');
    res.redirect('/gigs');
  }
});

// Fill gig (sound students only)
router.post('/:id/fill', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      req.flash('error', 'Gig not found');
      return res.redirect('/gigs');
    }
    
    // Can't fill your own gig
    if (gig.posted_by === req.user.id) {
      req.flash('error', 'You cannot fill your own gig');
      return res.redirect(`/gigs/${req.params.id}`);
    }
    
    if (gig.status !== 'open') {
      req.flash('error', 'This gig is no longer available');
      return res.redirect(`/gigs/${req.params.id}`);
    }
    
    await Gig.fill(req.params.id, req.user.id);
    req.flash('success', 'Gig filled successfully!');
    res.redirect(`/gigs/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error filling gig');
    res.redirect(`/gigs/${req.params.id}`);
  }
});

// Unfill gig
router.post('/:id/unfill', ensureAuthenticated, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      req.flash('error', 'Gig not found');
      return res.redirect('/gigs');
    }
    
    // Only the filler, poster, or admin can unfill
    if (gig.filled_by !== req.user.id && gig.posted_by !== req.user.id && req.user.role !== 'admin') {
      req.flash('error', 'You cannot unfill this gig');
      return res.redirect(`/gigs/${req.params.id}`);
    }
    
    await Gig.unfill(req.params.id);
    req.flash('success', 'Gig unfilled successfully');
    res.redirect(`/gigs/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error unfilling gig');
    res.redirect(`/gigs/${req.params.id}`);
  }
});

// Delete gig (poster or admin)
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      req.flash('error', 'Gig not found');
      return res.redirect('/gigs');
    }
    
    // Only poster or admin can delete
    if (gig.posted_by !== req.user.id && req.user.role !== 'admin') {
      req.flash('error', 'You do not have permission to delete this gig');
      return res.redirect(`/gigs/${req.params.id}`);
    }
    
    await Gig.delete(req.params.id);
    req.flash('success', 'Gig deleted successfully');
    res.redirect('/gigs');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting gig');
    res.redirect(`/gigs/${req.params.id}`);
  }
});

module.exports = router;
