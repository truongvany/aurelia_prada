import React from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';

const products = [
  { id: 1, name: 'Silk Slip Dress', category: 'Dresses', price: '$120.00', stock: 45, status: 'Active', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&w=100&q=80' },
  { id: 2, name: 'Linen Wrap Blouse', category: 'Tops', price: '$85.00', stock: 12, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1515347619152-141b212f4551?ixlib=rb-4.0.3&w=100&q=80' },
  { id: 3, name: 'Cashmere Cardigan', category: 'Knitwear', price: '$150.00', stock: 0, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1574291814206-363acdf2aa79?ixlib=rb-4.0.3&w=100&q=80' },
  { id: 4, name: 'Pleated Midi Skirt', category: 'Bottoms', price: '$95.00', stock: 89, status: 'Active', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-4.0.3&w=100&q=80' },
  { id: 5, name: 'Tailored Trousers', category: 'Bottoms', price: '$110.00', stock: 34, status: 'Active', image: 'https://images.unsplash.com/photo-1509631179647-0c500ba14174?ixlib=rb-4.0.3&w=100&q=80' },
];

const Products = () => {
  return (
    <div className="fade-in-stagger delay-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="font-serif fw-bold mb-1">Products</h2>
          <p className="text-muted mb-0">Manage your store inventory and product catalog.</p>
        </div>
        <button className="btn btn-dark rounded-pill px-4 d-flex align-items-center gap-2">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center">
          <div className="position-relative" style={{ width: '300px' }}>
            <Search className="position-absolute top-50 translate-middle-y text-muted ms-3" size={18} />
            <input type="text" className="form-control bg-light border-0 rounded-pill ps-5" placeholder="Search products..." />
          </div>
          <div className="d-flex gap-2">
            <select className="form-select bg-light border-0 rounded-pill w-auto">
              <option>All Categories</option>
              <option>Dresses</option>
              <option>Tops</option>
              <option>Bottoms</option>
            </select>
            <select className="form-select bg-light border-0 rounded-pill w-auto">
              <option>Status</option>
              <option>Active</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase tracking-wider">
              <tr>
                <th className="ps-4 py-3">Product</th>
                <th className="py-3">Category</th>
                <th className="py-3">Price</th>
                <th className="py-3">Stock</th>
                <th className="py-3">Status</th>
                <th className="pe-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src={product.image} alt={product.name} className="rounded-3 object-fit-cover" style={{ width: '48px', height: '48px' }} />
                      <span className="fw-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted">{product.category}</td>
                  <td className="py-3 fw-medium">{product.price}</td>
                  <td className="py-3 text-muted">{product.stock}</td>
                  <td className="py-3">
                    <span className={`badge rounded-pill fw-normal ${
                      product.status === 'Active' ? 'bg-success bg-opacity-10 text-success' : 
                      product.status === 'Low Stock' ? 'bg-warning bg-opacity-10 text-warning' : 
                      'bg-danger bg-opacity-10 text-danger'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="pe-4 py-3 text-end">
                    <button className="btn btn-sm btn-light rounded-circle me-2"><Edit size={16} className="text-muted" /></button>
                    <button className="btn btn-sm btn-light rounded-circle"><Trash2 size={16} className="text-danger" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-top p-4 d-flex justify-content-between align-items-center">
          <span className="text-muted small">Showing 1 to 5 of 142 entries</span>
          <ul className="pagination pagination-sm mb-0">
            <li className="page-item disabled"><a className="page-link border-0 rounded-circle text-dark" href="#">Prev</a></li>
            <li className="page-item active"><a className="page-link border-0 rounded-circle bg-dark text-white" href="#">1</a></li>
            <li className="page-item"><a className="page-link border-0 rounded-circle text-dark" href="#">2</a></li>
            <li className="page-item"><a className="page-link border-0 rounded-circle text-dark" href="#">3</a></li>
            <li className="page-item"><a className="page-link border-0 rounded-circle text-dark" href="#">Next</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Products;
