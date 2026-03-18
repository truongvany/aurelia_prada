import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Package, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="container-fluid bg-light min-vh-100 p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 sidebar-admin d-none d-md-flex flex-column" style={{ position: 'sticky', top: '76px', height: 'calc(100vh - 76px)' }}>
          <div className="p-4 flex-grow-1">
            <h5 className="font-serif fw-bold mb-4 px-2">Admin Panel</h5>
            <div className="d-flex flex-column gap-2">
              <NavLink end to="/admin" className={({isActive}) => `admin-nav-link text-decoration-none ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Dashboard
              </NavLink>
              <NavLink to="/admin/products" className={({isActive}) => `admin-nav-link text-decoration-none ${isActive ? 'active' : ''}`}>
                <Package size={20} /> Products
              </NavLink>
              <NavLink to="/admin/orders" className={({isActive}) => `admin-nav-link text-decoration-none ${isActive ? 'active' : ''}`}>
                <ShoppingBag size={20} /> Orders
              </NavLink>
              <NavLink to="/admin/customers" className={({isActive}) => `admin-nav-link text-decoration-none ${isActive ? 'active' : ''}`}>
                <Users size={20} /> Customers
              </NavLink>
              <NavLink to="/admin/settings" className={({isActive}) => `admin-nav-link text-decoration-none ${isActive ? 'active' : ''}`}>
                <Settings size={20} /> Settings
              </NavLink>
            </div>
          </div>
          <div className="p-4 border-top">
            <NavLink to="/" className="admin-nav-link text-decoration-none text-danger">
              <LogOut size={20} /> Logout
            </NavLink>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4 p-lg-5" style={{ minHeight: 'calc(100vh - 76px)' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
