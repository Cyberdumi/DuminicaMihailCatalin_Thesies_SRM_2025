import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import contactService from '../../services/contactService';
import supplierService from '../../services/supplierService';

function ContactForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedSupplierId = queryParams.get('supplierId');
  
  const isAddMode = !id;
  
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    supplierId: preselectedSupplierId || ''
  });
  
  const [suppliers, setSuppliers] = useState([]);
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

    const fetchContact = async () => {
      if (!isAddMode) {
        setLoading(true);
        try {
          const data = await contactService.getById(id);
          setContact(data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch contact details');
          setLoading(false);
        }
      }
    };

    fetchSuppliers();
    fetchContact();
  }, [id, isAddMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact(prevContact => ({
      ...prevContact,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!contact.firstName) newErrors.firstName = 'First name is required';
    if (!contact.lastName) newErrors.lastName = 'Last name is required';
    
    if (!contact.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(contact.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!contact.supplierId) newErrors.supplierId = 'Supplier is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      if (isAddMode) {
        await contactService.create(contact);
      } else {
        await contactService.update(id, contact);
      }
      navigate(contact.supplierId ? `/suppliers/${contact.supplierId}` : '/contacts');
    } catch (err) {
      setError(`Failed to ${isAddMode ? 'create' : 'update'} contact: ${err.response?.data?.message || err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h3>{isAddMode ? 'Create Contact' : 'Edit Contact'}</h3>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName" className="form-label">First Name*</label>
                <input
                  type="text"
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                  id="firstName"
                  name="firstName"
                  value={contact.firstName}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="lastName" className="form-label">Last Name*</label>
                <input
                  type="text"
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                  id="lastName"
                  name="lastName"
                  value={contact.lastName}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email*</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={contact.email}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={contact.phone || ''}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="jobTitle" className="form-label">Job Title</label>
              <input
                type="text"
                className="form-control"
                id="jobTitle"
                name="jobTitle"
                value={contact.jobTitle || ''}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="supplierId" className="form-label">Supplier*</label>
              <select
                className={`form-select ${errors.supplierId ? 'is-invalid' : ''}`}
                id="supplierId"
                name="supplierId"
                value={contact.supplierId}
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

            <div className="d-flex justify-content-between mt-4">
              <Link to="/contacts" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Save Contact'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;