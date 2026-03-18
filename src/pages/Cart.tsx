import React from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, CreditCard, ShieldCheck, Award, Gift } from 'lucide-react';

const Cart = () => {
  const cartItems = [
    {
      id: 1,
      name: 'Silk Slip Dress in Pearl',
      color: 'Champagne',
      size: 'SMALL',
      price: 320.00,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      name: 'Merino Wool Overcoat',
      color: 'Oat Milk',
      size: 'MEDIUM',
      price: 850.00,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1515347619152-141b212f4551?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      name: 'Pointed Mule in Cream Leather',
      color: 'Ivory',
      size: '38',
      price: 425.00,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <div className="cart-page min-vh-100 pt-5 mt-5 pb-5">
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4 fade-in-stagger delay-1">
          <ol className="breadcrumb small fw-medium">
            <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item active text-dark" aria-current="page">Shopping Bag</li>
          </ol>
        </nav>

        <div className="row g-5">
          {/* Left Column - Cart Items */}
          <div className="col-lg-8 fade-in-stagger delay-2">
            <div className="d-flex justify-content-between align-items-end mb-4 pb-2 border-bottom">
              <h1 className="font-sans fw-bold mb-0">Your Bag</h1>
              <span className="text-muted small fw-bold text-uppercase tracking-wider">{cartItems.length} ITEMS TOTAL</span>
            </div>

            <div className="d-flex flex-column gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex gap-4 pb-4 border-bottom position-relative">
                  <img src={item.image} alt={item.name} className="cart-item-img shadow-sm" />
                  
                  <div className="d-flex flex-column flex-grow-1 py-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h5 className="font-sans fw-bold mb-1">{item.name}</h5>
                      <button className="btn btn-link text-muted p-0 text-decoration-none">
                        <X size={20} />
                      </button>
                    </div>
                    
                    <p className="text-muted small mb-2">Color: {item.color}</p>
                    <div className="mb-auto">
                      <span className="size-badge text-uppercase tracking-wider">SIZE: {item.size}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-end mt-4">
                      <div className="qty-selector">
                        <button className="qty-btn">−</button>
                        <span className="fw-medium px-3">{item.quantity}</span>
                        <button className="qty-btn">+</button>
                      </div>
                      <h5 className="fw-bold mb-0">${item.price.toFixed(2)}</h5>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="col-lg-4 fade-in-stagger delay-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h4 className="font-sans fw-bold mb-4">Order Summary</h4>
              
              <div className="d-flex justify-content-between mb-3 text-muted">
                <span>Subtotal</span>
                <span className="text-dark fw-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3 text-muted align-items-center">
                <span>Shipping</span>
                <span className="badge-complimentary text-uppercase">COMPLIMENTARY</span>
              </div>
              
              <div className="d-flex justify-content-between mb-4 pb-4 border-bottom text-muted">
                <span>Estimated Tax</span>
                <span className="text-dark fw-medium">${tax.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fs-5 fw-bold">Total</span>
                <span className="fs-3 fw-bold text-checkout">${total.toFixed(2)}</span>
              </div>
              
              <button className="btn btn-checkout w-100 rounded-pill py-3 mb-3 fw-bold d-flex justify-content-center align-items-center gap-2">
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              
              <Link to="/shop" className="btn btn-light bg-white border w-100 rounded-pill py-3 fw-bold text-dark text-decoration-none d-block text-center mb-4">
                Continue Shopping
              </Link>
              
              <p className="text-center text-muted small lh-base mb-4 px-2" style={{ fontSize: '0.75rem' }}>
                Complimentary shipping and returns on all domestic orders. Sustainability is at our core - your items will arrive in 100% recyclable premium packaging.
              </p>
              
              <div className="d-flex justify-content-center gap-4 text-muted opacity-50">
                <CreditCard size={24} />
                <ShieldCheck size={24} />
                <Award size={24} />
              </div>
            </div>

            {/* Gift Wrapping Card */}
            <div className="card gift-wrapping-card rounded-4 p-4 fade-in-stagger delay-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Gift size={20} className="text-checkout" />
                <h6 className="fw-bold mb-0">Gift Wrapping</h6>
              </div>
              <p className="text-muted small mb-3">Add a handwritten note and our signature box for $10.</p>
              <button className="btn btn-link text-checkout text-decoration-none p-0 fw-bold text-start text-uppercase tracking-wider small" style={{ fontSize: '0.8rem' }}>
                ADD GIFT OPTION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
