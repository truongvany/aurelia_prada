import React, { useState } from 'react';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const orders = [
    { id: '#ORD-2026-001', date: 'Oct 12, 2026', status: 'Delivered', total: '$205.00' },
    { id: '#ORD-2026-002', date: 'Nov 05, 2026', status: 'Processing', total: '$120.00' },
  ];

  return (
    <div className="container py-5 mt-5 min-vh-100">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4 mb-lg-0">
          <div className="card p-4 text-center mb-4">
            <img 
              src="https://ui-avatars.com/api/?name=Jane+Doe&background=E8D8D0&color=333" 
              alt="Profile" 
              className="rounded-circle mx-auto mb-3" 
              width="100" 
              height="100" 
            />
            <h5 className="font-serif fw-bold mb-1">Jane Doe</h5>
            <p className="text-muted small mb-0">jane.doe@example.com</p>
          </div>

          <div className="card p-2">
            <div className="list-group list-group-flush border-0">
              <button 
                className={`list-group-item list-group-item-action border-0 d-flex align-items-center gap-3 py-3 ${activeTab === 'orders' ? 'active bg-light text-dark fw-medium rounded' : 'text-muted'}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={18} /> My Orders
              </button>
              <button 
                className={`list-group-item list-group-item-action border-0 d-flex align-items-center gap-3 py-3 ${activeTab === 'wishlist' ? 'active bg-light text-dark fw-medium rounded' : 'text-muted'}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={18} /> Wishlist
              </button>
              <button 
                className={`list-group-item list-group-item-action border-0 d-flex align-items-center gap-3 py-3 ${activeTab === 'settings' ? 'active bg-light text-dark fw-medium rounded' : 'text-muted'}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={18} /> Account Settings
              </button>
              <button className="list-group-item list-group-item-action border-0 d-flex align-items-center gap-3 py-3 text-danger mt-2">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          <div className="card p-4 p-md-5 h-100">
            {activeTab === 'orders' && (
              <div>
                <h3 className="font-serif fw-bold mb-4">Order History</h3>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-medium text-muted py-3">Order ID</th>
                        <th className="fw-medium text-muted py-3">Date</th>
                        <th className="fw-medium text-muted py-3">Status</th>
                        <th className="fw-medium text-muted py-3">Total</th>
                        <th className="fw-medium text-muted py-3 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="py-3 fw-medium">{order.id}</td>
                          <td className="py-3 text-muted">{order.date}</td>
                          <td className="py-3">
                            <span className={`badge rounded-pill fw-normal ${order.status === 'Delivered' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 fw-medium">{order.total}</td>
                          <td className="py-3 text-end">
                            <button className="btn btn-sm btn-outline-dark rounded-pill px-3">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h3 className="font-serif fw-bold mb-4">My Wishlist</h3>
                <p className="text-muted">Your wishlist is currently empty. Start exploring our collection!</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="font-serif fw-bold mb-4">Account Settings</h3>
                <form>
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-medium text-muted">First Name</label>
                      <input type="text" className="form-control" defaultValue="Jane" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-medium text-muted">Last Name</label>
                      <input type="text" className="form-control" defaultValue="Doe" />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small fw-medium text-muted">Email Address</label>
                      <input type="email" className="form-control" defaultValue="jane.doe@example.com" />
                    </div>
                  </div>
                  <button type="button" className="btn btn-dark rounded-pill px-4">Save Changes</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
