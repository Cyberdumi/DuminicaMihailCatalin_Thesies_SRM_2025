import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supplierService from '../../services/supplierService';

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await supplierService.getAll();
        setSuppliers(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch suppliers');
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierService.delete(id);
        setSuppliers(suppliers.filter(supplier => supplier.id !== id));
      } catch (err) {
        setError('Failed to delete supplier');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Suppliers</h2>
        <Link to="/suppliers/new" className="btn btn-primary">Add New Supplier</Link>
      </div>

      {suppliers.length === 0 ? (
        <p>No suppliers found</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
              <tr key={supplier.id}>
                <td>{supplier.id}</td>
                <td>{supplier.name}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone || 'N/A'}</td>
                <td>
                  <div className="btn-group" role="group">
                    <Link to={`/suppliers/${supplier.id}`} className="btn btn-info btn-sm">View</Link>
                    <Link to={`/suppliers/${supplier.id}/edit`} className="btn btn-warning btn-sm">Edit</Link>
                    <button onClick={() => handleDelete(supplier.id)} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SupplierList;