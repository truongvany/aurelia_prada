const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY spent DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching customers' });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  const { name, email, phone, orders = 0, spent = 0, status = 'New' } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone, orders, spent, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, orders, spent, status]
    );
    res.status(201).json({ id: result.insertId, name, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating customer' });
  }
});

module.exports = router;
