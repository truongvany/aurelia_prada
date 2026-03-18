import React from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
];

const Dashboard = () => {
  return (
    <div className="fade-in-stagger delay-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="font-serif fw-bold mb-0">Dashboard Overview</h2>
        <button className="btn btn-dark rounded-pill px-4">Download Report</button>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-muted small fw-medium mb-1 text-uppercase tracking-wider">Total Revenue</p>
                <h3 className="fw-bold mb-0">$45,231.89</h3>
              </div>
              <div className="p-2 bg-success bg-opacity-10 rounded text-success">
                <DollarSign size={20} />
              </div>
            </div>
            <p className="text-success small mb-0 d-flex align-items-center gap-1">
              <TrendingUp size={14} /> +20.1% from last month
            </p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-muted small fw-medium mb-1 text-uppercase tracking-wider">Orders</p>
                <h3 className="fw-bold mb-0">+2350</h3>
              </div>
              <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                <ShoppingBag size={20} />
              </div>
            </div>
            <p className="text-success small mb-0 d-flex align-items-center gap-1">
              <TrendingUp size={14} /> +15.2% from last month
            </p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-muted small fw-medium mb-1 text-uppercase tracking-wider">Customers</p>
                <h3 className="fw-bold mb-0">+12,234</h3>
              </div>
              <div className="p-2 bg-info bg-opacity-10 rounded text-info">
                <Users size={20} />
              </div>
            </div>
            <p className="text-success small mb-0 d-flex align-items-center gap-1">
              <TrendingUp size={14} /> +10.5% from last month
            </p>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <p className="text-muted small fw-medium mb-1 text-uppercase tracking-wider">Active Products</p>
                <h3 className="fw-bold mb-0">142</h3>
              </div>
              <div className="p-2 bg-warning bg-opacity-10 rounded text-warning">
                <Package size={20} />
              </div>
            </div>
            <p className="text-muted small mb-0 d-flex align-items-center gap-1">
              +4 new products added
            </p>
          </div>
        </div>
      </div>

      {/* Charts & Tables */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card p-4 h-100 border-0 shadow-sm rounded-4">
            <h5 className="font-serif fw-bold mb-4">Sales Overview</h5>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} />
                  <Bar dataKey="sales" fill="#E8D8D0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card p-4 h-100 border-0 shadow-sm rounded-4">
            <h5 className="font-serif fw-bold mb-4">Recent Orders</h5>
            <div className="d-flex flex-column gap-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="d-flex align-items-center justify-content-between border-bottom pb-3 last-border-0">
                  <div>
                    <p className="fw-medium mb-0">#ORD-00{item}</p>
                    <small className="text-muted">Jane Doe</small>
                  </div>
                  <div className="text-end">
                    <p className="fw-medium mb-0">$120.00</p>
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill fw-normal">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
