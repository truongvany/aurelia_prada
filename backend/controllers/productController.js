const Product = require('../models/Product');
const Category = require('../models/Category');

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Khong tim thay tep anh de upload.' });
      return;
    }

    const url = `/uploads/products/${req.file.filename}`;
    res.status(201).json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category', 'name slug');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, description, images, image, category, stock, variants, badge, material, sizeGuideImage } = req.body;
    
    const product = new Product({
      name: name || 'New Product',
      price: price || 0,
      originalPrice: originalPrice || 0,
      category: category, 
      stock: stock || 0,
      images: images || [],
      image: image || images?.[0] || '/images/sample.jpg',
      description: description || '',
      variants: variants || [],
      badge: badge || '',
      material: material || '',
      sizeGuideImage: sizeGuideImage || '',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      description,
      images,
      image,
      category,
      stock,
      variants,
      badge,
      material,
      sizeGuideImage,
      collectionName,
      status
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name !== undefined ? name : product.name;
      product.price = price !== undefined ? price : product.price;
      product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
      product.description = description !== undefined ? description : product.description;
      product.image = image !== undefined ? image : product.image;
      product.images = images !== undefined ? images : product.images;
      product.variants = variants !== undefined ? variants : product.variants;
      product.category = (category && category !== '') ? category : product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.badge = badge !== undefined ? badge : product.badge;
      product.material = material !== undefined ? material : product.material;
      product.sizeGuideImage = sizeGuideImage !== undefined ? sizeGuideImage : product.sizeGuideImage;
      product.collectionName = collectionName !== undefined ? collectionName : product.collectionName;
      if (status !== undefined) product.status = status;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).json({ 
      message: 'Lỗi máy chủ khi cập nhật sản phẩm',
      error: error.message 
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  uploadProductImage,
};
