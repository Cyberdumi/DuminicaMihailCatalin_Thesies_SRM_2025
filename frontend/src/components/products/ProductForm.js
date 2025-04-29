import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../../services/productService';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAddMode = !id;
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    unitOfMeasure: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAddMode) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const data = await productService.getById(id);
          setProduct(data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch product details');
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isAddMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!product.name) newErrors.name = 'Name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      if (isAddMode) {
        await productService.create(product);
      } else {
        await productService.update(id, product);
      }
      navigate(`/products`);
    } catch (err) {
      setError(`Failed to ${isAddMode ? 'create' : 'update'} product: ${err.response?.data?.message || err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h3>{isAddMode ? 'Create Product' : 'Edit Product'}</h3>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name*</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="3"
                value={product.description || ''}
                onChange={handleChange}
                disabled={submitting}
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                id="category"
                name="category"
                value={product.category || ''}
                onChange={handleChange}
                disabled={submitting}
              />
              <div className="form-text">Example: Electronics, Office Supplies, Raw Materials, etc.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="unitOfMeasure" className="form-label">Unit of Measure</label>
              <input
                type="text"
                className="form-control"
                id="unitOfMeasure"
                name="unitOfMeasure"
                value={product.unitOfMeasure || ''}
                onChange={handleChange}
                disabled={submitting}
              />
              <div className="form-text">Example: Each, Kilogram, Liter, Box, etc.</div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Link to="/products" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Save Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;