import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import contactService from '../../services/contactService';
import supplierService from '../../services/supplierService';

function ContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactData = await contactService.getById(id);
        setContact(contactData);
        
        if (contactData.supplierId) {
          try {
            const supplierData = await supplierService.getById(contactData.supplierId);
            setSupplier(supplierData);
          } catch (supplierErr) {
            console.error('Error fetching supplier:', supplierErr);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contact details:', err);
        setError('Failed to fetch contact details');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactService.delete(id);
        navigate('/contacts');
      } catch (err) {
        setError('Failed to delete contact');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!contact) return <div className="alert alert-warning">Contact not found</div>;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="detail-header">Contact Details</h2>
        <div>
          <Link to={`/contacts/${id}/edit`} className="btn btn-warning me-2">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>{contact.firstName} {contact.lastName}</h3>
          {contact.jobTitle && <div className="text-muted">{contact.jobTitle}</div>}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
              <p><strong>Phone:</strong> {contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Supplier:</strong> {supplier ? (
                  <Link to={`/suppliers/${supplier.id}`}>{supplier.name}</Link>
                ) : 'Unknown'}
              </p>
              <p><strong>Added on:</strong> {new Date(contact.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      {supplier && (
        <div className="card mb-4">
          <div className="card-header">
            <h4>Supplier Information</h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Company:</strong> {supplier.name}</p>
                <p><strong>Main Contact Person:</strong> {supplier.contactPerson || 'N/A'}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Email:</strong> <a href={`mailto:${supplier.email}`}>{supplier.email}</a></p>
                <p><strong>Phone:</strong> {supplier.phone ? <a href={`tel:${supplier.phone}`}>{supplier.phone}</a> : 'N/A'}</p>
              </div>
            </div>
            <Link to={`/suppliers/${supplier.id}`} className="btn btn-sm btn-outline-primary mt-2">View Supplier Details</Link>
          </div>
        </div>
      )}
      
      <div className="mt-3">
        <Link to="/contacts" className="btn btn-secondary">Back to Contacts</Link>
      </div>
    </div>
  );
}

export default ContactDetails;