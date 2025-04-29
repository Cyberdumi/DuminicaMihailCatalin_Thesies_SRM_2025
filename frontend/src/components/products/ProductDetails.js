import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import offerService from '../../services/offerService';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await productService.getById(id);
        setProduct(productData);
        
        const offersData = await offerService.getAll({ productId: id });
        setOffers(offersData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to fetch product details');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product? This will also delete all associated offers.')) {
      try {
        await productService.delete(id);
        navigate('/products');
      } catch (err) {
        setError('Failed to delete product. Check if there are any dependencies.');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div className="alert alert-warning">Product not found</div>;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="detail-header">Product Details</h2>
        <div>
          <Link to={`/products/${id}/edit`} className="btn btn-warning me-2">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3>{product.name}</h3>
          {product.category && <span className="badge bg-info ms-2">{product.category}</span>}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Description:</strong> {product.description || 'No description available'}</p>
              <p><strong>Unit of Measure:</strong> {product.unitOfMeasure || 'N/A'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
              <p><strong>Last Updated:</strong> {new Date(product.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Price Offers</h4>
          <Link to={`/offers/new?productId=${id}`} className="btn btn-sm btn-primary">Add Offer</Link>
        </div>
        <div className="card-body">
          {offers.length === 0 ? (
            <p>No offers found for this product.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Price</th>
                    <th>Validity</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map(offer => {
                    const isActive = new Date(offer.validTo) >= new Date();
                    const startDate = new Date(offer.validFrom).toLocaleDateString();
                    const endDate = new Date(offer.validTo).toLocaleDateString();
                    
                    return (
                      <tr key={offer.id}>
                        <td>{offer.supplier ? offer.supplier.name : 'Unknown'}</td>
                        <td>${Number(offer.price).toFixed(2)}</td>
                        <td>{startDate} to {endDate}</td>
                        <td>{offer.quantity || 'N/A'}</td>
                        <td>
                          {isActive ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-danger">Expired</span>
                          )}
                        </td>
                        <td>
                          <Link to={`/offers/${offer.id}`} className="btn btn-sm btn-info">View</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3">
        <Link to="/products" className="btn btn-secondary">Back to Products</Link>
      </div>
    </div>
  );
}

export default ProductDetails;