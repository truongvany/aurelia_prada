import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 border-bottom sticky-top">
        <div className="container-fluid px-4">
          <Link className="navbar-brand" to="/admin">AURELIA <span className="fs-6 text-muted fw-normal font-sans">Admin</span></Link>
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <Search size={20} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input type="text" className="form-control rounded-pill ps-5" placeholder="Search..." />
            </div>
            <div className="dropdown">
              <button className="btn btn-link text-dark text-decoration-none dropdown-toggle d-flex align-items-center gap-2" type="button" id="adminDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=E8D8D0&color=333" alt="Admin" className="rounded-circle" width="32" height="32" />
                <span className="d-none d-md-inline">Admin</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm" aria-labelledby="adminDropdown">
                <li><Link className="dropdown-item" to="/">View Store</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item text-danger" to="/login">Logout</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-transparent py-4 position-absolute w-100 z-3">
      <div className="container">
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <Menu size={24} />
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/shop">Shop</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <Link className="navbar-brand mx-auto text-center position-absolute start-50 translate-middle-x" to="/">AURELIA</Link>

        <div className="d-flex align-items-center gap-4 ms-auto">
          <button className="btn btn-link text-dark p-0 text-decoration-none d-none d-md-block">
            <Search size={20} />
          </button>
          <Link to="/login" className="text-dark text-decoration-none">
            <User size={20} />
          </Link>
          <Link to="/cart" className="btn btn-link text-dark p-0 text-decoration-none position-relative">
            <ShoppingBag size={20} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark" style={{ fontSize: '0.6rem' }}>
              3
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
