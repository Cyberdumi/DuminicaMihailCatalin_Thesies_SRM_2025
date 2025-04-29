import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
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

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-header">Products</h2>
        <Link to="/products/new" className="btn btn-primary">Add New Product</Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="alert alert-info">
          {searchTerm ? 'No products match your search.' : 'No products found. Create your first product!'}
        </div>
      ) : (
        <div className="row">
          {filteredProducts.map(product => (
            <div key={product.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  {product.category && (
                    <span className="badge bg-info mb-2">{product.category}</span>
                  )}
                  <p className="card-text">
                    {product.description ? 
                      (product.description.length > 100 ? 
                        `${product.description.substring(0, 100)}...` : product.description) : 
                      'No description available'}
                  </p>
                  {product.unitOfMeasure && (
                    <p className="text-muted mb-3">Unit: {product.unitOfMeasure}</p>
                  )}
                </div>
                <div className="card-footer bg-white border-top-0">
                  <div className="btn-group w-100" role="group">
                    <Link to={`/products/${product.id}`} className="btn btn-info btn-sm">View</Link>
                    <Link to={`/products/${product.id}/edit`} className="btn btn-warning btn-sm">Edit</Link>
                    <button onClick={() => handleDelete(product.id)} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;