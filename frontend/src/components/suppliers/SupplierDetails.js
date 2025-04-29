import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import supplierService from '../../services/supplierService';
import contactService from '../../services/contactService';
import offerService from '../../services/offerService';

function SupplierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supplierData = await supplierService.getById(id);
        setSupplier(supplierData);
    
        const contactsData = await contactService.getAll(id);
        setContacts(contactsData);
        
        const offersData = await offerService.getAll({ supplierId: id });
        setOffers(offersData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching supplier details:', err);
        setError('Failed to fetch supplier details');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this supplier? This will also delete all associated contacts and offers.')) {
      try {
        await supplierService.delete(id);
        navigate('/suppliers');
      } catch (err) {
        setError('Failed to delete supplier. Check if there are any dependencies.');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!supplier) return <div className="alert alert-warning">Supplier not found</div>;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="detail-header">Supplier Details</h2>
        <div>
          <Link to={`/suppliers/${id}/edit`} className="btn btn-warning me-2">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>{supplier.name}</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Contact Person:</strong> {supplier.contactPerson || 'N/A'}</p>
              <p><strong>Email:</strong> {supplier.email}</p>
              <p><strong>Phone:</strong> {supplier.phone || 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Address:</strong> {supplier.address || 'N/A'}</p>
              <p><strong>Created:</strong> {new Date(supplier.createdAt).toLocaleDateString()}</p>
              <p><strong>Last Updated:</strong> {new Date(supplier.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Contacts</h4>
              <Link to={`/contacts/new?supplierId=${id}`} className="btn btn-sm btn-primary">Add Contact</Link>
            </div>
            <div className="card-body">
              {contacts.length === 0 ? (
                <p>No contacts found for this supplier.</p>
              ) : (
                <div className="list-group">
                  {contacts.map(contact => (
                    <Link
                      key={contact.id}
                      to={`/contacts/${contact.id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{contact.firstName} {contact.lastName}</h5>
                        <small>{contact.jobTitle || 'No title'}</small>
                      </div>
                      <p className="mb-1">{contact.email}</p>
                      <small>{contact.phone || 'No phone'}</small>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Offers</h4>
              <Link to={`/offers/new?supplierId=${id}`} className="btn btn-sm btn-primary">Add Offer</Link>
            </div>
            <div className="card-body">
              {offers.length === 0 ? (
                <p>No offers found from this supplier.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Valid Until</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map(offer => (
                        <tr key={offer.id}>
                          <td>{offer.product ? offer.product.name : 'Unknown'}</td>
                          <td>${Number(offer.price).toFixed(2)}</td>
                          <td>
                            {new Date(offer.validTo) < new Date() ? (
                              <span className="text-danger">Expired</span>
                            ) : (
                              offer.validTo
                            )}
                          </td>
                          <td>
                            <Link to={`/offers/${offer.id}`} className="btn btn-sm btn-info">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <Link to="/suppliers" className="btn btn-secondary">Back to Suppliers</Link>
      </div>
    </div>
  );
}

export default SupplierDetails;