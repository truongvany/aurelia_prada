const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// Create new order (e.g., from checkout frontend)
router.post('/', async (req, res) => {
  const { id, customer, date, items, total, status } = req.body;
  try {
    await pool.query(
      'INSERT INTO orders (id, customer, date, items, total, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, customer, date, items, total, status || 'Processing']
    );
    res.status(201).json({ message: 'Order created', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Update order status (Admin)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating order' });
  }
});

module.exports = router;
