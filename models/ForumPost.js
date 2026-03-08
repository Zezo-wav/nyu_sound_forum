// Forum Post Model
// Handles forum questions and discussions
// v3.1: Added is_pinned, last_activity_at, reply_count tracking

const db = require('../config/database');

class ForumPost {
  // Create new post
  static async create(postData) {
    const { title, content, posted_by, category } = postData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO forum_posts (title, content, posted_by, category, last_activity_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      db.run(sql, [title, content, posted_by, category], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // Get all posts with filters and sorting
  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT p.*, 
               u.name as author_name, 
               u.specializations as author_specializations,
               COUNT(DISTINCT r.id) as reply_count
        FROM forum_posts p
        LEFT JOIN users u ON p.posted_by = u.id
        LEFT JOIN forum_replies r ON p.id = r.post_id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Filter by category
      if (filters.category && filters.category !== 'all') {
        sql += ' AND p.category = ?';
        params.push(filters.category);
      }
      
      // Filter by resolved status
      if (filters.resolved !== undefined) {
        sql += ' AND p.is_resolved = ?';
        params.push(filters.resolved ? 1 : 0);
      }
      
      // Search query
      if (filters.search) {
        sql += ' AND (p.title LIKE ? OR p.content LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      sql += ' GROUP BY p.id';
      
      // Sorting
      if (filters.pinned_first !== false) {
        sql += ' ORDER BY p.is_pinned DESC,';
      } else {
        sql += ' ORDER BY';
      }
      
      switch (filters.sort) {
        case 'most_replies':
          sql += ' reply_count DESC, p.created_at DESC';
          break;
        case 'newest':
          sql += ' p.created_at DESC';
          break;
        case 'oldest':
          sql += ' p.created_at ASC';
          break;
        case 'most_viewed':
          sql += ' p.view_count DESC';
          break;
        default: // 'recent_activity'
          sql += ' p.last_activity_at DESC';
      }
      
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else {
          rows = rows.map(row => {
            if (row.author_specializations) {
              row.author_specializations = JSON.parse(row.author_specializations);
            }
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  // Find by ID (with view count increment)
  static async findById(id, incrementView = true) {
    return new Promise((resolve, reject) => {
      // Increment view count if requested
      if (incrementView) {
        db.run('UPDATE forum_posts SET view_count = view_count + 1 WHERE id = ?', [id]);
      }
      
      const sql = `
        SELECT p.*, 
               u.name as author_name,
               u.specializations as author_specializations
        FROM forum_posts p
        LEFT JOIN users u ON p.posted_by = u.id
        WHERE p.id = ?
      `;
      
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else {
          if (row && row.author_specializations) {
            row.author_specializations = JSON.parse(row.author_specializations);
          }
          resolve(row);
        }
      });
    });
  }

  // Mark as resolved/unresolved
  static async toggleResolved(id, isResolved) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE forum_posts SET is_resolved = ? WHERE id = ?', [isResolved ? 1 : 0, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Pin/unpin post (admin only)
  static async togglePinned(id, isPinned) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE forum_posts SET is_pinned = ? WHERE id = ?', [isPinned ? 1 : 0, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Update last activity timestamp
  static async updateActivity(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE forum_posts SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Delete post
  static async delete(id) {
    return new Promise((resolve, reject) => {
      // Delete replies first (cascading delete)
      db.run('DELETE FROM forum_replies WHERE post_id = ?', [id], (err) => {
        if (err) {
          reject(err);
        } else {
          // Then delete post
          db.run('DELETE FROM forum_posts WHERE id = ?', [id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          });
        }
      });
    });
  }

  // Get post count
  static async count() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM forum_posts', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  // Get unresolved posts count
  static async countUnresolved() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM forum_posts WHERE is_resolved = 0', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  // Get recent posts (for admin dashboard)
  static async getRecent(limit = 5) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, u.name as author_name
        FROM forum_posts p
        LEFT JOIN users u ON p.posted_by = u.id
        ORDER BY p.created_at DESC
        LIMIT ?
      `;
      
      db.all(sql, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = ForumPost;
