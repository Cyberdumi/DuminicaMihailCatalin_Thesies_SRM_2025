import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import {  Search, Plus,  Filter,  Download,  Building2,  Mail, Phone,  MapPin,  Edit, Trash2, Eye,  X,  Layers, BarChart2,FileText,Users,User,Star,Package,FileSpreadsheet,TrendingUp,Globe,ChevronRight,ExternalLink} from 'lucide-react';
import supplierService from '../../services/supplierService';
import contactService from '../../services/contactService';
import offerService from '../../services/offerService';

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    hasOffers: '',
    hasContacts: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, contactsData, offersData] = await Promise.all([
          supplierService.getAll(),
          contactService.getAll(),
          offerService.getAll()
        ]);
        setSuppliers(suppliersData);
        setContacts(contactsData);
        setOffers(offersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch suppliers');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierService.delete(id);
        setSuppliers(suppliers.filter(supplier => supplier.id !== id));
        if (selectedSupplier && selectedSupplier.id === id) {
          setSelectedSupplier(null);
        }
      } catch (err) {
        setError('Failed to delete supplier. It may have associated contacts or offers.');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      hasOffers: '',
      hasContacts: ''
    });
    setSearchTerm('');
  };

  
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = searchTerm ? 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.address && supplier.address.toLowerCase().includes(searchTerm.toLowerCase())) : 
      true;
    const matchesLocation = filters.location ? 
      supplier.address && supplier.address.toLowerCase().includes(filters.location.toLowerCase()) : 
      true;
    
    const hasContacts = contacts.some(contact => contact.supplierId === supplier.id);
    const matchesHasContacts = filters.hasContacts === '' ? 
      true : 
      (filters.hasContacts === 'yes' ? hasContacts : !hasContacts);
    
    const hasActiveOffers = offers.some(
      offer => offer.supplierId === supplier.id && new Date(offer.validTo) >= new Date()
    );
    const matchesHasOffers = filters.hasOffers === '' ? 
      true : 
      (filters.hasOffers === 'yes' ? hasActiveOffers : !hasActiveOffers);
    
    return matchesSearch && matchesLocation && matchesHasContacts && matchesHasOffers;
  });

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';
    
    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });
  
  const exportData = suppliers.map(supplier => ({
    id: supplier.id,
    name: supplier.name,
    email: supplier.email || 'N/A',
    phone: supplier.phone || 'N/A',
    address: supplier.address || 'N/A',
    contactCount: contacts.filter(contact => contact.supplierId === supplier.id).length,
    activeOfferCount: offers.filter(
      offer => offer.supplierId === supplier.id && new Date(offer.validTo) >= new Date()
    ).length
  }));
  
  const csvHeaders = [
    { label: "ID", key: "id" },
    { label: "Company Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Address", key: "address" },
    { label: "Number of Contacts", key: "contactCount" },
    { label: "Active Offers", key: "activeOfferCount" }
  ];

  const getContactCount = (supplierId) => {
    return contacts.filter(contact => contact.supplierId === supplierId).length;
  };
  
  const getOfferCount = (supplierId) => {
    const supplierOffers = offers.filter(offer => offer.supplierId === supplierId);
    const activeOffers = supplierOffers.filter(offer => new Date(offer.validTo) >= new Date());
    
    return {
      total: supplierOffers.length,
      active: activeOffers.length
    };
  };

  const getSupplierRating = (supplierId) => {
    const offerCount = getOfferCount(supplierId).total;
    const contactCount = getContactCount(supplierId);
    const score = (offerCount * 0.7) + (contactCount * 0.3);
    
    if (score > 10) return 5;
    if (score > 7) return 4.5;
    if (score > 5) return 4;
    if (score > 3) return 3.5;
    if (score > 0) return 3;
    return 2.5;
  };

  const extractLocation = (address) => {
    if (!address) return 'Unknown';
    const parts = address.split(',');
    if (parts.length > 1) {
      return parts[parts.length - 2].trim();
    }
    return parts[0].trim();
  };
  const SupplierCard = ({ supplier }) => {
    const contactCount = getContactCount(supplier.id);
    const offerCounts = getOfferCount(supplier.id);
    const rating = getSupplierRating(supplier.id);
    
    return (
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="card-title mb-0">{supplier.name}</h5>
            <div className="d-flex align-items-center">
              <Star className="text-warning me-1" size={16} />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="mb-3">
            {supplier.email && (
              <div className="d-flex align-items-center mb-2">
                <Mail size={16} className="text-muted me-2" />
                <a href={`mailto:${supplier.email}`} className="text-decoration-none text-truncate">
                  {supplier.email}
                </a>
              </div>
            )}
            {supplier.phone && (
              <div className="d-flex align-items-center mb-2">
                <Phone size={16} className="text-muted me-2" />
                <a href={`tel:${supplier.phone}`} className="text-decoration-none">
                  {supplier.phone}
                </a>
              </div>
            )}
            {supplier.address && (
              <div className="d-flex align-items-center">
                <MapPin size={16} className="text-muted me-2" />
                <span className="text-truncate">
                  {supplier.address}
                </span>
              </div>
            )}
          </div>
          
          <div className="row g-2 mb-3">
            <div className="col-6">
              <div className="card bg-light border-0">
                <div className="card-body p-2 text-center">
                  <div className="d-flex justify-content-center mb-1">
                    <Users size={16} className="text-primary" />
                  </div>
                  <div className="fw-bold">{contactCount}</div>
                  <small className="text-muted">Contacts</small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-light border-0">
                <div className="card-body p-2 text-center">
                  <div className="d-flex justify-content-center mb-1">
                    <Package size={16} className="text-primary" />
                  </div>
                  <div className="fw-bold">{offerCounts.active}</div>
                  <small className="text-muted">Active Offers</small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-end mt-auto pt-3 border-top">
            <button 
              onClick={() => setSelectedSupplier(supplier)} 
              className="btn btn-sm btn-outline-primary me-2"
            >
              <Eye size={16} />
            </button>
            <Link 
              to={`/suppliers/${supplier.id}/edit`} 
              className="btn btn-sm btn-outline-secondary me-2"
            >
              <Edit size={16} />
            </Link>
            <button 
              onClick={() => handleDelete(supplier.id)} 
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
              <h2 className="mb-1">Supplier Management</h2>
              <p className="text-muted mb-0">Manage your suppliers and vendor relationships</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <CSVLink 
                data={exportData} 
                headers={csvHeaders} 
                filename={`suppliers-export-${new Date().toISOString().split('T')[0]}.csv`}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
              >
                <Download size={16} />
                <span>Export</span>
              </CSVLink>
              <Link to="/suppliers/new" className="btn btn-primary d-flex align-items-center gap-2">
                <Plus size={16} />
                <span>Add Supplier</span>
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
                  placeholder="Search suppliers by name, email, address..."
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
            
            <div className="col-md-5">
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-secondary d-flex align-items-center gap-1"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                >
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
                
                {(searchTerm || Object.values(filters).some(val => val !== '')) && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={resetFilters}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            <div className="col-md-2 d-flex justify-content-end">
              <div className="btn-group">
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
            <div className="row mt-3 pt-3 border-top g-3">
              <div className="col-md-4">
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  placeholder="City, state, country..."
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="hasContacts" className="form-label">Has Contacts</label>
                <select
                  className="form-select"
                  id="hasContacts"
                  name="hasContacts"
                  value={filters.hasContacts}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="hasOffers" className="form-label">Has Active Offers</label>
                <select
                  className="form-select"
                  id="hasOffers"
                  name="hasOffers"
                  value={filters.hasOffers}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted small mb-0">
            Showing {sortedSuppliers.length} of {suppliers.length} suppliers
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
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>

        {sortedSuppliers.length === 0 ? (
          <div className="alert alert-info">
            {searchTerm || Object.values(filters).some(val => val !== '') ? 
              'No suppliers match your filters.' : 
              'No suppliers found. Add your first supplier!'}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {sortedSuppliers.map(supplier => (
              <div key={supplier.id} className="col">
                <SupplierCard supplier={supplier} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Supplier</th>
                    <th>Contact Info</th>
                    <th>Location</th>
                    <th>Contacts</th>
                    <th>Offers</th>
                    <th>Rating</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSuppliers.map(supplier => {
                    const contactCount = getContactCount(supplier.id);
                    const offerCounts = getOfferCount(supplier.id);
                    const rating = getSupplierRating(supplier.id);
                    
                    return (
                      <tr key={supplier.id}>
                        <td>
                          <div className="fw-medium">{supplier.name}</div>
                        </td>
                        <td>
                          <div className="small">
                            {supplier.email && (
                              <div className="mb-1">
                                <a href={`mailto:${supplier.email}`} className="text-decoration-none d-flex align-items-center">
                                  <Mail size={14} className="text-muted me-1" />
                                  <span>{supplier.email}</span>
                                </a>
                              </div>
                            )}
                            {supplier.phone && (
                              <div>
                                <a href={`tel:${supplier.phone}`} className="text-decoration-none d-flex align-items-center">
                                  <Phone size={14} className="text-muted me-1" />
                                  <span>{supplier.phone}</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {supplier.address ? (
                            <div className="d-flex align-items-center">
                              <MapPin size={14} className="text-muted me-1" />
                              <span>{extractLocation(supplier.address)}</span>
                            </div>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          <Link to={`/contacts?supplierId=${supplier.id}`} className="text-decoration-none d-flex align-items-center">
                            <Users size={14} className="text-primary me-1" />
                            <span className="fw-medium">{contactCount}</span>
                          </Link>
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <Link to={`/offers?supplierId=${supplier.id}`} className="text-decoration-none d-flex align-items-center">
                              <Package size={14} className="text-primary me-1" />
                              <span className="fw-medium">{offerCounts.active}</span>
                              <small className="text-muted ms-1">active</small>
                            </Link>
                            <small className="text-muted">{offerCounts.total} total</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Star className="text-warning me-1" size={14} />
                            <span>{rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              onClick={() => setSelectedSupplier(supplier)} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              <Eye size={14} />
                            </button>
                            <Link 
                              to={`/suppliers/${supplier.id}/edit`} 
                              className="btn btn-sm btn-outline-secondary"
                            >
                              <Edit size={14} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(supplier.id)} 
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
      {selectedSupplier && (
  <div className="supplier-detail-overlay" onClick={() => setSelectedSupplier(null)}>
    <div 
      className="supplier-detail-modal"
      onClick={e => e.stopPropagation()} 
    >
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{selectedSupplier.name}</h5>
          <button type="button" className="btn-close" onClick={() => setSelectedSupplier(null)}></button>
        </div>
        <div className="modal-body">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card bg-light border-0 h-100">
                <div className="card-body">
                  <h6 className="card-title text-muted mb-3">Company Information</h6>
                  
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-white p-2 rounded-circle me-3">
                      <Building2 size={24} className="text-primary" />
                    </div>
                    <div>
                      <h5 className="mb-0">{selectedSupplier.name}</h5>
                    </div>
                  </div>
                  
                  <div className="list-group list-group-flush bg-transparent mb-3">
                    {selectedSupplier.email && (
                      <div className="list-group-item bg-transparent px-0 py-2 d-flex align-items-center">
                        <Mail size={18} className="text-primary me-3" />
                        <div>
                          <div className="small text-muted">Email</div>
                          <a href={`mailto:${selectedSupplier.email}`} className="text-decoration-none">
                            {selectedSupplier.email}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {selectedSupplier.phone && (
                      <div className="list-group-item bg-transparent px-0 py-2 d-flex align-items-center">
                        <Phone size={18} className="text-primary me-3" />
                        <div>
                          <div className="small text-muted">Phone</div>
                          <a href={`tel:${selectedSupplier.phone}`} className="text-decoration-none">
                            {selectedSupplier.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {selectedSupplier.address && (
                      <div className="list-group-item bg-transparent px-0 py-2 d-flex align-items-center">
                        <MapPin size={18} className="text-primary me-3" />
                        <div>
                          <div className="small text-muted">Address</div>
                          <div>{selectedSupplier.address}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedSupplier.website && (
                    <a 
                      href={selectedSupplier.website.startsWith('http') ? selectedSupplier.website : `https://${selectedSupplier.website}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 w-auto"
                    >
                      <Globe size={16} />
                      <span>Visit Website</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card bg-light border-0 mb-3">
                <div className="card-body">
                  <h6 className="card-title text-muted mb-3 d-flex justify-content-between align-items-center">
                    <span>Contacts</span>
                    <Link to={`/contacts?supplierId=${selectedSupplier.id}`} className="btn btn-sm btn-outline-primary">
                      View All
                    </Link>
                  </h6>
                  
                  {contacts.filter(contact => contact.supplierId === selectedSupplier.id).length > 0 ? (
                    <div className="list-group list-group-flush bg-transparent">
                      {contacts
                        .filter(contact => contact.supplierId === selectedSupplier.id)
                        .slice(0, 3)
                        .map(contact => (
                          <div key={contact.id} className="list-group-item bg-transparent px-0 py-2 d-flex align-items-center">
                            <div className="bg-white rounded-circle p-2 me-3">
                              <User size={16} className="text-primary" />
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-medium">
                                {contact.firstName} {contact.lastName}
                              </div>
                              <div className="small text-muted">
                                {contact.jobTitle || 'No job title'}
                              </div>
                            </div>
                            <Link to={`/contacts/${contact.id}`} className="btn btn-sm btn-link text-decoration-none">
                              <ChevronRight size={16} />
                            </Link>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <Users size={24} className="mb-2" />
                      <p className="mb-3">No contacts found</p>
                      <Link to={`/contacts/new?supplierId=${selectedSupplier.id}`} className="btn btn-sm btn-primary">
                        Add Contact
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card bg-light border-0">
                <div className="card-body">
                  <h6 className="card-title text-muted mb-3 d-flex justify-content-between align-items-center">
                    <span>Offers</span>
                    <Link to={`/offers?supplierId=${selectedSupplier.id}`} className="btn btn-sm btn-outline-primary">
                      View All
                    </Link>
                  </h6>
                  
                  {offers.filter(offer => offer.supplierId === selectedSupplier.id).length > 0 ? (
                    <div className="list-group list-group-flush bg-transparent">
                      {offers
                        .filter(offer => offer.supplierId === selectedSupplier.id)
                        .sort((a, b) => new Date(b.validTo) - new Date(a.validTo))
                        .slice(0, 3)
                        .map(offer => {
                          const isActive = new Date(offer.validTo) >= new Date();
                          
                          return (
                            <div key={offer.id} className="list-group-item bg-transparent px-0 py-2 d-flex align-items-center">
                              <div className={`bg-${isActive ? 'success' : 'secondary'} bg-opacity-10 rounded-circle p-2 me-3`}>
                                <Package size={16} className={`text-${isActive ? 'success' : 'secondary'}`} />
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-medium">
                                  {offer.product ? offer.product.name : 'Unknown Product'}
                                </div>
                                <div className="small text-muted">
                                  ${Number(offer.price).toFixed(2)} · {isActive ? 'Active' : 'Expired'}
                                </div>
                              </div>
                              <Link to={`/offers/${offer.id}`} className="btn btn-sm btn-link text-decoration-none">
                                <ChevronRight size={16} />
                              </Link>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <Package size={24} className="mb-2" />
                      <p className="mb-3">No offers found</p>
                      <Link to={`/offers/new?supplierId=${selectedSupplier.id}`} className="btn btn-sm btn-primary">
                        Add Offer
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-md-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 text-center">
                      <div className="card bg-light border-0 mb-3">
                        <div className="card-body py-3">
                          <h3 className="mb-0 d-flex align-items-center justify-content-center">
                            <Star className="text-warning me-2" size={24} />
                            <span>{getSupplierRating(selectedSupplier.id).toFixed(1)}</span>
                          </h3>
                          <p className="text-muted small mb-0">Rating</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="card bg-light border-0 mb-3">
                        <div className="card-body py-3">
                          <h3 className="mb-0 d-flex align-items-center justify-content-center">
                            <Users className="text-primary me-2" size={24} />
                            <span>{getContactCount(selectedSupplier.id)}</span>
                          </h3>
                          <p className="text-muted small mb-0">Contacts</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="card bg-light border-0 mb-3">
                        <div className="card-body py-3">
                          <h3 className="mb-0 d-flex align-items-center justify-content-center">
                            <FileSpreadsheet className="text-primary me-2" size={24} />
                            <span>{getOfferCount(selectedSupplier.id).total}</span>
                          </h3>
                          <p className="text-muted small mb-0">Total Offers</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 text-center">
                      <div className="card bg-light border-0 mb-3">
                        <div className="card-body py-3">
                          <h3 className="mb-0 d-flex align-items-center justify-content-center">
                            <TrendingUp className="text-success me-2" size={24} />
                            <span>{getOfferCount(selectedSupplier.id).active}</span>
                          </h3>
                          <p className="text-muted small mb-0">Active Offers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={() => setSelectedSupplier(null)}>Close</button>
          <Link to={`/suppliers/${selectedSupplier.id}/edit`} className="btn btn-primary">
            <Edit size={16} className="me-2" />
            Edit Supplier
          </Link>
        </div>
      </div>
    </div>
  </div>
)}
</div>)}


export default SupplierList;