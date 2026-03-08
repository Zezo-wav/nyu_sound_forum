// Forum Routes
// Q&A discussion forum
// v3.1: Added pinning, sorting, subcategory filtering

const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin, ensureSoundStudent } = require('../middleware/auth');
const { validateForumPost } = require('../middleware/validation');
const ForumPost = require('../models/ForumPost');
const ForumReply = require('../models/ForumReply');

// List all forum posts (with filters and sorting)
router.get('/', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const filters = {
      category: req.query.category || 'all',
      sort: req.query.sort || 'recent_activity',
      resolved: req.query.resolved === 'true' ? true : (req.query.resolved === 'false' ? false : undefined)
    };
    
    const posts = await ForumPost.findAll(filters);
    
    res.render('forum/index', {
      title: 'Forum',
      page: 'forum',
      posts,
      filters
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading forum posts');
    res.redirect('/');
  }
});

// Resolved posts archive
router.get('/resolved', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const posts = await ForumPost.findAll({ resolved: true, sort: 'newest' });
    
    res.render('forum/resolved', {
      title: 'Resolved Questions',
      page: 'forum',
      posts
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading resolved posts');
    res.redirect('/forum');
  }
});

// New post form
router.get('/new', ensureAuthenticated, ensureSoundStudent, (req, res) => {
  res.render('forum/new', {
    title: 'Ask a Question',
    page: 'forum'
  });
});

// Create post
router.post('/', ensureAuthenticated, ensureSoundStudent, validateForumPost, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    const postId = await ForumPost.create({
      title,
      content,
      posted_by: req.user.id,
      category
    });
    
    req.flash('success', 'Post created successfully!');
    res.redirect(`/forum/${postId}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error creating post');
    res.redirect('/forum/new');
  }
});

// View single post with replies
router.get('/:id', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id, true); // Increment view count
    
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/forum');
    }
    
    const replies = await ForumReply.findByPostId(req.params.id);
    
    // Organize replies into threads
    const topLevelReplies = replies.filter(r => !r.parent_reply_id);
    const nestedReplies = replies.filter(r => r.parent_reply_id);
    
    // Attach nested replies to their parents
    topLevelReplies.forEach(reply => {
      reply.children = nestedReplies.filter(r => r.parent_reply_id === reply.id);
    });
    
    res.render('forum/show', {
      title: post.title,
      page: 'forum',
      post,
      replies: topLevelReplies
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading post');
    res.redirect('/forum');
  }
});

// Create reply
router.post('/:id/reply', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const { content, parent_reply_id } = req.body;
    
    if (!content) {
      req.flash('error', 'Reply content is required');
      return res.redirect(`/forum/${req.params.id}`);
    }
    
    await ForumReply.create({
      post_id: req.params.id,
      parent_reply_id: parent_reply_id || null,
      content,
      posted_by: req.user.id
    });
    
    // Update post's last activity
    await ForumPost.updateActivity(req.params.id);
    
    req.flash('success', 'Reply posted successfully!');
    res.redirect(`/forum/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error posting reply');
    res.redirect(`/forum/${req.params.id}`);
  }
});

// Toggle resolved (original poster or admin)
router.post('/:id/resolve', ensureAuthenticated, ensureSoundStudent, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id, false);
    
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/forum');
    }
    
    // Only original poster or admin can resolve
    if (post.posted_by !== req.user.id && req.user.role !== 'admin') {
      req.flash('error', 'You do not have permission to resolve this post');
      return res.redirect(`/forum/${req.params.id}`);
    }
    
    const newStatus = !post.is_resolved;
    await ForumPost.toggleResolved(req.params.id, newStatus);
    
    req.flash('success', newStatus ? 'Post marked as resolved' : 'Post marked as unresolved');
    res.redirect(`/forum/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating post');
    res.redirect(`/forum/${req.params.id}`);
  }
});

// Toggle pinned (admin only)
router.post('/:id/pin', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id, false);
    
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/forum');
    }
    
    const newStatus = !post.is_pinned;
    await ForumPost.togglePinned(req.params.id, newStatus);
    
    req.flash('success', newStatus ? 'Post pinned' : 'Post unpinned');
    res.redirect(`/forum/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error pinning post');
    res.redirect(`/forum/${req.params.id}`);
  }
});

// Delete post (admin only)
router.delete('/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await ForumPost.delete(req.params.id);
    req.flash('success', 'Post deleted successfully');
    res.redirect('/forum');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting post');
    res.redirect('/forum');
  }
});

module.exports = router;
