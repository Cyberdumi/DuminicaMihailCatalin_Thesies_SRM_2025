import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import offerService from '../../services/offerService';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';

function OfferList() {
  const [offers, setOffers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    supplierId: '',
    productId: '',
    active: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersData, suppliersData, productsData] = await Promise.all([
          offerService.getAll(),
          supplierService.getAll(),
          productService.getAll()
        ]);
        setOffers(offersData);
        setSuppliers(suppliersData);
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch offers');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const filteredOffers = await offerService.getAll(activeFilters);
      setOffers(filteredOffers);
      setLoading(false);
    } catch (err) {
      setError('Failed to filter offers');
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    setFilters({
      supplierId: '',
      productId: '',
      active: ''
    });
    setLoading(true);
    try {
      const offersData = await offerService.getAll();
      setOffers(offersData);
      setLoading(false);
    } catch (err) {
      setError('Failed to reset filters');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await offerService.delete(id);
        setOffers(offers.filter(offer => offer.id !== id));
      } catch (err) {
        setError('Failed to delete offer');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-header">Price Offers</h2>
        <Link to="/offers/new" className="btn btn-primary">Add New Offer</Link>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Filter Offers</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="supplierId" className="form-label">Supplier</label>
              <select 
                className="form-select" 
                id="supplierId" 
                name="supplierId"
                value={filters.supplierId}
                onChange={handleFilterChange}
              >
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="productId" className="form-label">Product</label>
              <select 
                className="form-select" 
                id="productId" 
                name="productId"
                value={filters.productId}
                onChange={handleFilterChange}
              >
                <option value="">All Products</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="active" className="form-label">Status</label>
              <select 
                className="form-select" 
                id="active" 
                name="active"
                value={filters.active}
                onChange={handleFilterChange}
              >
                <option value="">All Offers</option>
                <option value="true">Active</option>
                <option value="false">Expired</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <div className="d-grid gap-2 w-100">
                <button onClick={applyFilters} className="btn btn-primary">
                  Apply Filters
                </button>
                <button onClick={resetFilters} className="btn btn-outline-secondary">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="alert alert-info">No offers found. Create your first offer!</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Product</th>
                <th>Price</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => {
                const isActive = new Date(offer.validTo) >= new Date();
                return (
                  <tr key={offer.id}>
                    <td>{offer.supplier ? offer.supplier.name : 'Unknown'}</td>
                    <td>{offer.product ? offer.product.name : 'Unknown'}</td>
                    <td>${Number(offer.price).toFixed(2)}</td>
                    <td>{new Date(offer.validFrom).toLocaleDateString()}</td>
                    <td>{new Date(offer.validTo).toLocaleDateString()}</td>
                    <td>
                      {isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Expired</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <Link to={`/offers/${offer.id}`} className="btn btn-info btn-sm">View</Link>
                        <Link to={`/offers/${offer.id}/edit`} className="btn btn-warning btn-sm">Edit</Link>
                        <button onClick={() => handleDelete(offer.id)} className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OfferList;