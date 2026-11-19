const express = require('express');
const db = require('../utils/db');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/services
router.get('/services', auth, async (req, res) => {
  try {
    const [services] = await db.query(`SELECT * FROM Service`);
    res.json(services);
  } catch (err) {
    console.error("GET Services Error:", err.message);
    res.status(500).json({ success: false, message: 'Database error fetching services.' });
  }
});

// POST /api/services (Staff creates new)
router.post('/services', auth, requireRole('Staff'), async (req, res) => {
  const { service_name, description, price_rate, unit, icon, availability } = req.body;

  if (!service_name || !price_rate) {
    return res.status(400).json({ success: false, message: 'Service name and price are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Service (staff_id, service_name, description, price_rate, unit, icon, availability) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, 
        service_name, 
        description || '', 
        price_rate, 
        unit || 'kg', 
        icon || '🧺', 
        availability ? 1 : 0
      ]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Service added successfully!',
      service_id: result.insertId 
    });
  } catch (err) {
    console.error("POST Service Error:", err.message);
    res.status(500).json({ success: false, message: 'Database error creating service.' });
  }
});

// PUT /api/services/:id (Staff updates)
router.put('/services/:id', auth, requireRole('Staff'), async (req, res) => {
  const { id } = req.params;
  const { service_name, description, price_rate, unit, icon, availability } = req.body;

  const cleanId = parseInt(String(id).replace(/\D/g, ''), 10);

  if (isNaN(cleanId)) {
    return res.status(400).json({ success: false, message: 'Invalid service ID' });
  }

  try {
    await db.query(
      `UPDATE Service 
       SET service_name = ?, description = ?, price_rate = ?, unit = ?, icon = ?, availability = ? 
       WHERE service_id = ?`,
      [
        service_name, 
        description || '', 
        price_rate, 
        unit || 'kg', 
        icon || '🧺', 
        availability ? 1 : 0, 
        cleanId
      ]
    );

    res.json({ success: true, message: 'Service updated successfully!' });
  } catch (err) {
    console.error("PUT Service Error:", err.message);
    res.status(500).json({ success: false, message: 'Database error updating service.' });
  }
});

// DELETE /api/services/:id (Staff deletes)
router.delete('/services/:id', auth, requireRole('Staff'), async (req, res) => {
  const { id } = req.params;
  const cleanId = parseInt(String(id).replace(/\D/g, ''), 10);

  if (isNaN(cleanId)) {
    return res.status(400).json({ success: false, message: 'Invalid service ID' });
  }

  try {
    await db.query(`DELETE FROM Service WHERE service_id = ?`, [cleanId]);
    res.json({ success: true, message: 'Service deleted successfully!' });
  } catch (err) {
    console.error("DELETE Service Error:", err.message);
    res.status(500).json({ success: false, message: 'Database error deleting service.' });
  }
});

// ============================================================
// ✅ PUT /api/request_service/:id/status  — Staff updates status
// ============================================================
router.put('/request_service/:id/status', auth, requireRole('Staff'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  // Strip letters so 's4' becomes '4' (matches other routes)
  const cleanId = parseInt(String(id).replace(/\D/g, ''), 10);
  if (isNaN(cleanId)) {
    return res.status(400).json({ message: 'Invalid request ID' });
  }

  try {
    const [result] = await db.query(
      'UPDATE Service_Request SET request_status = ? WHERE request_id = ?',
      [status, cleanId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ 
      success: true, 
      message: `Status updated to ${status}`,
      request_id: cleanId, 
      request_status: status 
    });
  } catch (err) {
    console.error('PUT Status Error:', err.message);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;