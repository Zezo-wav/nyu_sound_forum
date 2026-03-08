// Wiki Routes
// Educational guides and documentation (admin-editable)

const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const { validateWikiPage } = require('../middleware/validation');
const WikiPage = require('../models/WikiPage');
const { marked } = require('marked');

// List all wiki pages
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const category = req.query.category || null;
    const pages = await WikiPage.findAll(category);
    
    res.render('wiki/index', {
      title: 'Wiki',
      page: 'wiki',
      pages,
      currentCategory: category
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading wiki pages');
    res.redirect('/');
  }
});

// New wiki page (admin only)
router.get('/new', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('wiki/edit', {
    title: 'Create Wiki Page',
    page: 'wiki',
    wikiPage: null
  });
});

// View wiki page
router.get('/:slug', ensureAuthenticated, async (req, res) => {
  try {
    const wikiPage = await WikiPage.findBySlug(req.params.slug);
    
    if (!wikiPage) {
      req.flash('error', 'Wiki page not found');
      return res.redirect('/wiki');
    }
    
    // Convert markdown to HTML
    wikiPage.html = marked(wikiPage.content);
    
    res.render('wiki/show', {
      title: wikiPage.title,
      page: 'wiki',
      wikiPage
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading wiki page');
    res.redirect('/wiki');
  }
});

// Edit wiki page (admin only)
router.get('/:slug/edit', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const wikiPage = await WikiPage.findBySlug(req.params.slug);
    
    if (!wikiPage) {
      req.flash('error', 'Wiki page not found');
      return res.redirect('/wiki');
    }
    
    res.render('wiki/edit', {
      title: `Edit: ${wikiPage.title}`,
      page: 'wiki',
      wikiPage
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading wiki page');
    res.redirect('/wiki');
  }
});

// Create wiki page
router.post('/', ensureAuthenticated, ensureAdmin, validateWikiPage, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    // Create slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if slug already exists
    const existing = await WikiPage.findBySlug(slug);
    if (existing) {
      req.flash('error', 'A page with this title already exists');
      return res.redirect('/wiki/new');
    }
    
    await WikiPage.create({
      title,
      slug,
      content,
      category,
      created_by: req.user.id
    });
    
    req.flash('success', 'Wiki page created successfully!');
    res.redirect(`/wiki/${slug}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error creating wiki page');
    res.redirect('/wiki/new');
  }
});

// Update wiki page
router.put('/:id', ensureAuthenticated, ensureAdmin, validateWikiPage, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    const page = await WikiPage.findById(req.params.id);
    if (!page) {
      req.flash('error', 'Wiki page not found');
      return res.redirect('/wiki');
    }
    
    await WikiPage.update(req.params.id, { title, content, category }, req.user.id);
    
    req.flash('success', 'Wiki page updated successfully!');
    res.redirect(`/wiki/${page.slug}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating wiki page');
    res.redirect('back');
  }
});

// Delete wiki page
router.delete('/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await WikiPage.delete(req.params.id);
    req.flash('success', 'Wiki page deleted successfully');
    res.redirect('/wiki');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting wiki page');
    res.redirect('/wiki');
  }
});

module.exports = router;
