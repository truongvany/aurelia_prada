import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card p-4 p-md-5 shadow-sm border-0 rounded-4">
            <div className="text-center mb-4">
              <h2 className="font-serif fw-bold mb-2">Welcome Back</h2>
              <p className="text-muted">Sign in to your Aurelia account</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-medium text-muted">Email Address</label>
                <input 
                  type="email" 
                  className="form-control form-control-lg" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  placeholder="name@example.com"
                />
              </div>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-medium text-muted mb-0">Password</label>
                  <Link to="#" className="small text-decoration-none text-muted">Forgot password?</Link>
                </div>
                <input 
                  type="password" 
                  className="form-control form-control-lg" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mb-4 form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label small text-muted" htmlFor="rememberMe">Remember me</label>
              </div>
              
              <button type="submit" className="btn btn-dark btn-lg w-100 rounded-pill mb-3">Sign In</button>
              
              <div className="text-center mt-4">
                <p className="text-muted small mb-0">
                  Don't have an account? <Link to="/register" className="text-dark fw-medium text-decoration-none">Create one</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
