import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';
import offerService from '../../services/offerService';
import contactService from '../../services/contactService';

function Dashboard() {
  const [stats, setStats] = useState({
    suppliers: 0,
    products: 0,
    contacts: 0,
    offers: 0,
    activeOffers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const suppliers = await supplierService.getAll();
        const products = await productService.getAll();
        const contacts = await contactService.getAll();
        const allOffers = await offerService.getAll();
        
        const today = new Date().toISOString().split('T')[0];
        const activeOffers = allOffers.filter(offer => offer.validTo >= today);
        
        setStats({
          suppliers: suppliers.length,
          products: products.length,
          contacts: contacts.length,
          offers: allOffers.length,
          activeOffers: activeOffers.length,
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="page-header">Supplier Relationship Management Dashboard</h1>
          <p className="lead">Welcome to your SRM solution. Get an overview of your suppliers and manage your relationships effectively.</p>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card stats-card h-100">
            <div className="card-body">
              <h5 className="card-title">Suppliers</h5>
              <h2 className="display-4">{stats.suppliers}</h2>
              <Link to="/suppliers" className="btn btn-sm btn-outline-primary mt-2">View All</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stats-card h-100">
            <div className="card-body">
              <h5 className="card-title">Products</h5>
              <h2 className="display-4">{stats.products}</h2>
              <Link to="/products" className="btn btn-sm btn-outline-primary mt-2">View All</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stats-card h-100">
            <div className="card-body">
              <h5 className="card-title">Contacts</h5>
              <h2 className="display-4">{stats.contacts}</h2>
              <Link to="/contacts" className="btn btn-sm btn-outline-primary mt-2">View All</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stats-card h-100">
            <div className="card-body">
              <h5 className="card-title">Active Offers</h5>
              <h2 className="display-4">{stats.activeOffers}</h2>
              <p className="text-muted">of {stats.offers} total</p>
              <Link to="/offers" className="btn btn-sm btn-outline-primary mt-2">View All</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">Quick Actions</div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/suppliers/new" className="btn btn-primary">Add New Supplier</Link>
                <Link to="/products/new" className="btn btn-outline-primary">Add New Product</Link>
                <Link to="/offers/new" className="btn btn-outline-primary">Create New Offer</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">System Information</div>
            <div className="card-body">
              <p><strong>System:</strong> Supplier Relationship Manager</p>
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              <p className="mb-0"><strong>Status:</strong> <span className="badge bg-success">Online</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;