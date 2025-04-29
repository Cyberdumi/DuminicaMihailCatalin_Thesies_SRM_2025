import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import supplierService from '../../services/supplierService';

function SupplierForm() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const isAddMode = !id;
  const [supplier, setSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
  
    if (!isAddMode) {
      const fetchSupplier = async () => {
        setLoading(true);
        try {
          const data = await supplierService.getById(id);
          setSupplier(data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch supplier details');
          setLoading(false);
        }
      };

      fetchSupplier();
    }
  }, [id, isAddMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplier(prevSupplier => ({
      ...prevSupplier,
      [name]: value
    }));
    

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!supplier.name) newErrors.name = 'Name is required';
    if (!supplier.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(supplier.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      if (isAddMode) {
        await supplierService.create(supplier);
      } else {
        await supplierService.update(id, supplier);
      }
      navigate(`/suppliers`);
    } catch (err) {
      setError(`Failed to ${isAddMode ? 'create' : 'update'} supplier: ${err.response?.data?.message || err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h3>{isAddMode ? 'Create Supplier' : 'Edit Supplier'}</h3>
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
                value={supplier.name}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="contactPerson" className="form-label">Contact Person</label>
              <input
                type="text"
                className="form-control"
                id="contactPerson"
                name="contactPerson"
                value={supplier.contactPerson || ''}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email*</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={supplier.email}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                value={supplier.phone || ''}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <textarea
                className="form-control"
                id="address"
                name="address"
                rows="3"
                value={supplier.address || ''}
                onChange={handleChange}
                disabled={submitting}
              ></textarea>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Link to="/suppliers" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Save Supplier'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SupplierForm;