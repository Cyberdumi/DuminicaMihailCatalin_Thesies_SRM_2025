import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import offerService from '../../services/offerService';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';

function OfferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedSupplierId = queryParams.get('supplierId');
  const preselectedProductId = queryParams.get('productId');
  
  const isAddMode = !id;
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthDate = nextMonth.toISOString().split('T')[0];
  
  const [offer, setOffer] = useState({
    price: '',
    validFrom: today,
    validTo: nextMonthDate,
    quantity: '',
    notes: '',
    supplierId: preselectedSupplierId || '',
    productId: preselectedProductId || ''
  });
  
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await supplierService.getAll();
        setSuppliers(data);
      } catch (err) {
        setError('Failed to load suppliers');
      }
    };

    const fetchProducts = async () => {
      try {
        const data = await productService.getAll();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
      }
    };

    const fetchOffer = async () => {
      if (!isAddMode) {
        setLoading(true);
        try {
          const data = await offerService.getById(id);
          data.validFrom = data.validFrom.split('T')[0];
          data.validTo = data.validTo.split('T')[0];
          setOffer(data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch offer details');
          setLoading(false);
        }
      }
    };

    fetchSuppliers();
    fetchProducts();
    fetchOffer();
  }, [id, isAddMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffer(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!offer.price) newErrors.price = 'Price is required';
    if (isNaN(parseFloat(offer.price)) || parseFloat(offer.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!offer.validFrom) newErrors.validFrom = 'Valid from date is required';
    if (!offer.validTo) newErrors.validTo = 'Valid to date is required';
    
    if (new Date(offer.validTo) < new Date(offer.validFrom)) {
      newErrors.validTo = 'Valid to date must be after valid from date';
    }
    
    if (offer.quantity && (isNaN(parseInt(offer.quantity)) || parseInt(offer.quantity) <= 0)) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    if (!offer.supplierId) newErrors.supplierId = 'Supplier is required';
    if (!offer.productId) newErrors.productId = 'Product is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      if (isAddMode) {
        await offerService.create(offer);
      } else {
        await offerService.update(id, offer);
      }
      navigate('/offers');
    } catch (err) {
      setError(`Failed to ${isAddMode ? 'create' : 'update'} offer: ${err.response?.data?.message || err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h3>{isAddMode ? 'Create Offer' : 'Edit Offer'}</h3>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="supplierId" className="form-label">Supplier*</label>
                <select
                  className={`form-select ${errors.supplierId ? 'is-invalid' : ''}`}
                  id="supplierId"
                  name="supplierId"
                  value={offer.supplierId}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.supplierId && <div className="invalid-feedback">{errors.supplierId}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="productId" className="form-label">Product*</label>
                <select
                  className={`form-select ${errors.productId ? 'is-invalid' : ''}`}
                  id="productId"
                  name="productId"
                  value={offer.productId}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {errors.productId && <div className="invalid-feedback">{errors.productId}</div>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="price" className="form-label">Price*</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    id="price"
                    name="price"
                    value={offer.price}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="quantity" className="form-label">Quantity (Optional)</label>
                <input
                  type="number"
                  min="1"
                  className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                  id="quantity"
                  name="quantity"
                  value={offer.quantity}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="validFrom" className="form-label">Valid From*</label>
                <input
                  type="date"
                  className={`form-control ${errors.validFrom ? 'is-invalid' : ''}`}
                  id="validFrom"
                  name="validFrom"
                  value={offer.validFrom}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.validFrom && <div className="invalid-feedback">{errors.validFrom}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="validTo" className="form-label">Valid To*</label>
                <input
                  type="date"
                  className={`form-control ${errors.validTo ? 'is-invalid' : ''}`}
                  id="validTo"
                  name="validTo"
                  value={offer.validTo}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.validTo && <div className="invalid-feedback">{errors.validTo}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                className="form-control"
                id="notes"
                name="notes"
                rows="3"
                value={offer.notes || ''}
                onChange={handleChange}
                disabled={submitting}
              ></textarea>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Link to="/offers" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Save Offer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OfferForm;