// Gig Model
// Sound students posting their own jobs when they need help
// v3.1: New feature for sound students to hire each other

const db = require('../config/database');

class Gig {
  // Create new gig
  static async create(gigData) {
    const { title, description, posted_by, position_needed, project_type, date_needed, tags } = gigData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO gigs (title, description, posted_by, position_needed, project_type, date_needed, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const tagsJson = tags ? JSON.stringify(tags) : null;
      
      db.run(sql, [title, description, posted_by, position_needed, project_type, date_needed, tagsJson], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // Get all gigs with filters
  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT g.*, 
               u1.name as poster_name,
               u1.specializations as poster_specializations,
               u2.name as filler_name
        FROM gigs g
        LEFT JOIN users u1 ON g.posted_by = u1.id
        LEFT JOIN users u2 ON g.filled_by = u2.id
        WHERE g.status != 'archived'
      `;
      
      const params = [];
      
      // Filter by position
      if (filters.position) {
        sql += ' AND g.position_needed = ?';
        params.push(filters.position);
      }
      
      // Filter by status
      if (filters.status) {
        sql += ' AND g.status = ?';
        params.push(filters.status);
      }
      
      // Filter by tag
      if (filters.tag) {
        sql += ' AND g.tags LIKE ?';
        params.push(`%"${filters.tag}"%`);
      }
      
      // Search query
      if (filters.search) {
        sql += ' AND (g.title LIKE ? OR g.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      // Sorting
      switch (filters.sort) {
        case 'oldest':
          sql += ' ORDER BY g.created_at ASC';
          break;
        case 'earliest_date':
          sql += ' ORDER BY CASE WHEN g.date_needed IS NULL THEN 1 ELSE 0 END, g.date_needed ASC';
          break;
        case 'latest_date':
          sql += ' ORDER BY CASE WHEN g.date_needed IS NULL THEN 1 ELSE 0 END, g.date_needed DESC';
          break;
        default: // 'newest'
          sql += ' ORDER BY g.created_at DESC';
      }
      
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else {
          rows = rows.map(row => {
            if (row.tags) row.tags = JSON.parse(row.tags);
            if (row.poster_specializations) row.poster_specializations = JSON.parse(row.poster_specializations);
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
        SELECT g.*, 
               u1.name as poster_name, u1.role as poster_role, u1.specializations as poster_specializations,
               u2.name as filler_name
        FROM gigs g
        LEFT JOIN users u1 ON g.posted_by = u1.id
        LEFT JOIN users u2 ON g.filled_by = u2.id
        WHERE g.id = ?
      `;
      
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else {
          if (row) {
            if (row.tags) row.tags = JSON.parse(row.tags);
            if (row.poster_specializations) row.poster_specializations = JSON.parse(row.poster_specializations);
          }
          resolve(row);
        }
      });
    });
  }

  // Find gigs by user (posted by them)
  static async findByUser(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT g.*, u.name as filler_name
        FROM gigs g
        LEFT JOIN users u ON g.filled_by = u.id
        WHERE g.posted_by = ?
        ORDER BY g.created_at DESC
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else {
          rows = rows.map(row => {
            if (row.tags) row.tags = JSON.parse(row.tags);
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  // Find gigs filled by user
  static async findFilledByUser(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT g.*, u.name as poster_name
        FROM gigs g
        LEFT JOIN users u ON g.posted_by = u.id
        WHERE g.filled_by = ?
        ORDER BY g.filled_at DESC
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else {
          rows = rows.map(row => {
            if (row.tags) row.tags = JSON.parse(row.tags);
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  // Fill a gig (another sound student claims it)
  static async fill(gigId, userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE gigs 
        SET filled_by = ?, status = 'filled', filled_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'open'
      `;
      
      db.run(sql, [userId, gigId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Unfill a gig
  static async unfill(gigId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE gigs 
        SET filled_by = NULL, status = 'open', filled_at = NULL
        WHERE id = ?
      `;
      
      db.run(sql, [gigId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Delete gig
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM gigs WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Get gig count
  static async count() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM gigs', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  // Get open gigs count
  static async countOpen() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM gigs WHERE status = "open"', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  // Auto-archive old unfilled gigs (30 days)
  static async autoArchiveOld(days = 30) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE gigs 
        SET status = 'archived', archived_at = CURRENT_TIMESTAMP
        WHERE status = 'open' 
        AND filled_by IS NULL
        AND datetime(created_at) <= datetime('now', '-' || ? || ' days')
      `;
      
      db.run(sql, [days], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
}

module.exports = Gig;
