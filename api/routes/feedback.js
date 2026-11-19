const express = require('express');
const db = require('../utils/db');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ==========================================
// POST /api/feedback (Customer submits)
// ==========================================
router.post('/feedback', auth, async (req, res) => {
  const { type, rating, message } = req.body;

  // 1. Validation
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Feedback message is required.' });
  }
  if (!rating) {
    return res.status(400).json({ success: false, message: 'Rating is required.' });
  }

  try {
    // 2. Format Date for MySQL (YYYY-MM-DD HH:MM:SS)
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');

    // 3. Insert into the Feedback table
    await db.query(
      `INSERT INTO Feedback 
      (customer_id, feedback_type, rating, message, feedback_date) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id, 
        type || 'General', 
        parseInt(rating), 
        message.trim(), 
        formattedDate
      ]
    );

    res.status(201).json({ success: true, message: 'Feedback submitted successfully!' });
  } catch (err) {
    console.error("POST Feedback Error:", err.message);
    res.status(500).json({ 
      success: false, 
      message: `SQL Error: ${err.message}` 
    });
  }
});

// ==========================================
// GET /api/feedback (Staff fetches all)
// ==========================================
router.get('/feedback', auth, requireRole('Staff'), async (req, res) => {
  try {
    // Join with the Customer table to get the customer's name
    const [feedbacks] = await db.query(
      `SELECT 
        f.feedback_id, 
        f.feedback_type as type, 
        f.rating, 
        f.message as text, 
        f.feedback_date as date, 
        c.full_name as user
       FROM Feedback f
       JOIN Customer c ON f.customer_id = c.customer_id
       ORDER BY f.feedback_date DESC`
    );

    res.json(feedbacks);
  } catch (err) {
    console.error("GET Feedback Error:", err.message);
    res.status(500).json({ success: false, message: 'Database error while fetching feedback.' });
  }
});

module.exports = router;