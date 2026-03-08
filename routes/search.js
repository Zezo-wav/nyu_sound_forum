// Search Routes
// v3.1: Unified search across requests, forum, and wiki

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Request = require('../models/Request');
const Gig = require('../models/Gig');
const ForumPost = require('../models/ForumPost');
const WikiPage = require('../models/WikiPage');

// Search page
router.get('/', ensureAuthenticated, async (req, res) => {
  const query = req.query.q || '';
  
  if (!query) {
    return res.render('search/index', {
      title: 'Search',
      page: 'search',
      query: '',
      results: { requests: [], gigs: [], posts: [], wiki: [] }
    });
  }
  
  try {
    // Search requests
    const requests = await Request.findAll({ search: query });
    
    // Search gigs
    const gigs = await Gig.findAll({ search: query });
    
    // Search forum posts
    const posts = await ForumPost.findAll({ search: query });
    
    // Search wiki pages
    const wiki = await WikiPage.search(query);
    
    res.render('search/index', {
      title: `Search: ${query}`,
      page: 'search',
      query,
      results: { requests, gigs, posts, wiki }
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error performing search');
    res.redirect('/');
  }
});

module.exports = router;
