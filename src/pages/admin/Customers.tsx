import React from 'react';
import { Search, Mail, Download, MoreVertical } from 'lucide-react';

const customers = [
  { id: 1, name: 'Jane Doe', email: 'jane@example.com', phone: '+1 234 567 890', orders: 12, spent: '$1,250.00', joinDate: 'Jan 15, 2025', status: 'Active' },
  { id: 2, name: 'Alice Smith', email: 'alice@example.com', phone: '+1 234 567 891', orders: 3, spent: '$345.50', joinDate: 'Mar 22, 2025', status: 'Active' },
  { id: 3, name: 'Emma Johnson', email: 'emma@example.com', phone: '+1 234 567 892', orders: 1, spent: '$85.00', joinDate: 'Oct 10, 2026', status: 'New' },
  { id: 4, name: 'Olivia Brown', email: 'olivia@example.com', phone: '+1 234 567 893', orders: 24, spent: '$3,450.00', joinDate: 'Nov 05, 2024', status: 'VIP' },
  { id: 5, name: 'Sophia Davis', email: 'sophia@example.com', phone: '+1 234 567 894', orders: 0, spent: '$0.00', joinDate: 'Oct 24, 2026', status: 'Inactive' },
];

const Customers = () => {
  return (
    <div className="fade-in-stagger delay-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="font-serif fw-bold mb-1">Customers</h2>
          <p className="text-muted mb-0">Manage your customer base and view their history.</p>
        </div>
        <button className="btn btn-outline-dark rounded-pill px-4 d-flex align-items-center gap-2">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom-0 p-4 d-flex justify-content-between align-items-center">
          <div className="position-relative" style={{ width: '300px' }}>
            <Search className="position-absolute top-50 translate-middle-y text-muted ms-3" size={18} />
            <input type="text" className="form-control bg-light border-0 rounded-pill ps-5" placeholder="Search customers..." />
          </div>
          <div className="d-flex gap-2">
            <select className="form-select bg-light border-0 rounded-pill w-auto">
              <option>All Status</option>
              <option>Active</option>
              <option>New</option>
              <option>VIP</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase tracking-wider">
              <tr>
                <th className="ps-4 py-3">Customer</th>
                <th className="py-3">Contact</th>
                <th className="py-3">Orders</th>
                <th className="py-3">Total Spent</th>
                <th className="py-3">Joined</th>
                <th className="py-3">Status</th>
                <th className="pe-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold" style={{ width: '40px', height: '40px' }}>
                        {customer.name.charAt(0)}
                      </div>
                      <span className="fw-medium">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="d-flex flex-column">
                      <span className="text-muted small">{customer.email}</span>
                      <span className="text-muted small">{customer.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted">{customer.orders}</td>
                  <td className="py-3 fw-medium">{customer.spent}</td>
                  <td className="py-3 text-muted">{customer.joinDate}</td>
                  <td className="py-3">
                    <span className={`badge rounded-pill fw-normal ${
                      customer.status === 'VIP' ? 'bg-primary bg-opacity-10 text-primary' : 
                      customer.status === 'Active' ? 'bg-success bg-opacity-10 text-success' : 
                      customer.status === 'New' ? 'bg-info bg-opacity-10 text-info' : 
                      'bg-secondary bg-opacity-10 text-secondary'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="pe-4 py-3 text-end">
                    <button className="btn btn-sm btn-light rounded-circle me-2"><Mail size={16} className="text-muted" /></button>
                    <button className="btn btn-sm btn-light rounded-circle"><MoreVertical size={16} className="text-muted" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-top p-4 d-flex justify-content-between align-items-center">
          <span className="text-muted small">Showing 1 to 5 of 12,234 entries</span>
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

export default Customers;
