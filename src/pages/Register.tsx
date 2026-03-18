import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5 mt-5">
      <div className="row w-100 justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card p-4 p-md-5 shadow-sm border-0 rounded-4">
            <div className="text-center mb-4">
              <h2 className="font-serif fw-bold mb-2">Create Account</h2>
              <p className="text-muted">Join the Aurelia community</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-medium text-muted">First Name</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-medium text-muted">Last Name</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium text-muted">Email Address</label>
                <input 
                  type="email" 
                  className="form-control form-control-lg" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label small fw-medium text-muted">Password</label>
                <input 
                  type="password" 
                  className="form-control form-control-lg" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-medium text-muted">Confirm Password</label>
                <input 
                  type="password" 
                  className="form-control form-control-lg" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="mb-4 form-check">
                <input type="checkbox" className="form-check-input" id="terms" required />
                <label className="form-check-label small text-muted" htmlFor="terms">
                  I agree to the <Link to="#" className="text-dark">Terms of Service</Link> and <Link to="#" className="text-dark">Privacy Policy</Link>
                </label>
              </div>
              
              <button type="submit" className="btn btn-dark btn-lg w-100 rounded-pill mb-3">Create Account</button>
              
              <div className="text-center mt-4">
                <p className="text-muted small mb-0">
                  Already have an account? <Link to="/login" className="text-dark fw-medium text-decoration-none">Sign in</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
