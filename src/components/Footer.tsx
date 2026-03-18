import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <footer className="footer pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <h3 className="font-serif mb-4">AURELIA</h3>
            <p className="text-muted pe-lg-5">
              Empowering women through minimalist, elegant, and sustainable fashion. Designed for the modern muse.
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="text-dark"><Instagram size={20} /></a>
              <a href="#" className="text-dark"><Facebook size={20} /></a>
              <a href="#" className="text-dark"><Twitter size={20} /></a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h5 className="font-serif mb-4 fs-6 text-uppercase tracking-wider">Shop</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="#" className="text-muted text-decoration-none">New Arrivals</Link></li>
              <li><Link to="#" className="text-muted text-decoration-none">Dresses</Link></li>
              <li><Link to="#" className="text-muted text-decoration-none">Tops</Link></li>
              <li><Link to="#" className="text-muted text-decoration-none">Accessories</Link></li>
              <li><Link to="#" className="text-muted text-decoration-none">Sale</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="font-serif mb-4 fs-6 text-uppercase tracking-wider">Help</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/contact" className="text-muted text-decoration-none">Contact Us</Link></li>
              <li><Link to="#" className="text-muted text-decoration-none">FAQ</Link></li>
              <li><Link to="#" className="text-muted text-decoration-none">Shipping & Returns</Link></li>
              <li><Link to="#" className="text-muted text-decoration-none">Size Guide</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h5 className="font-serif mb-4 fs-6 text-uppercase tracking-wider">Newsletter</h5>
            <p className="text-muted">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="mt-4">
              <div className="input-group mb-3">
                <input type="email" className="form-control rounded-start-pill border-end-0" placeholder="Enter your email address" aria-label="Email" />
                <button className="btn btn-outline-secondary border-start-0 rounded-end-pill bg-white text-dark" type="button">
                  <Mail size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="row mt-5 pt-4 border-top">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-muted small mb-0">&copy; {new Date().getFullYear()} Aurelia. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <ul className="list-inline mb-0 small">
              <li className="list-inline-item"><Link to="#" className="text-muted text-decoration-none">Privacy Policy</Link></li>
              <li className="list-inline-item ms-3"><Link to="#" className="text-muted text-decoration-none">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
