import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {FileText,Download,Filter,Calendar,Plus,Clock,DollarSign,TrendingUp,TrendingDown,Package,Users,Search,Layers,BarChart2,X,Edit,Trash2, Eye,AlertCircle,CheckCircle,ChevronDown,ChevronRight
} from 'lucide-react';
import offerService from '../../services/offerService';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';

function OfferList() {
  const [offers, setOffers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('validTo');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    supplierId: '',
    productId: '',
    active: '',
    dateFrom: '',
    dateTo: ''
  });

  const csvHeaders = [
    { label: "ID", key: "id" },
    { label: "Supplier", key: "supplierName" },
    { label: "Product", key: "productName" },
    { label: "Price", key: "price" },
    { label: "Valid From", key: "validFrom" },
    { label: "Valid To", key: "validTo" },
    { label: "Status", key: "status" },
    { label: "Quantity", key: "quantity" }
  ];
  
  const exportData = offers.map(offer => ({
    id: offer.id,
    supplierName: offer.supplier ? offer.supplier.name : 'Unknown',
    productName: offer.product ? offer.product.name : 'Unknown',
    price: Number(offer.price).toFixed(2),
    validFrom: new Date(offer.validFrom).toLocaleDateString(),
    validTo: new Date(offer.validTo).toLocaleDateString(),
    status: new Date(offer.validTo) >= new Date() ? 'Active' : 'Expired',
    quantity: offer.quantity || 'N/A'
  }));

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
      active: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchQuery('');
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
        if (selectedOffer && selectedOffer.id === id) {
          setSelectedOffer(null);
        }
      } catch (err) {
        setError('Failed to delete offer');
      }
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Supplier", "Product", "Price", "Valid From", "Valid To", "Status"];
    const tableRows = [];
    exportData.forEach(offer => {
      const offerData = [
        offer.id,
        offer.supplierName,
        offer.productName,
        `$${offer.price}`,
        offer.validFrom,
        offer.validTo,
        offer.status
      ];
      tableRows.push(offerData);
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    doc.text("Offers Report", 14, 15);
    doc.save(`offers-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredOffers = offers.filter(offer => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const supplierName = offer.supplier ? offer.supplier.name.toLowerCase() : '';
    const productName = offer.product ? offer.product.name.toLowerCase() : '';
    
    return (
      supplierName.includes(searchLower) ||
      productName.includes(searchLower) ||
      offer.price.toString().includes(searchLower)
    );
  });

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'supplierName':
        aValue = a.supplier ? a.supplier.name : '';
        bValue = b.supplier ? b.supplier.name : '';
        break;
      case 'productName':
        aValue = a.product ? a.product.name : '';
        bValue = b.product ? b.product.name : '';
        break;
      case 'price':
        aValue = parseFloat(a.price);
        bValue = parseFloat(b.price);
        break;
      case 'validFrom':
        aValue = new Date(a.validFrom);
        bValue = new Date(b.validFrom);
        break;
      case 'validTo':
        aValue = new Date(a.validTo);
        bValue = new Date(b.validTo);
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getDaysStatus = (validTo) => {
    const today = new Date();
    const endDate = new Date(validTo);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { days: diffDays, text: 'days left', type: 'active' };
    } else if (diffDays === 0) {
      return { days: 0, text: 'expires today', type: 'warning' };
    } else {
      return { days: Math.abs(diffDays), text: 'days expired', type: 'expired' };
    }
  };

  const getRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 30) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  const calculateSavings = (offer) => {
    const productOffers = offers.filter(o => 
      o.productId === offer.productId && 
      o.id !== offer.id
    );
    
    if (productOffers.length === 0) return null;
    
    const avgPrice = productOffers.reduce(
      (sum, o) => sum + parseFloat(o.price), 0
    ) / productOffers.length;
    
    const offerPrice = parseFloat(offer.price);
    const savingsPercent = ((avgPrice - offerPrice) / avgPrice) * 100;
    
    return {
      avgPrice,
      savingsPercent,
      isSaving: savingsPercent > 0
    };
  };
  const OfferCard = ({ offer }) => {
    const isActive = new Date(offer.validTo) >= new Date();
    const daysStatus = getDaysStatus(offer.validTo);
    const savings = calculateSavings(offer);
    
    return (
      <div className={`card h-100 shadow-sm ${isActive ? '' : 'border-danger border-opacity-25'}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <span className={`badge ${isActive ? 'bg-success' : 'bg-danger'} mb-2`}>
                {isActive ? 'Active' : 'Expired'}
              </span>
              <h5 className="card-title mb-1">
                {offer.product ? offer.product.name : 'Unknown Product'}
              </h5>
              <p className="text-muted small mb-0">
                {offer.supplier ? offer.supplier.name : 'Unknown Supplier'}
              </p>
            </div>
            <div className="text-end">
              <h4 className="mb-0">${Number(offer.price).toFixed(2)}</h4>
              {offer.quantity && (
                <small className="text-muted">Qty: {offer.quantity}</small>
              )}
            </div>
          </div>
          
          {savings && Math.abs(savings.savingsPercent) > 1 && (
            <div className={`alert ${savings.isSaving ? 'alert-success' : 'alert-warning'} py-2 px-3 mb-3 d-flex align-items-center`}>
              {savings.isSaving ? (
                <TrendingDown size={16} className="me-2" />
              ) : (
                <TrendingUp size={16} className="me-2" />
              )}
              <small>
                {savings.isSaving ? 
                  `${savings.savingsPercent.toFixed(1)}% below average` : 
                  `${Math.abs(savings.savingsPercent).toFixed(1)}% above average`
                }
              </small>
            </div>
          )}
          
          <div className="d-flex justify-content-between mb-3">
            <div className="small">
              <div className="d-flex align-items-center text-muted mb-1">
                <Calendar size={14} className="me-1" />
                <span>From: {new Date(offer.validFrom).toLocaleDateString()}</span>
              </div>
              <div className="d-flex align-items-center text-muted">
                <Calendar size={14} className="me-1" />
                <span>To: {new Date(offer.validTo).toLocaleDateString()}</span>
              </div>
            </div>
            <div className={`text-${daysStatus.type === 'active' ? 'success' : daysStatus.type === 'warning' ? 'warning' : 'danger'} text-end`}>
              <div className="d-flex align-items-center">
                <Clock size={16} className="me-1" />
                <span className="fw-bold">{daysStatus.days}</span>
              </div>
              <small>{daysStatus.text}</small>
            </div>
          </div>
          
          <div className="d-flex justify-content-end mt-3 pt-3 border-top">
            <button 
              onClick={() => setSelectedOffer(offer)} 
              className="btn btn-sm btn-outline-primary me-2"
            >
              <Eye size={16} className="me-1" />
              View
            </button>
            <Link 
              to={`/offers/${offer.id}/edit`} 
              className="btn btn-sm btn-outline-secondary me-2"
            >
              <Edit size={16} className="me-1" />
              Edit
            </Link>
            <button 
              onClick={() => handleDelete(offer.id)} 
              className="btn btn-sm btn-outline-danger"
            >
              <Trash2 size={16} className="me-1" />
              Delete
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
              <h2 className="mb-1">Price Offers Management</h2>
              <p className="text-muted mb-0">Manage supplier offers and price agreements</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                  <Download size={16} />
                  <span>Export</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <CSVLink 
                      data={exportData} 
                      headers={csvHeaders} 
                      filename={`offers-export-${new Date().toISOString().split('T')[0]}.csv`}
                      className="dropdown-item d-flex align-items-center"
                    >
                      <FileText size={16} className="me-2" />
                      Export as CSV
                    </CSVLink>
                  </li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center" onClick={exportPDF}>
                      <FileText size={16} className="me-2" />
                      Export as PDF
                    </button>
                  </li>
                </ul>
              </div>
              <Link to="/offers/new" className="btn btn-primary d-flex align-items-center gap-2">
                <Plus size={16} />
                <span>Add New Offer</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0 d-flex align-items-center">
            <Filter size={18} className="me-2" />
            Filters
          </h5>
          <div className="d-flex align-items-center">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search offers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
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
            <div className="col-md-2">
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
            <div className="col-md-2">
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
            <div className="col-md-2">
              <label htmlFor="dateFrom" className="form-label">Valid From</label>
              <input
                type="date"
                className="form-control"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="dateTo" className="form-label">Valid To</label>
              <input
                type="date"
                className="form-control"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
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
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted small mb-0">
            Showing {sortedOffers.length} of {offers.length} offers
          </p>
          <div className="d-flex align-items-center gap-3">
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
              <option value="validTo-desc">Expiry Date (Newest First)</option>
              <option value="validTo-asc">Expiry Date (Oldest First)</option>
              <option value="validFrom-desc">Start Date (Newest First)</option>
              <option value="validFrom-asc">Start Date (Oldest First)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="supplierName-asc">Supplier (A-Z)</option>
              <option value="productName-asc">Product (A-Z)</option>
            </select>
            
            <div className="btn-group">
              <button
                onClick={() => setViewMode('table')}
                className={`btn btn-sm btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
              >
                <BarChart2 size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`btn btn-sm btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <Layers size={16} />
              </button>
            </div>
          </div>
        </div>

        {sortedOffers.length === 0 ? (
          <div className="alert alert-info">
            No offers found. {searchQuery || Object.values(filters).some(v => v !== '') ? 'Try adjusting your filters.' : 'Create your first offer!'}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {sortedOffers.map(offer => (
              <div key={offer.id} className="col">
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Supplier / Product</th>
                    <th>Price</th>
                    <th>Valid Period</th>
                    <th>Status</th>
                    <th>Comparison</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOffers.map(offer => {
                    const isActive = new Date(offer.validTo) >= new Date();
                    const daysStatus = getDaysStatus(offer.validTo);
                    const savings = calculateSavings(offer);
                    
                    return (
                      <tr key={offer.id}>
                        <td>
                          <div>
                            <div className="fw-medium">{offer.product ? offer.product.name : 'Unknown Product'}</div>
                            <small className="text-muted">{offer.supplier ? offer.supplier.name : 'Unknown Supplier'}</small>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold">${Number(offer.price).toFixed(2)}</div>
                          {offer.quantity && (
                            <small className="text-muted">Qty: {offer.quantity}</small>
                          )}
                        </td>
                        <td>
                          <div className="small">
                            <div className="d-flex align-items-center mb-1">
                              <Calendar size={14} className="me-1 text-muted" />
                              <span>{new Date(offer.validFrom).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <Calendar size={14} className="me-1 text-muted" />
                              <span>{new Date(offer.validTo).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={`d-flex align-items-center ${isActive ? 'text-success' : 'text-danger'}`}>
                            {isActive ? (
                              <CheckCircle size={16} className="me-1" />
                            ) : (
                              <AlertCircle size={16} className="me-1" />
                            )}
                            <span className="fw-medium">{isActive ? 'Active' : 'Expired'}</span>
                          </div>
                          <small className={`text-${daysStatus.type === 'active' ? 'success' : daysStatus.type === 'warning' ? 'warning' : 'danger'}`}>
                            {daysStatus.days} {daysStatus.text}
                          </small>
                        </td>
                        <td>
                          {savings && Math.abs(savings.savingsPercent) > 1 ? (
                            <div className={`d-flex align-items-center ${savings.isSaving ? 'text-success' : 'text-danger'}`}>
                              {savings.isSaving ? (
                                <TrendingDown size={16} className="me-1" />
                              ) : (
                                <TrendingUp size={16} className="me-1" />
                              )}
                              <span>
                                {savings.isSaving ? 
                                  `${savings.savingsPercent.toFixed(1)}% below avg.` : 
                                  `${Math.abs(savings.savingsPercent).toFixed(1)}% above avg.`
                                }
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button 
                              onClick={() => setSelectedOffer(offer)} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              <Eye size={14} />
                            </button>
                            <Link 
                              to={`/offers/${offer.id}/edit`} 
                              className="btn btn-sm btn-outline-secondary"
                            >
                              <Edit size={14} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(offer.id)} 
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
      {selectedOffer && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Offer Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedOffer(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card bg-light border-0 h-100">
                      <div className="card-body">
                        <h6 className="card-title text-muted mb-3">Product Information</h6>
                        {selectedOffer.product ? (
                          <div>
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-white p-2 rounded-circle me-3">
                                <Package size={24} className="text-primary" />
                              </div>
                              <div>
                                <h5 className="mb-0">{selectedOffer.product.name}</h5>
                                {selectedOffer.product.category && (
                                  <span className="badge bg-info mt-1">{selectedOffer.product.category}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-muted small mb-2">
                              {selectedOffer.product.description || 'No description available'}
                            </p>
                            <div className="mt-3">
                              <Link to={`/products/${selectedOffer.productId}`} className="btn btn-sm btn-outline-primary">
                                View Product Details
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-5 text-muted">
                            <Package size={32} className="mb-2" />
                            <p>Product details not available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card bg-light border-0 h-100">
                      <div className="card-body">
                        <h6 className="card-title text-muted mb-3">Supplier Information</h6>
                        {selectedOffer.supplier ? (
                          <div>
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-white p-2 rounded-circle me-3">
                                <Users size={24} className="text-primary" />
                              </div>
                              <div>
                                <h5 className="mb-0">{selectedOffer.supplier.name}</h5>
                                <p className="text-muted small mb-0">{selectedOffer.supplier.email || 'No email'}</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Link to={`/suppliers/${selectedOffer.supplierId}`} className="btn btn-sm btn-outline-primary">
                                View Supplier Details
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-5 text-muted">
                            <Users size={32} className="mb-2" />
                            <p>Supplier details not available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <h5 className="card-title mb-4">Offer Details</h5>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label text-muted small">Price</label>
                              <div className="d-flex align-items-center">
                                <DollarSign size={20} className="text-success me-2" />
                                <h4 className="mb-0">${Number(selectedOffer.price).toFixed(2)}</h4>
                              </div>
                              {selectedOffer.quantity && (
                                <small className="text-muted">Quantity: {selectedOffer.quantity}</small>
                              )}
                            </div>
                          </div>
                          
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label text-muted small">Validity Period</label>
                              <div>
                                <div className="d-flex align-items-center mb-1">
                                  <Calendar size={16} className="text-primary me-2" />
                                  <span>From: {new Date(selectedOffer.validFrom).toLocaleDateString()}</span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <Calendar size={16} className="text-primary me-2" />
                                  <span>To: {new Date(selectedOffer.validTo).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label text-muted small">Status</label>
                              <div>
                                {new Date(selectedOffer.validTo) >= new Date() ? (
                                  <div className="alert alert-success py-2 px-3 mb-0 d-flex align-items-center">
                                    <CheckCircle size={16} className="me-2" />
                                    <div>
                                      <span className="fw-medium">Active</span>
                                      <div className="small">
                                        {getDaysStatus(selectedOffer.validTo).days} days remaining
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="alert alert-danger py-2 px-3 mb-0 d-flex align-items-center">
                                    <AlertCircle size={16} className="me-2" />
                                    <div>
                                      <span className="fw-medium">Expired</span>
                                      <div className="small">
                                        {Math.abs(getDaysStatus(selectedOffer.validTo).days)} days ago
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {selectedOffer.notes && (
                            <div className="col-12">
                              <div className="mb-3">
                                <label className="form-label text-muted small">Notes</label>
                                <p className="border rounded p-3 bg-light">{selectedOffer.notes}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="col-12">
                            <div className="mb-0">
                              <label className="form-label text-muted small">Created</label>
                              <div className="text-muted small">
                                {selectedOffer.createdAt ? getRelativeDate(selectedOffer.createdAt) : 'Unknown'}
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
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedOffer(null)}>Close</button>
                <Link to={`/offers/${selectedOffer.id}/edit`} className="btn btn-primary">
                  <Edit size={16} className="me-2" />
                  Edit Offer
                </Link>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setSelectedOffer(null)}></div>
        </div>
      )}
    </div>
  );
}

export default OfferList;