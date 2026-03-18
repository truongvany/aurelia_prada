const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// Create new product
router.post('/', async (req, res) => {
  const { name, price, originalPrice, category, color, image, badge } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, price, originalPrice, category, color, image, badge) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, price, originalPrice || null, category, color, image, badge || null]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  const { name, price, originalPrice, category, color, image, badge } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE products SET name = ?, price = ?, originalPrice = ?, category = ?, color = ?, image = ?, badge = ? WHERE id = ?',
      [name, price, originalPrice || null, category, color, image, badge || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

module.exports = router;
