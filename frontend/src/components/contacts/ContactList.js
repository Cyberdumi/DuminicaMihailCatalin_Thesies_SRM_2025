import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Layers, 
  BarChart2,
  FileText,
  Users,
  UserPlus,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import contactService from '../../services/contactService';
import supplierService from '../../services/supplierService';

function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedContact, setSelectedContact] = useState(null);
  const [sortBy, setSortBy] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const getRandomPastelColor = (name) => {
    const colors = [
      'bg-primary bg-opacity-25', 'bg-success bg-opacity-25', 
      'bg-info bg-opacity-25', 'bg-warning bg-opacity-25', 
      'bg-danger bg-opacity-25', 'bg-secondary bg-opacity-25'
    ];
    
    const firstChar = (name || '').charAt(0).toLowerCase();
    const index = firstChar.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  const getInitials = (firstName, lastName) => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  };

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
        if (selectedContact && selectedContact.id === id) {
          setSelectedContact(null);
        }
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

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'firstName':
        aValue = a.firstName || '';
        bValue = b.firstName || '';
        break;
      case 'lastName':
        aValue = a.lastName || '';
        bValue = b.lastName || '';
        break;
      case 'email':
        aValue = a.email || '';
        bValue = b.email || '';
        break;
      case 'jobTitle':
        aValue = a.jobTitle || '';
        bValue = b.jobTitle || '';
        break;
      case 'supplierName':
        aValue = a.supplier ? a.supplier.name : '';
        bValue = b.supplier ? b.supplier.name : '';
        break;
      default:
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
    }
    
    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });
  
  const exportData = contacts.map(contact => ({
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone || 'N/A',
    jobTitle: contact.jobTitle || 'N/A',
    supplier: contact.supplier ? contact.supplier.name : 'Unknown',
    supplierEmail: contact.supplier ? contact.supplier.email : 'N/A',
    supplierPhone: contact.supplier ? contact.supplier.phone : 'N/A'
  }));
  
  const csvHeaders = [
    { label: "ID", key: "id" },
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Job Title", key: "jobTitle" },
    { label: "Supplier", key: "supplier" },
    { label: "Supplier Email", key: "supplierEmail" },
    { label: "Supplier Phone", key: "supplierPhone" }
  ];
  
  const ContactCard = ({ contact }) => {
    const avatarClass = getRandomPastelColor(`${contact.firstName} ${contact.lastName}`);
    const initials = getInitials(contact.firstName, contact.lastName);
    
    return (
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${avatarClass}`} style={{ width: "50px", height: "50px" }}>
              <span className="fw-bold">{initials}</span>
            </div>
            <div>
              <h5 className="card-title mb-0">{contact.firstName} {contact.lastName}</h5>
              <p className="text-muted mb-0 small">{contact.jobTitle || 'No job title'}</p>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <Mail size={16} className="text-muted me-2" />
              <a href={`mailto:${contact.email}`} className="text-decoration-none text-truncate">
                {contact.email}
              </a>
            </div>
            {contact.phone && (
              <div className="d-flex align-items-center mb-2">
                <Phone size={16} className="text-muted me-2" />
                <a href={`tel:${contact.phone}`} className="text-decoration-none">
                  {contact.phone}
                </a>
              </div>
            )}
            <div className="d-flex align-items-center">
              <Building2 size={16} className="text-muted me-2" />
              <span className="text-truncate">
                {contact.supplier ? contact.supplier.name : 'Unknown supplier'}
              </span>
            </div>
          </div>
          
          <div className="d-flex justify-content-end mt-auto pt-3 border-top">
            <button 
              onClick={() => setSelectedContact(contact)} 
              className="btn btn-sm btn-outline-primary me-2"
            >
              <Eye size={16} />
            </button>
            <Link 
              to={`/contacts/${contact.id}/edit`} 
              className="btn btn-sm btn-outline-secondary me-2"
            >
              <Edit size={16} />
            </Link>
            <button 
              onClick={() => handleDelete(contact.id)} 
              className="btn btn-sm btn-outline-danger"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="fade-in">
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div className="mb-3 mb-md-0">
              <h2 className="mb-1">Contact Management</h2>
              <p className="text-muted mb-0">Manage supplier contacts and key personnel</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <CSVLink 
                data={exportData} 
                headers={csvHeaders} 
                filename={`contacts-export-${new Date().toISOString().split('T')[0]}.csv`}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
              >
                <Download size={16} />
                <span>Export</span>
              </CSVLink>
              <Link to="/contacts/new" className="btn btn-primary d-flex align-items-center gap-2">
                <UserPlus size={16} />
                <span>Add Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search contacts by name, email, job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-4">
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
            <div className="col-md-3 d-flex gap-2">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setSelectedSupplier('');
                  setSearchTerm('');
                }}
              >
                <Filter size={16} className="me-1" />
                Clear
              </button>
              
              <div className="btn-group ms-auto">
                <button
                  onClick={() => setViewMode('table')}
                  className={`btn btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
                >
                  <BarChart2 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <Layers size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {showFilterPanel && (
            <div className="row mt-3 pt-3 border-top">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Advanced Filters</h6>
                  <button 
                    className="btn btn-sm btn-link p-0" 
                    onClick={() => setShowFilterPanel(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="row g-3 mt-2">
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted small mb-0">
            Showing {sortedContacts.length} of {contacts.length} contacts
          </p>
          
          <select 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
          >
            <option value="lastName-asc">Last Name (A-Z)</option>
            <option value="lastName-desc">Last Name (Z-A)</option>
            <option value="firstName-asc">First Name (A-Z)</option>
            <option value="firstName-desc">First Name (Z-A)</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="jobTitle-asc">Job Title (A-Z)</option>
            <option value="supplierName-asc">Supplier (A-Z)</option>
          </select>
        </div>

        {sortedContacts.length === 0 ? (
          <div className="alert alert-info">
            {searchTerm || selectedSupplier ? 'No contacts match your filters.' : 'No contacts found. Add your first contact!'}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {sortedContacts.map(contact => (
              <div key={contact.id} className="col">
                <ContactCard contact={contact} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Job Title</th>
                    <th>Supplier</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedContacts.map(contact => {
                    const avatarClass = getRandomPastelColor(`${contact.firstName} ${contact.lastName}`);
                    const initials = getInitials(contact.firstName, contact.lastName);
                    
                    return (
                      <tr key={contact.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${avatarClass}`} style={{ width: "40px", height: "40px" }}>
                              <span className="fw-bold">{initials}</span>
                            </div>
                            <div>
                              <div className="fw-medium">{contact.firstName} {contact.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <a href={`mailto:${contact.email}`} className="text-decoration-none">
                            {contact.email}
                          </a>
                        </td>
                        <td>
                          {contact.phone ? (
                            <a href={`tel:${contact.phone}`} className="text-decoration-none">
                              {contact.phone}
                            </a>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>{contact.jobTitle || <span className="text-muted">N/A</span>}</td>
                        <td>
                          {contact.supplier ? (
                            <Link to={`/suppliers/${contact.supplierId}`} className="text-decoration-none d-flex align-items-center">
                              <Building2 size={16} className="text-muted me-2" />
                              <span>{contact.supplier.name}</span>
                            </Link>
                          ) : (
                            <span className="text-muted">Unknown</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              onClick={() => setSelectedContact(contact)} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              <Eye size={14} />
                            </button>
                            <Link 
                              to={`/contacts/${contact.id}/edit`} 
                              className="btn btn-sm btn-outline-secondary"
                            >
                              <Edit size={14} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(contact.id)} 
                              className="btn btn-sm btn-outline-danger"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedContact && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contact Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedContact(null)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div 
                    className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 ${getRandomPastelColor(`${selectedContact.firstName} ${selectedContact.lastName}`)}`} 
                    style={{ width: "80px", height: "80px" }}
                  >
                    <span className="fw-bold fs-3">{getInitials(selectedContact.firstName, selectedContact.lastName)}</span>
                  </div>
                  <h4>{selectedContact.firstName} {selectedContact.lastName}</h4>
                  <p className="text-muted mb-0">{selectedContact.jobTitle || 'No job title'}</p>
                </div>
                
                <div className="card border-0 bg-light mb-3">
                  <div className="card-body">
                    <h6 className="card-title text-muted mb-3">Contact Information</h6>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-white p-2 rounded-circle me-3">
                        <Mail size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="small text-muted">Email</div>
                        <a href={`mailto:${selectedContact.email}`} className="text-decoration-none fw-medium">
                          {selectedContact.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-white p-2 rounded-circle me-3">
                        <Phone size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="small text-muted">Phone</div>
                        {selectedContact.phone ? (
                          <a href={`tel:${selectedContact.phone}`} className="text-decoration-none fw-medium">
                            {selectedContact.phone}
                          </a>
                        ) : (
                          <span className="text-muted">Not provided</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center">
                      <div className="bg-white p-2 rounded-circle me-3">
                        <Briefcase size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="small text-muted">Job Title</div>
                        <span className="fw-medium">
                          {selectedContact.jobTitle || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedContact.supplier && (
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <h6 className="card-title text-muted mb-3">Company Information</h6>
                      
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-white p-2 rounded-circle me-3">
                          <Building2 size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="small text-muted">Supplier</div>
                          <span className="fw-medium">
                            {selectedContact.supplier.name}
                          </span>
                        </div>
                      </div>
                      
                      {selectedContact.supplier.email && (
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-white p-2 rounded-circle me-3">
                            <Mail size={20} className="text-primary" />
                          </div>
                          <div>
                            <div className="small text-muted">Company Email</div>
                            <a href={`mailto:${selectedContact.supplier.email}`} className="text-decoration-none fw-medium">
                              {selectedContact.supplier.email}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {selectedContact.supplier.phone && (
                        <div className="d-flex align-items-center">
                          <div className="bg-white p-2 rounded-circle me-3">
                            <Phone size={20} className="text-primary" />
                          </div>
                          <div>
                            <div className="small text-muted">Company Phone</div>
                            <a href={`tel:${selectedContact.supplier.phone}`} className="text-decoration-none fw-medium">
                              {selectedContact.supplier.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedContact(null)}>Close</button>
                <Link to={`/contacts/${selectedContact.id}/edit`} className="btn btn-primary">
                  <Edit size={16} className="me-2" />
                  Edit Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setSelectedContact(null)}></div>
        </div>
      )}
    </div>
  );
}

export default ContactList;