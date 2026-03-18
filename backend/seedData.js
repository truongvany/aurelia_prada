module.exports.products = [
  {
    name: 'Silk Slip Dress in Pearl',
    price: 1690000,
    originalPrice: null,
    category: 'Dresses',
    color: 'Champagne',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    badge: 'New'
  },
  {
    name: 'Linen Wrap Blouse',
    price: 1590000,
    originalPrice: null,
    category: 'Tops',
    color: 'Ivory',
    image: 'https://pubcdn.ivymoda.com/files/product/thumab/400/2026/03/06/57a2529097e90cffd3b4a83ad8b99f2c.webp',
    badge: 'New'
  },
  {
    name: 'Cashmere Cardigan',
    price: 1390000,
    originalPrice: null,
    category: 'Knitwear',
    color: 'Black',
    image: 'https://images.unsplash.com/photo-1574291814206-363acdf2aa79?auto=format&fit=crop&w=800&q=80',
    badge: 'New'
  },
  {
    name: 'Pleated Midi Skirt',
    price: 1290000,
    originalPrice: null,
    category: 'Bottoms',
    color: 'Sage',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    badge: 'New'
  },
  {
    name: 'Tailored Trousers',
    price: 534000,
    originalPrice: 890000,
    category: 'Bottoms',
    color: 'Black',
    image: 'https://images.unsplash.com/photo-1509631179647-0c500ba14174?auto=format&fit=crop&w=800&q=80',
    badge: '-40%'
  },
  {
    name: 'Oversized Blazer',
    price: 850500,
    originalPrice: 1890000,
    category: 'Outerwear',
    color: 'Oat',
    image: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80',
    badge: '-55%'
  },
  {
    name: 'Merino Wool Overcoat',
    price: 876000,
    originalPrice: 2190000,
    category: 'Outerwear',
    color: 'Oat',
    image: 'https://images.unsplash.com/photo-1515347619152-141b212f4551?auto=format&fit=crop&w=800&q=80',
    badge: '-60%'
  },
  {
    name: 'Pointed Mule in Cream',
    price: 716000,
    originalPrice: 1790000,
    category: 'Shoes',
    color: 'Ivory',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    badge: '-60%'
  }
];

module.exports.adminOrders = [
  { id: '#ORD-001', customer: 'Jane Doe', date: '2026-10-24', items: 1, total: 120, status: 'Completed' },
  { id: '#ORD-002', customer: 'Alice Smith', date: '2026-10-23', items: 3, total: 235.5, status: 'Processing' },
  { id: '#ORD-003', customer: 'Emma Johnson', date: '2026-10-22', items: 1, total: 85, status: 'Completed' },
  { id: '#ORD-004', customer: 'Olivia Brown', date: '2026-10-21', items: 4, total: 450, status: 'Shipped' },
  { id: '#ORD-005', customer: 'Sophia Davis', date: '2026-10-20', items: 2, total: 150, status: 'Cancelled' }
];

module.exports.adminCustomers = [
  { name: 'Jane Doe', email: 'jane@example.com', phone: '+1 234 567 890', orders: 12, spent: 1250, status: 'Active' },
  { name: 'Alice Smith', email: 'alice@example.com', phone: '+1 234 567 891', orders: 3, spent: 345.5, status: 'Active' },
  { name: 'Emma Johnson', email: 'emma@example.com', phone: '+1 234 567 892', orders: 1, spent: 85, status: 'New' },
  { name: 'Olivia Brown', email: 'olivia@example.com', phone: '+1 234 567 893', orders: 24, spent: 3450, status: 'VIP' }
];
