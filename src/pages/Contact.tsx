import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const Contact = () => {
  return (
    <div className="container py-5 mt-5 min-vh-100">
      <div className="text-center mb-5">
        <h1 className="display-4 font-serif fw-bold mb-3">Get in Touch</h1>
        <p className="text-muted lead">We'd love to hear from you. Please fill out the form below.</p>
      </div>

      <div className="row g-5">
        <div className="col-lg-5">
          <div className="card p-4 p-md-5 h-100 bg-light border-0">
            <h3 className="font-serif fw-bold mb-4">Contact Information</h3>
            <p className="text-muted mb-5">Our customer service team is available Monday through Friday, 9am to 5pm EST.</p>
            
            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-start gap-3">
                <div className="bg-white p-3 rounded-circle shadow-sm text-dark">
                  <MapPin size={24} />
                </div>
                <div>
                  <h5 className="font-serif fw-bold mb-1">Our Studio</h5>
                  <p className="text-muted mb-0">123 Fashion Avenue<br />New York, NY 10001</p>
                </div>
              </div>
              
              <div className="d-flex align-items-start gap-3">
                <div className="bg-white p-3 rounded-circle shadow-sm text-dark">
                  <Phone size={24} />
                </div>
                <div>
                  <h5 className="font-serif fw-bold mb-1">Phone</h5>
                  <p className="text-muted mb-0">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="d-flex align-items-start gap-3">
                <div className="bg-white p-3 rounded-circle shadow-sm text-dark">
                  <Mail size={24} />
                </div>
                <div>
                  <h5 className="font-serif fw-bold mb-1">Email</h5>
                  <p className="text-muted mb-0">hello@aurelia.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-7">
          <div className="card p-4 p-md-5 h-100 border-0 shadow-sm">
            <h3 className="font-serif fw-bold mb-4">Send a Message</h3>
            <form>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-medium text-muted">First Name</label>
                  <input type="text" className="form-control form-control-lg" placeholder="Jane" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium text-muted">Last Name</label>
                  <input type="text" className="form-control form-control-lg" placeholder="Doe" required />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium text-muted">Email Address</label>
                  <input type="email" className="form-control form-control-lg" placeholder="jane@example.com" required />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium text-muted">Subject</label>
                  <input type="text" className="form-control form-control-lg" placeholder="How can we help?" required />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium text-muted">Message</label>
                  <textarea className="form-control form-control-lg" rows={5} placeholder="Your message here..." required></textarea>
                </div>
              </div>
              <button type="submit" className="btn btn-dark btn-lg rounded-pill px-5">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
