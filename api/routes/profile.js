const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../utils/db'); 
const { auth } = require('../middleware/auth');

const router = express.Router();

const profileLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  message: { success: false, message: 'Too many requests. Slow down.' },
});

// GET /api/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const table = req.user.role === 'Staff' ? 'Staff' : 'Customer';
    const idCol = req.user.role === 'Staff' ? 'staff_id' : 'customer_id';
    
    // 👇 'role' is removed from the SELECT statement
    const [users] = await db.query(
      `SELECT full_name as name, email_address as email, contact_number as phone, address, profile_photo as photo 
       FROM ${table} WHERE ${idCol} = ?`, 
      [req.user.id]
    );
    
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    
    const user = users[0];
    
    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      photo: user.photo || '',
      role: req.user.role // 👈 Pulled securely from the JWT token
    });
  } catch (err) {
    console.error("GET Profile Error:", err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/profile
router.put('/profile', auth, profileLimiter, async (req, res) => {
  const { name, email, phone, address, photo } = req.body;
  
  try {
    const table = req.user.role === 'Staff' ? 'Staff' : 'Customer';
    const idCol = req.user.role === 'Staff' ? 'staff_id' : 'customer_id';

    if (email) {
      const [existing] = await db.query(`SELECT ${idCol} FROM ${table} WHERE email_address = ?`, [email]);
      if (existing.length > 0 && existing[0][idCol] !== req.user.id) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
    }

    const updates = [];
    const values = [];
    
    if (name) { updates.push('full_name = ?'); values.push(name); }
    if (email) { updates.push('email_address = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('contact_number = ?'); values.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (photo !== undefined) { updates.push('profile_photo = ?'); values.push(photo); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    values.push(req.user.id);

    const sql = `UPDATE ${table} SET ${updates.join(', ')} WHERE ${idCol} = ?`;
    await db.query(sql, values);
    
    // 👇 'role' is removed from this SELECT statement as well
    const [updatedUser] = await db.query(
      `SELECT full_name as name, email_address as email, contact_number as phone, address, profile_photo as photo 
       FROM ${table} WHERE ${idCol} = ?`, 
      [req.user.id]
    );

    // Send the updated user data back to React, injecting the role from the token
    res.json({
      ...updatedUser[0],
      role: req.user.role
    });
    
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    console.error("PUT Profile Error:", err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;