import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import contactService from '../../services/contactService';
import supplierService from '../../services/supplierService';

function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsData, suppliersData] = await Promise.all([
          contactService.getAll(),
          supplierService.getAll()
        ]);
        setContacts(contactsData);
        setSuppliers(suppliersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch contacts');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactService.delete(id);
        setContacts(contacts.filter(contact => contact.id !== id));
      } catch (err) {
        setError('Failed to delete contact');
      }
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSupplier = selectedSupplier ? contact.supplierId === parseInt(selectedSupplier) : true;
    const matchesSearch = searchTerm ? 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.jobTitle && contact.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) : 
      true;
    
    return matchesSupplier && matchesSearch;
  });

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-header">Contacts</h2>
        <Link to="/contacts/new" className="btn btn-primary">Add New Contact</Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-5">
              <select
                className="form-select"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-secondary w-100" 
                onClick={() => {
                  setSelectedSupplier('');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="alert alert-info">
          {searchTerm || selectedSupplier ? 'No contacts match your filters.' : 'No contacts found. Add your first contact!'}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Job Title</th>
                <th>Supplier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map(contact => (
                <tr key={contact.id}>
                  <td>{contact.firstName} {contact.lastName}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone || 'N/A'}</td>
                  <td>{contact.jobTitle || 'N/A'}</td>
                  <td>
                    {contact.supplier ? (
                      <Link to={`/suppliers/${contact.supplierId}`}>{contact.supplier.name}</Link>
                    ) : (
                      'Unknown'
                    )}
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link to={`/contacts/${contact.id}`} className="btn btn-info btn-sm">View</Link>
                      <Link to={`/contacts/${contact.id}/edit`} className="btn btn-warning btn-sm">Edit</Link>
                      <button onClick={() => handleDelete(contact.id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ContactList;