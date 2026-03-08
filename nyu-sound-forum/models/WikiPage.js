// Wiki Page Model
// Educational guides and documentation

const db = require('../config/database');

class WikiPage {
  // Create new wiki page
  static async create(pageData) {
    const { title, slug, content, category, created_by } = pageData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO wiki_pages (title, slug, content, category, created_by, last_edited_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [title, slug, content, category, created_by, created_by], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // Get all wiki pages
  static async findAll(category = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT w.*, u.name as author_name
        FROM wiki_pages w
        LEFT JOIN users u ON w.created_by = u.id
      `;
      
      const params = [];
      
      if (category) {
        sql += ' WHERE w.category = ?';
        params.push(category);
      }
      
      sql += ' ORDER BY w.title ASC';
      
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Find by slug
  static async findBySlug(slug) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT w.*, 
               u1.name as author_name,
               u2.name as editor_name
        FROM wiki_pages w
        LEFT JOIN users u1 ON w.created_by = u1.id
        LEFT JOIN users u2 ON w.last_edited_by = u2.id
        WHERE w.slug = ?
      `;
      
      db.get(sql, [slug], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Find by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM wiki_pages WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Update wiki page
  static async update(id, pageData, editorId) {
    const { title, content, category } = pageData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE wiki_pages 
        SET title = ?, content = ?, category = ?, last_edited_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(sql, [title, content, category, editorId, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Delete wiki page
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM wiki_pages WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Search wiki pages
  static async search(query) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM wiki_pages 
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY title ASC
      `;
      
      db.all(sql, [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = WikiPage;
