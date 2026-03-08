// Request Model
// Handles job requests posted by directors/producers
// v3.1: Added tags support

const db = require('../config/database');

class Request {
  // Create new request
  static async create(requestData) {
    const { title, description, posted_by, position_needed, project_type, shoot_date, tags } = requestData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO requests (title, description, posted_by, position_needed, project_type, shoot_date, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const tagsJson = tags ? JSON.stringify(tags) : null;
      
      db.run(sql, [title, description, posted_by, position_needed, project_type, shoot_date, tagsJson], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // Get all requests with filters
  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT r.*, 
               u1.name as poster_name,
               u2.name as claimer_name
        FROM requests r
        LEFT JOIN users u1 ON r.posted_by = u1.id
        LEFT JOIN users u2 ON r.claimed_by = u2.id
        WHERE r.status != 'archived'
      `;
      
      const params = [];
      
      // Filter by position
      if (filters.position) {
        sql += ' AND r.position_needed = ?';
        params.push(filters.position);
      }
      
      // Filter by status
      if (filters.status) {
        sql += ' AND r.status = ?';
        params.push(filters.status);
      }
      
      // Filter by tag
      if (filters.tag) {
        sql += ' AND r.tags LIKE ?';
        params.push(`%"${filters.tag}"%`);
      }
      
      // Search query
      if (filters.search) {
        sql += ' AND (r.title LIKE ? OR r.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      // Sorting
      switch (filters.sort) {
        case 'oldest':
          sql += ' ORDER BY r.created_at ASC';
          break;
        case 'earliest_date':
          sql += ' ORDER BY CASE WHEN r.shoot_date IS NULL THEN 1 ELSE 0 END, r.shoot_date ASC';
          break;
        case 'latest_date':
          sql += ' ORDER BY CASE WHEN r.shoot_date IS NULL THEN 1 ELSE 0 END, r.shoot_date DESC';
          break;
        default: // 'newest'
          sql += ' ORDER BY r.created_at DESC';
      }
      
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else {
          rows = rows.map(row => {
            if (row.tags) {
              row.tags = JSON.parse(row.tags);
            }
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  // Find by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, 
               u1.name as poster_name, u1.role as poster_role,
               u2.name as claimer_name
        FROM requests r
        LEFT JOIN users u1 ON r.posted_by = u1.id
        LEFT JOIN users u2 ON r.claimed_by = u2.id
        WHERE r.id = ?
      `;
      
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else {
          if (row && row.tags) {
            row.tags = JSON.parse(row.tags);
          }
          resolve(row);
        }
      });
    });
  }

  // Find requests by user (posted by them)
  static async findByUser(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, u.name as claimer_name
        FROM requests r
        LEFT JOIN users u ON r.claimed_by = u.id
        WHERE r.posted_by = ?
        ORDER BY r.created_at DESC
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else {
          rows = rows.map(row => {
            if (row.tags) {
              row.tags = JSON.parse(row.tags);
            }
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  // Find requests claimed by user
  static async findClaimedByUser(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT r.*, u.name as poster_name
        FROM requests r
        LEFT JOIN users u ON r.posted_by = u.id
        WHERE r.claimed_by = ?
        ORDER BY r.claimed_at DESC
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else {
          rows = rows.map(row => {
            if (row.tags) {
              row.tags = JSON.parse(row.tags);
            }
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  // Claim a request
  static async claim(requestId, userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE requests 
        SET claimed_by = ?, status = 'claimed', claimed_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'open'
      `;
      
      db.run(sql, [userId, requestId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Unclaim a request
  static async unclaim(requestId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE requests 
        SET claimed_by = NULL, status = 'open', claimed_at = NULL
        WHERE id = ?
      `;
      
      db.run(sql, [requestId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Delete request
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM requests WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Get request count
  static async count() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM requests', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  // Get open requests count
  static async countOpen() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM requests WHERE status = "open"', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  // Count open requests by specific user
  static async countOpenByUser(userId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM requests WHERE status = "open" AND posted_by = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  // Auto-archive old unclaimed requests (30 days)
  static async autoArchiveOld(days = 30) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE requests 
        SET status = 'archived', archived_at = CURRENT_TIMESTAMP
        WHERE status = 'open' 
        AND claimed_by IS NULL
        AND datetime(created_at) <= datetime('now', '-' || ? || ' days')
      `;
      
      db.run(sql, [days], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Auto-expire requests past their shoot date
  static async autoExpirePastDates() {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE requests 
        SET status = 'archived', archived_at = CURRENT_TIMESTAMP
        WHERE status = 'open' 
        AND shoot_date IS NOT NULL
        AND date(shoot_date) < date('now')
      `;
      
      db.run(sql, [], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
}

module.exports = Request;
