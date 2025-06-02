import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search,Plus,Filter,Download,Upload,Edit,Trash2,MoreVertical,Package,Tag,TrendingUp,TrendingDown,AlertCircle,CheckCircle,Clock,DollarSign,BarChart2,X,ChevronDown,Star,Layers} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import productService from '../../services/productService';
import offerService from '../../services/offerService';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
      
        const [productsData, offersData] = await Promise.all([
          productService.getAll(),
          offerService.getAll()
        ]);
        
        const uniqueCategories = [...new Set(productsData
          .filter(p => p.category)
          .map(p => p.category))];
        
        setCategories(uniqueCategories);
        setProducts(productsData);
        setOffers(offersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        setError('Failed to delete product. It may have associated offers.');
      }
    }
  };

  const getProductPriceData = (product) => {
    const productOffers = offers.filter(offer => offer.productId === product.id);
    
    if (productOffers.length === 0) {
      return {
        currentPrice: 'N/A',
        previousPrice: 'N/A',
        priceChange: 0,
        priceHistory: []
      };
    }
    
    const sortedOffers = [...productOffers].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    const currentPrice = sortedOffers[0]?.price || 'N/A';
    const previousPrice = sortedOffers.length > 1 ? sortedOffers[1].price : currentPrice;
    
    const priceChange = previousPrice !== 'N/A' && currentPrice !== 'N/A' 
      ? ((parseFloat(currentPrice) - parseFloat(previousPrice)) / parseFloat(previousPrice)) * 100 
      : 0;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const priceHistory = [];
    
    if (sortedOffers.length > 0) {
      const offersByMonth = {};
      sortedOffers.forEach(offer => {
        const date = new Date(offer.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!offersByMonth[monthKey]) {
          offersByMonth[monthKey] = [];
        }
        offersByMonth[monthKey].push(offer);
      });
      
      Object.entries(offersByMonth).forEach(([monthKey, monthOffers]) => {
        const [year, month] = monthKey.split('-');
        const avgPrice = monthOffers.reduce((sum, offer) => sum + parseFloat(offer.price), 0) / monthOffers.length;
        
        priceHistory.push({
          month: months[parseInt(month)],
          price: Math.round(avgPrice * 100) / 100
        });
      });
      
      priceHistory.sort((a, b) => {
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
      
      const lastSixMonths = priceHistory.slice(-6);
      
      return {
        currentPrice,
        previousPrice,
        priceChange,
        priceHistory: lastSixMonths
      };
    }
    
    return {
      currentPrice,
      previousPrice,
      priceChange,
      priceHistory: []
    };
  };
  const getStockLevel = (product) => {
    const productOffers = offers.filter(
      offer => offer.productId === product.id && new Date(offer.validTo) >= new Date()
    );
    
    if (productOffers.length === 0) return 'out';
    if (productOffers.length > 5) return 'high';
    if (productOffers.length > 2) return 'medium';
    return 'low';
  };
  
  const getQualityRating = (product) => {
    const productOffers = offers.filter(offer => offer.productId === product.id);
    
    if (productOffers.length === 0) return 3.0;
    if (productOffers.length > 10) return 4.9;
    if (productOffers.length > 5) return 4.5;
    if (productOffers.length > 2) return 4.0;
    return 3.5;
  };
  
  const getProductSuppliers = (product) => {
    const productOffers = offers.filter(offer => offer.productId === product.id);
    const supplierIds = [...new Set(productOffers.map(offer => offer.supplier?.name || 'Unknown Supplier'))];
    return supplierIds;
  };

  const getFilteredProducts = () => {
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => {
        const hasActiveOffers = offers.some(
          offer => offer.productId === product.id && new Date(offer.validTo) >= new Date()
        );
        return selectedStatus === 'active' ? hasActiveOffers : !hasActiveOffers;
      });
    }
    
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (sortBy === 'price') {
        const aPriceData = getProductPriceData(a);
        const bPriceData = getProductPriceData(b);
        
        aVal = aPriceData.currentPrice === 'N/A' ? 0 : parseFloat(aPriceData.currentPrice);
        bVal = bPriceData.currentPrice === 'N/A' ? 0 : parseFloat(bPriceData.currentPrice);
      } else {
        aVal = a[sortBy] || '';
        bVal = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const getStockLevelColor = (level) => {
    switch(level) {
      case 'high': return 'bg-success text-white';
      case 'medium': return 'bg-warning text-dark';
      case 'low': return 'bg-danger text-white';
      case 'out': return 'bg-secondary text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getStatusColor = (product) => {
    const hasActiveOffers = offers.some(
      offer => offer.productId === product.id && new Date(offer.validTo) >= new Date()
    );
    return hasActiveOffers ? 'bg-success text-white' : 'bg-secondary text-white';
  };

  const filteredProducts = getFilteredProducts();

  const ProductCard = ({ product }) => {
    const { currentPrice, previousPrice, priceChange, priceHistory } = getProductPriceData(product);
    const stockLevel = getStockLevel(product);
    const qualityRating = getQualityRating(product);
    const suppliers = getProductSuppliers(product);
    const status = offers.some(
      offer => offer.productId === product.id && new Date(offer.validTo) >= new Date()
    ) ? 'active' : 'inactive';
    
    return (
      <div className="card h-100 shadow-sm">
        <div className="position-relative">
          <div className="card-img-top d-flex align-items-center justify-content-center bg-light" style={{height: "140px"}}>
            <Package size={48} className="text-secondary" />
          </div>
          <div className="position-absolute top-0 end-0 m-2">
            <div className="dropdown">
              <button className="btn btn-sm btn-light rounded-circle" data-bs-toggle="dropdown">
                <MoreVertical size={16} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link to={`/products/${product.id}/edit`} className="dropdown-item">Edit</Link></li>
                <li><button className="dropdown-item text-danger" onClick={() => handleDelete(product.id)}>Delete</button></li>
              </ul>
            </div>
          </div>
          <div className="position-absolute top-0 start-0 m-2">
            <span className={`badge ${status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
              {status}
            </span>
          </div>
        </div>
        
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0 text-truncate">{product.name}</h5>
          </div>
          
          {product.category && (
            <div className="mb-2">
              <span className="badge bg-info">{product.category}</span>
            </div>
          )}
          
          <p className="card-text small text-muted mb-3" style={{height: "3rem", overflow: "hidden"}}>
            {product.description || 'No description available'}
          </p>
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">{currentPrice !== 'N/A' ? `$${parseFloat(currentPrice).toFixed(2)}` : 'No price'}</h5>
              <small className="text-muted">{product.unitOfMeasure || 'each'}</small>
            </div>
            {currentPrice !== 'N/A' && previousPrice !== 'N/A' && (
              <div className={`d-flex align-items-center ${priceChange > 0 ? 'text-danger' : 'text-success'}`}>
                {priceChange > 0 ? <TrendingUp size={16} className="me-1" /> : <TrendingDown size={16} className="me-1" />}
                <small className="fw-bold">{Math.abs(priceChange).toFixed(1)}%</small>
              </div>
            )}
          </div>
          
          <div className="d-flex justify-content-between align-items-center small mb-3">
            <div className="d-flex align-items-center">
              <Star className="text-warning me-1" size={16} />
              <span>{qualityRating.toFixed(1)}</span>
            </div>
            <span className={`badge ${getStockLevelColor(stockLevel)}`}>
              Stock: {stockLevel}
            </span>
          </div>
          
          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
            <small className="text-muted">{suppliers.length} supplier(s)</small>
            <button 
              onClick={() => setSelectedProduct(product)}
              className="btn btn-sm btn-link p-0 text-decoration-none"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ProductTableRow = ({ product }) => {
    const { currentPrice, previousPrice, priceChange } = getProductPriceData(product);
    const stockLevel = getStockLevel(product);
    const qualityRating = getQualityRating(product);
    const suppliers = getProductSuppliers(product);
    const status = offers.some(
      offer => offer.productId === product.id && new Date(offer.validTo) >= new Date()
    ) ? 'active' : 'inactive';
    
    return (
      <tr>
        <td>
          <div className="d-flex align-items-center">
            <div className="bg-light rounded p-2 me-2">
              <Package size={20} className="text-secondary" />
            </div>
            <div>
              <div className="fw-medium">{product.name}</div>
              <small className="text-muted">SKU: {product.id}</small>
            </div>
          </div>
        </td>
        <td>{product.category || 'N/A'}</td>
        <td>
          <div>
            <div>{currentPrice !== 'N/A' ? `$${parseFloat(currentPrice).toFixed(2)}` : 'No price'}</div>
            {currentPrice !== 'N/A' && previousPrice !== 'N/A' && (
              <div className={`small ${priceChange > 0 ? 'text-danger' : 'text-success'} d-flex align-items-center`}>
                {priceChange > 0 ? <TrendingUp size={14} className="me-1" /> : <TrendingDown size={14} className="me-1" />}
                <span>{Math.abs(priceChange).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </td>
        <td>
          <span className={`badge ${getStockLevelColor(stockLevel)}`}>
            {stockLevel}
          </span>
        </td>
        <td>
          <div className="d-flex align-items-center">
            <Star className="text-warning me-1" size={14} />
            <span>{qualityRating.toFixed(1)}</span>
          </div>
        </td>
        <td>{suppliers.length}</td>
        <td>
          <span className={`badge ${status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
            {status}
          </span>
        </td>
        <td>
          <div className="btn-group">
            <button 
              onClick={() => setSelectedProduct(product)} 
              className="btn btn-sm btn-outline-primary"
            >
              View
            </button>
            <Link to={`/products/${product.id}/edit`} className="btn btn-sm btn-outline-secondary">
              <Edit size={14} />
            </Link>
            <button onClick={() => handleDelete(product.id)} className="btn btn-sm btn-outline-danger">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: "300px"}}>
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
              <h2 className="mb-1">Products Management</h2>
              <p className="text-muted mb-0">Manage your product catalog and track pricing trends</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                <Upload size={16} />
                <span>Import</span>
              </button>
              <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                <Download size={16} />
                <span>Export</span>
              </button>
              <Link to="/products/new" className="btn btn-primary d-flex align-items-center gap-2">
                <Plus size={16} />
                <span>Add Product</span>
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
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products by name, description, or category..."
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
            
            <div className="col-md-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-md-1">
              <button 
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
              >
                <Filter size={16} />
                <span className="d-none d-lg-inline">Filters</span>
              </button>
            </div>

            <div className="col-md-2">
              <select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="form-select"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="category-asc">Category (A-Z)</option>
              </select>
            </div>
            
            <div className="col-auto ms-auto">
              <div className="btn-group">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <Layers size={16} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`btn btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
                >
                  <BarChart2 size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {showFilterPanel && (
            <div className="mt-3 pt-3 border-top">
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-sm btn-outline-secondary me-2">Clear All</button>
                    <button className="btn btn-sm btn-primary">Apply Filters</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-muted small mb-3">
          Showing {filteredProducts.length} of {products.length} products
        </p>

        {filteredProducts.length === 0 ? (
          <div className="alert alert-info">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 
              'No products match your filters.' : 
              'No products found. Add your first product!'}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="row g-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="col-md-6 col-lg-4 col-xl-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Suppliers</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <ProductTableRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
// Replace the existing modal implementation with this code

{selectedProduct && (
  <div className="product-detail-overlay" onClick={() => setSelectedProduct(null)}>
    <div 
      className="product-detail-modal"
      onClick={e => e.stopPropagation()} // Prevents closing when clicking inside modal
    >
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Product Details</h5>
          <button type="button" className="btn-close" onClick={() => setSelectedProduct(null)}></button>
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-lg-6">
              <div className="bg-light rounded d-flex align-items-center justify-content-center mb-3" style={{height: "250px"}}>
                <Package size={64} className="text-secondary" />
              </div>
              
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-transparent">
                  <h5 className="mb-0">Price History</h5>
                </div>
                <div className="card-body">
                  {getProductPriceData(selectedProduct).priceHistory.length > 0 ? (
                    <div style={{height: "200px"}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getProductPriceData(selectedProduct).priceHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#0d6efd" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-muted text-center py-5">No price history available</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="mb-4">
                <h3 className="mb-1">{selectedProduct.name}</h3>
                <p className="text-muted mb-3">ID: {selectedProduct.id}</p>
                
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className={`badge ${getStatusColor(selectedProduct)}`}>
                    {offers.some(
                      offer => offer.productId === selectedProduct.id && new Date(offer.validTo) >= new Date()
                    ) ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`badge ${getStockLevelColor(getStockLevel(selectedProduct))}`}>
                    Stock: {getStockLevel(selectedProduct)}
                  </span>
                  {selectedProduct.category && (
                    <span className="badge bg-info">{selectedProduct.category}</span>
                  )}
                </div>
                
                <div className="mb-4">
                  <p>{selectedProduct.description || 'No description available'}</p>
                </div>
                
                <div className="row g-4 mb-4">
                  <div className="col-sm-6">
                    <div className="card bg-light border-0">
                      <div className="card-body">
                        <p className="text-muted small mb-1">Current Price</p>
                        <h4 className="mb-0">
                          {getProductPriceData(selectedProduct).currentPrice !== 'N/A' ? 
                            `$${parseFloat(getProductPriceData(selectedProduct).currentPrice).toFixed(2)}` : 
                            'No price'}
                        </h4>
                        <p className="small text-muted mb-0">
                          {selectedProduct.unitOfMeasure || 'each'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="card bg-light border-0">
                      <div className="card-body">
                        <p className="text-muted small mb-1">Quality Rating</p>
                        <div className="d-flex align-items-center">
                          <Star className="text-warning me-2" size={24} />
                          <h4 className="mb-0">{getQualityRating(selectedProduct).toFixed(1)}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-3">Suppliers</h5>
                  <div className="list-group">
                    {getProductSuppliers(selectedProduct).length > 0 ? (
                      getProductSuppliers(selectedProduct).map((supplier, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{supplier}</span>
                          <button className="btn btn-sm btn-link">View Details</button>
                        </div>
                      ))
                    ) : (
                      <div className="list-group-item text-muted">No suppliers available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Close</button>
          <Link to={`/products/${selectedProduct.id}/edit`} className="btn btn-primary">Edit Product</Link>
        </div>
      </div>
    </div>
  </div>
)}
     
    </div>
  );
}

export default ProductList;