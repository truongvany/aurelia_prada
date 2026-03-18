import React from 'react';
import { Search, Eye, Download } from 'lucide-react';

const orders = [
  { id: '#ORD-001', customer: 'Jane Doe', email: 'jane@example.com', date: 'Oct 24, 2026', total: '$120.00', status: 'Completed', items: 1 },
  { id: '#ORD-002', customer: 'Alice Smith', email: 'alice@example.com', date: 'Oct 23, 2026', total: '$235.50', status: 'Processing', items: 3 },
  { id: '#ORD-003', customer: 'Emma Johnson', email: 'emma@example.com', date: 'Oct 22, 2026', total: '$85.00', status: 'Completed', items: 1 },
  { id: '#ORD-004', customer: 'Olivia Brown', email: 'olivia@example.com', date: 'Oct 21, 2026', total: '$450.00', status: 'Shipped', items: 4 },
  { id: '#ORD-005', customer: 'Sophia Davis', email: 'sophia@example.com', date: 'Oct 20, 2026', total: '$150.00', status: 'Cancelled', items: 2 },
];

const Orders = () => {
  return (
    <div className="fade-in-stagger delay-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="font-serif fw-bold mb-1">Orders</h2>
          <p className="text-muted mb-0">View and manage customer orders.</p>
        </div>
        <button className="btn btn-outline-dark rounded-pill px-4 d-flex align-items-center gap-2">
          <Download size={18} /> Export
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center">
          <div className="position-relative" style={{ width: '300px' }}>
            <Search className="position-absolute top-50 translate-middle-y text-muted ms-3" size={18} />
            <input type="text" className="form-control bg-light border-0 rounded-pill ps-5" placeholder="Search orders..." />
          </div>
          <div className="d-flex gap-2">
            <select className="form-select bg-light border-0 rounded-pill w-auto">
              <option>All Status</option>
              <option>Completed</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Cancelled</option>
            </select>
            <select className="form-select bg-light border-0 rounded-pill w-auto">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase tracking-wider">
              <tr>
                <th className="ps-4 py-3">Order ID</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Date</th>
                <th className="py-3">Items</th>
                <th className="py-3">Total</th>
                <th className="py-3">Status</th>
                <th className="pe-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="ps-4 py-3 fw-medium">{order.id}</td>
                  <td className="py-3">
                    <div className="d-flex flex-column">
                      <span className="fw-medium">{order.customer}</span>
                      <span className="text-muted small">{order.email}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted">{order.date}</td>
                  <td className="py-3 text-muted">{order.items}</td>
                  <td className="py-3 fw-medium">{order.total}</td>
                  <td className="py-3">
                    <span className={`badge rounded-pill fw-normal ${
                      order.status === 'Completed' ? 'bg-success bg-opacity-10 text-success' : 
                      order.status === 'Processing' ? 'bg-warning bg-opacity-10 text-warning' : 
                      order.status === 'Shipped' ? 'bg-info bg-opacity-10 text-info' : 
                      'bg-danger bg-opacity-10 text-danger'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="pe-4 py-3 text-end">
                    <button className="btn btn-sm btn-light rounded-circle"><Eye size={16} className="text-muted" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-top p-4 d-flex justify-content-between align-items-center">
          <span className="text-muted small">Showing 1 to 5 of 2,350 entries</span>
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

export default Orders;
