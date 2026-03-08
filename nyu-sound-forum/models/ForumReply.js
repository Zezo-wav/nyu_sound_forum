// Forum Reply Model
// Handles replies to forum posts (with threading support)

const db = require('../config/database');

class ForumReply {
  // Create new reply
  static async create(replyData) {
    const { post_id, parent_reply_id, content, posted_by } = replyData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO forum_replies (post_id, parent_reply_id, content, posted_by)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(sql, [post_id, parent_reply_id || null, content, posted_by], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // Get all replies for a post (organized by threading)
  static async findByPostId(postId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, 
               u.name as author_name,
               u.specializations as author_specializations
        FROM forum_replies r
        LEFT JOIN users u ON r.posted_by = u.id
        WHERE r.post_id = ?
        ORDER BY r.created_at ASC
      `;
      
      db.all(sql, [postId], (err, rows) => {
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

  // Get reply by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, 
               u.name as author_name,
               u.specializations as author_specializations
        FROM forum_replies r
        LEFT JOIN users u ON r.posted_by = u.id
        WHERE r.id = ?
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

  // Delete reply
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM forum_replies WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Get reply count for a post
  static async countByPost(postId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM forum_replies WHERE post_id = ?', [postId], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }
}

module.exports = ForumReply;
