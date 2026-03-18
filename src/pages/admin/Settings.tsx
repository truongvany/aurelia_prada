import React from 'react';
import { Save } from 'lucide-react';

const Settings = () => {
  return (
    <div className="fade-in-stagger delay-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="font-serif fw-bold mb-1">Settings</h2>
          <p className="text-muted mb-0">Manage your store preferences and configurations.</p>
        </div>
        <button className="btn btn-dark rounded-pill px-4 d-flex align-items-center gap-2">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom-0 p-4 pb-0">
              <h5 className="font-serif fw-bold mb-0">Store Details</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted small text-uppercase tracking-wider">Store Name</label>
                  <input type="text" className="form-control bg-light border-0 py-2" defaultValue="Aurelia" />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small text-uppercase tracking-wider">Contact Email</label>
                  <input type="email" className="form-control bg-light border-0 py-2" defaultValue="hello@aurelia.com" />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small text-uppercase tracking-wider">Phone Number</label>
                  <input type="text" className="form-control bg-light border-0 py-2" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small text-uppercase tracking-wider">Currency</label>
                  <select className="form-select bg-light border-0 py-2">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>VND (đ)</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small text-uppercase tracking-wider">Store Address</label>
                  <textarea className="form-control bg-light border-0 py-2" rows={3} defaultValue="123 Fashion Avenue, NY 10001, USA"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-bottom-0 p-4 pb-0">
              <h5 className="font-serif fw-bold mb-0">Payment Methods</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                <div>
                  <h6 className="mb-1 fw-bold">Credit Card (Stripe)</h6>
                  <p className="text-muted small mb-0">Accept Visa, MasterCard, Amex</p>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" defaultChecked />
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                <div>
                  <h6 className="mb-1 fw-bold">PayPal</h6>
                  <p className="text-muted small mb-0">Accept PayPal payments</p>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" defaultChecked />
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="mb-1 fw-bold">Cash on Delivery (COD)</h6>
                  <p className="text-muted small mb-0">Allow customers to pay upon delivery</p>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom-0 p-4 pb-0">
              <h5 className="font-serif fw-bold mb-0">Notifications</h5>
            </div>
            <div className="card-body p-4">
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="notif1" defaultChecked />
                <label className="form-check-label" htmlFor="notif1">
                  New Order Alerts
                </label>
              </div>
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="notif2" defaultChecked />
                <label className="form-check-label" htmlFor="notif2">
                  Low Stock Warnings
                </label>
              </div>
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="notif3" />
                <label className="form-check-label" htmlFor="notif3">
                  New Customer Registration
                </label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="notif4" defaultChecked />
                <label className="form-check-label" htmlFor="notif4">
                  Daily Summary Email
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
