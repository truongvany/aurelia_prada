export const products = [
  {
    id: 1,
    name: 'Đầm họa tiết Springlight Floral',
    price: 1690000,
    originalPrice: null,
    category: 'Dresses',
    color: 'Champagne',
    image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/b1dc876b0be0daccf2f3d334cfcf27d6.webp',
    badge: 'New'
  },
  {
    id: 2,
    name: 'Quần tây dáng suông Melange',
    price: 1590000,
    originalPrice: null,
    category: 'Bottoms',
    color: 'Ivory',
    image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/5ed8763b426af135a4cc0f688bd9f1bd.webp',
    badge: 'New'
  },
  {
    id: 3,
    name: 'Áo sơ mi họa tiết Spring Mosaic',
    price: 1390000,
    originalPrice: null,
    category: 'Tops',
    color: 'Black',
    image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/554530918643b20e07f912d8d7650e02.webp',
    badge: 'New'
  },
  {
    id: 4,
    name: 'Áo sơ mi cổ nơ Nâu Tây',
    price: 1290000,
    originalPrice: null,
    category: 'Tops',
    color: 'Sage',
    image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/db9f5609e5deba38d07272d7496b6ae5.webp',
    badge: 'New'
  },
  {
    id: 5,
    name: 'Áo sơ mi phối túi Beige',
    price: 534000,
    originalPrice: 890000,
    category: 'Tops',
    color: 'Black',
    image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/4c7f2683847186c00369b3b52d048d31.webp',
    badge: '-40%'
  },
  {
    id: 6,
    name: 'Áo sơ mi xếp ly Tencel Matcha',
    price: 850500,
    originalPrice: 1890000,
    category: 'Tops',
    color: 'Oat',
    image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/be3375421aa04748b10c0b594b07e0b5.webp',
    badge: '-55%'
  },
  {
    id: 7,
    name: 'Áo Croptop đính hoa vai',
    price: 876000,
    originalPrice: 2190000,
    category: 'Tops',
    color: 'Oat',
    image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/60007f762225d9dd32fd5c0e9a28e1da.webp',
    badge: '-60%'
  },
  {
    id: 8,
    name: 'Đầm hoa xanh Spring Pastel',
    price: 716000,
    originalPrice: 1790000,
    category: 'Dresses',
    color: 'Ivory',
    image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/e4ce118778e8f39af38a2ecabe204b4a.webp',
    badge: '-60%'
  }
];

export const cartSeed = [
  { id: 1, quantity: 1, size: 'S' },
  { id: 7, quantity: 1, size: 'M' },
  { id: 8, quantity: 1, size: '38' }
];

export const adminOrders = [
  { id: '#ORD-001', customer: 'Jane Doe', date: '2026-10-24', items: 1, total: 120, status: 'Completed' },
  { id: '#ORD-002', customer: 'Alice Smith', date: '2026-10-23', items: 3, total: 235.5, status: 'Processing' },
  { id: '#ORD-003', customer: 'Emma Johnson', date: '2026-10-22', items: 1, total: 85, status: 'Completed' },
  { id: '#ORD-004', customer: 'Olivia Brown', date: '2026-10-21', items: 4, total: 450, status: 'Shipped' },
  { id: '#ORD-005', customer: 'Sophia Davis', date: '2026-10-20', items: 2, total: 150, status: 'Cancelled' }
];

export const adminCustomers = [
  { name: 'Jane Doe', email: 'jane@example.com', phone: '+1 234 567 890', orders: 12, spent: 1250, status: 'Active' },
  { name: 'Alice Smith', email: 'alice@example.com', phone: '+1 234 567 891', orders: 3, spent: 345.5, status: 'Active' },
  { name: 'Emma Johnson', email: 'emma@example.com', phone: '+1 234 567 892', orders: 1, spent: 85, status: 'New' },
  { name: 'Olivia Brown', email: 'olivia@example.com', phone: '+1 234 567 893', orders: 24, spent: 3450, status: 'VIP' }
];
