import React from 'react';
import { Link } from 'react-router-dom';

function Unauthorized() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-danger shadow">
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Access Denied
              </h4>
            </div>
            <div className="card-body text-center">
              <div className="mb-4">
                <i className="bi bi-lock-fill text-danger" style={{ fontSize: '5rem' }}></i>
              </div>
              
              <h5 className="mb-3">You don't have permission to access this page.</h5>
              
              <p className="text-muted mb-4">
                Your user account doesn't have the necessary permissions to view this resource. 
                If you believe this is an error, please contact your system administrator.
              </p>
              
              <div className="d-grid gap-2">
                <Link to="/" className="btn btn-primary">
                  <i className="bi bi-house-fill me-2"></i>
                  Return to Dashboard
                </Link>
                <button 
                  onClick={() => window.history.back()} 
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;