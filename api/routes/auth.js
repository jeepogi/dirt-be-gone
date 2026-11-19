const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // 👈 Make sure this is imported

// ✅ Email format check — must be a valid @gmail.com address
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

// REGISTER / SIGN UP
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Validation: Ensure fields exist
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // 1b. ✅ Validate email format (must end with @gmail.com)
    if (!GMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Gmail address (e.g., user@gmail.com)."
      });
    }

    const table = role === 'Staff' ? 'Staff' : 'Customer';

    // 2. Check if user exists
    const [existing] = await db.query(`SELECT * FROM ${table} WHERE email_address = ?`, [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    // 3. 🔒 HASH THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const generatedUsername = email.split('@')[0] + Math.floor(Math.random() * 1000);

    // 4. Save with hashed password
    if (role === 'Staff') {
      await db.query(
        'INSERT INTO Staff (full_name, email_address, password, role, username, contact_number) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role, generatedUsername, '0000000000']
      );
    } else {
      await db.query(
        'INSERT INTO Customer (full_name, email_address, password, registration_date, username, contact_number) VALUES (?, ?, ?, UNIX_TIMESTAMP(), ?, ?)',
        [name, email, hashedPassword, generatedUsername, '0000000000']
      );
    }

    res.json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    console.error("DATABASE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Database error during registration" });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // ✅ Reject malformed emails early (consistent with register)
    if (!GMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Gmail address (e.g., user@gmail.com)."
      });
    }

    const table = role === 'Staff' ? 'Staff' : 'Customer';

    const [users] = await db.query(`SELECT * FROM ${table} WHERE email_address = ?`, [email]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = users[0];

    // 🔒 COMPARE HASHED PASSWORDS
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // 🔒 GENERATE JWT TOKEN
    const userId = role === 'Staff' ? user.staff_id : user.customer_id;

    const token = jwt.sign(
      { id: userId, role: role },
      process.env.JWT_SECRET || 'super_secret_laundry_key_123',
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token: token, // 👈 Send the token to React
      user: {
        id: userId,
        name: user.full_name,
        email: user.email_address,
        role: role
      }
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Database error during login" });
  }
});

module.exports = router;