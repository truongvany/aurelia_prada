const Cart = require('../models/Cart');
const Product = require('../models/Product');

function toLower(value) {
  return String(value || '').trim().toLowerCase();
}

function findMatchingVariant(product, color, colorCode) {
  const variants = product.variants || [];
  if (!variants.length) return null;

  const colorKey = toLower(color);
  const colorCodeKey = toLower(colorCode);

  return (
    variants.find((variant) => {
      const variantColor = toLower(variant.color);
      const variantColorCode = toLower(variant.colorCode);
      return (
        (colorKey && variantColor === colorKey) ||
        (colorCodeKey && variantColorCode === colorCodeKey)
      );
    }) || null
  );
}

function resolveAvailableStock(product, { color, colorCode }) {
  const variants = product.variants || [];
  if (variants.length > 0) {
    if (!toLower(color) && !toLower(colorCode)) {
      return {
        ok: false,
        message: 'Vui long chon mau san pham truoc khi them vao gio.',
      };
    }

    const variant = findMatchingVariant(product, color, colorCode);
    if (!variant) {
      return {
        ok: false,
        message: 'Khong tim thay bien the mau da chon.',
      };
    }

    return {
      ok: true,
      stock: Math.max(0, Number(variant.stock || 0)),
      color: variant.color || color || '',
      colorCode: variant.colorCode || colorCode || '',
    };
  }

  return {
    ok: true,
    stock: Math.max(0, Number(product.stock || 0)),
    color: '',
    colorCode: '',
  };
}

async function hydrateAndNormalizeCart(cart) {
  const hydrated = await Cart.findById(cart._id).populate('items.product');
  if (!hydrated) return null;

  let changed = false;
  const normalizedItems = [];

  hydrated.items.forEach((item) => {
    if (!item.product) {
      changed = true;
      return;
    }

    const resolved = resolveAvailableStock(item.product, {
      color: item.color,
      colorCode: item.colorCode,
    });

    if (!resolved.ok || resolved.stock <= 0) {
      changed = true;
      return;
    }

    const nextQty = Math.max(1, Number(item.quantity || 1));
    const clampedQty = Math.min(nextQty, resolved.stock);

    if (clampedQty !== item.quantity) {
      changed = true;
    }

    normalizedItems.push({
      product: item.product._id,
      quantity: clampedQty,
      size: item.size || '',
      color: resolved.color,
      colorCode: resolved.colorCode,
    });
  });

  if (changed) {
    hydrated.items = normalizedItems;
    await hydrated.save();
    return Cart.findById(hydrated._id).populate('items.product');
  }

  return hydrated;
}

// @desc    Get logged in user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const normalizedCart = await hydrateAndNormalizeCart(cart);
    res.json(normalizedCart || cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color, colorCode } = req.body;
    const qty = Number(quantity);

    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      res.status(400).json({ message: 'Du lieu them vao gio hang khong hop le.' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'San pham khong ton tai.' });
      return;
    }

    const resolved = resolveAvailableStock(product, { color, colorCode });
    if (!resolved.ok) {
      res.status(400).json({ message: resolved.message });
      return;
    }

    if (resolved.stock <= 0) {
      res.status(400).json({ message: 'San pham da het hang.' });
      return;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const normalizedSize = String(size || '').trim();
    const normalizedColor = resolved.color;

    const itemIndex = cart.items.findIndex((item) => {
      return (
        item.product.toString() === productId &&
        String(item.size || '').trim() === normalizedSize &&
        toLower(item.color) === toLower(normalizedColor)
      );
    });

    if (itemIndex > -1) {
      const nextQty = Number(cart.items[itemIndex].quantity || 0) + qty;
      if (nextQty > resolved.stock) {
        res.status(400).json({
          message: `Chi con ${resolved.stock} san pham trong kho cho bien the da chon.`,
          availableStock: resolved.stock,
        });
        return;
      }

      cart.items[itemIndex].quantity = nextQty;
      cart.items[itemIndex].color = normalizedColor;
      cart.items[itemIndex].colorCode = resolved.colorCode;
    } else {
      if (qty > resolved.stock) {
        res.status(400).json({
          message: `Chi con ${resolved.stock} san pham trong kho cho bien the da chon.`,
          availableStock: resolved.stock,
        });
        return;
      }

      cart.items.push({
        product: productId,
        quantity: qty,
        size: normalizedSize,
        color: normalizedColor,
        colorCode: resolved.colorCode,
      });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
      await cart.save();

      const updatedCart = await Cart.findById(cart._id).populate('items.product');
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
      res.json({ message: 'Cart cleared' });
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity in cart
// @route   PATCH /api/cart/:itemId
// @access  Private
const updateCartItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty <= 0) {
      res.status(400).json({ message: 'So luong khong hop le.' });
      return;
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === req.params.itemId);
    if (itemIndex < 0) {
      res.status(404).json({ message: 'Item not found in cart' });
      return;
    }

    const targetItem = cart.items[itemIndex];
    const product = await Product.findById(targetItem.product);

    if (!product) {
      res.status(404).json({ message: 'San pham khong ton tai.' });
      return;
    }

    const resolved = resolveAvailableStock(product, {
      color: targetItem.color,
      colorCode: targetItem.colorCode,
    });

    if (!resolved.ok) {
      res.status(400).json({ message: resolved.message });
      return;
    }

    if (qty > resolved.stock) {
      res.status(400).json({
        message: `Chi con ${resolved.stock} san pham trong kho cho bien the da chon.`,
        availableStock: resolved.stock,
      });
      return;
    }

    targetItem.quantity = qty;
    targetItem.color = resolved.color;
    targetItem.colorCode = resolved.colorCode;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItemQuantity,
};
