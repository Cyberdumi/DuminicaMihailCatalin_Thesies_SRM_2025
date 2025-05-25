import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import offerService from '../../services/offerService';

function OfferDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const data = await offerService.getById(id);
        setOffer(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching offer details:', err);
        setError('Failed to fetch offer details');
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await offerService.delete(id);
        navigate('/offers');
      } catch (err) {
        setError('Failed to delete offer');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!offer) return <div className="alert alert-warning">Offer not found</div>;

  const isActive = new Date(offer.validTo) >= new Date();
  const validFromDate = new Date(offer.validFrom).toLocaleDateString();
  const validToDate = new Date(offer.validTo).toLocaleDateString();

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="detail-header">Offer Details</h2>
        <div>
          <Link to={`/offers/${id}/edit`} className="btn btn-warning me-2">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>
            {offer.product && offer.product.name} - ${Number(offer.price).toFixed(2)}
            {offer.quantity && ` (Qty: ${offer.quantity})`}
          </h3>
          <span className={`badge ${isActive ? 'bg-success' : 'bg-danger'}`}>
            {isActive ? 'Active' : 'Expired'}
          </span>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Supplier:</strong>{' '}
                {offer.supplier ? (
                  <Link to={`/suppliers/${offer.supplierId}`}>
                    {offer.supplier.name}
                  </Link>
                ) : (
                  'Unknown'
                )}
              </p>
              <p>
                <strong>Product:</strong>{' '}
                {offer.product ? (
                  <Link to={`/products/${offer.productId}`}>
                    {offer.product.name}
                  </Link>
                ) : (
                  'Unknown'
                )}
              </p>
              <p><strong>Price:</strong> ${Number(offer.price).toFixed(2)}</p>
              {offer.quantity && (
                <p><strong>Quantity:</strong> {offer.quantity}</p>
              )}
            </div>
            <div className="col-md-6">
              <p><strong>Valid From:</strong> {validFromDate}</p>
              <p><strong>Valid To:</strong> {validToDate}</p>
              <p><strong>Created:</strong> {new Date(offer.createdAt).toLocaleDateString()}</p>
              <p><strong>Last Updated:</strong> {new Date(offer.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {offer.notes && (
            <div className="mt-3">
              <h5>Notes</h5>
              <p>{offer.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Supplier Information</h4>
            </div>
            <div className="card-body">
              {offer.supplier ? (
                <>
                  <h5>{offer.supplier.name}</h5>
                  <p><strong>Email:</strong> {offer.supplier.email}</p>
                  <p><strong>Phone:</strong> {offer.supplier.phone || 'N/A'}</p>
                  <Link to={`/suppliers/${offer.supplierId}`} className="btn btn-outline-primary">
                    View Supplier Details
                  </Link>
                </>
              ) : (
                <p>Supplier information not available</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Product Information</h4>
            </div>
            <div className="card-body">
              {offer.product ? (
                <>
                  <h5>{offer.product.name}</h5>
                  <p><strong>Category:</strong> {offer.product.category || 'N/A'}</p>
                  <p><strong>Unit:</strong> {offer.product.unitOfMeasure || 'N/A'}</p>
                  <Link to={`/products/${offer.productId}`} className="btn btn-outline-primary">
                    View Product Details
                  </Link>
                </>
              ) : (
                <p>Product information not available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Link to="/offers" className="btn btn-secondary">Back to Offers</Link>
      </div>
    </div>
  );
}

export default OfferDetails;