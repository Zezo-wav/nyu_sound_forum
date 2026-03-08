// User Model
// Handles all user-related database operations

const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Create new user
  static async create(userData) {
    const { email, password, name, role, bio, year, specializations, primary_position } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (email, password, name, role, bio, year, specializations, primary_position)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const specializationsJson = specializations ? JSON.stringify(specializations) : null;
      
      db.run(sql, [email, hashedPassword, name, role, bio, year, specializationsJson, primary_position], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // Find user by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else {
          if (row && row.specializations) {
            row.specializations = JSON.parse(row.specializations);
          }
          resolve(row);
        }
      });
    });
  }

  // Find user by email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else {
          if (row && row.specializations) {
            row.specializations = JSON.parse(row.specializations);
          }
          resolve(row);
        }
      });
    });
  }

  // Get all users
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else {
          rows = rows.map(row => {
            if (row.specializations) {
              row.specializations = JSON.parse(row.specializations);
            }
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  // Update user profile
  static async update(id, userData) {
    const { name, bio, year, specializations, primary_position } = userData;
    const specializationsJson = specializations ? JSON.stringify(specializations) : null;
    
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE users 
        SET name = ?, bio = ?, year = ?, specializations = ?, primary_position = ?
        WHERE id = ?
      `;
      
      db.run(sql, [name, bio, year, specializationsJson, primary_position, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Get user count
  static async count() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
  }

  // Get recent users (for admin dashboard)
  static async getRecent(limit = 5) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users ORDER BY created_at DESC LIMIT ?', [limit], (err, rows) => {
        if (err) reject(err);
        else {
          rows = rows.map(row => {
            if (row.specializations) {
              row.specializations = JSON.parse(row.specializations);
            }
            return row;
          });
          resolve(rows);
        }
      });
    });
  }
}

module.exports = User;
