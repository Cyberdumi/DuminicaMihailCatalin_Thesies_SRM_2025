import React, { useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {  Users, Search,  Filter,  X, Edit, UserX,  Shield,  UserCheck,  ChevronDown,BarChart2,Settings,User, UserPlus,Mail,Lock,AlertCircle} from 'lucide-react';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO an admin-only endpoint 
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. ' + err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      role: '',
      status: ''
    });
  };

  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newUser.username.trim()) {
      errors.username = 'Username is required';
    } else if (newUser.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare user data for API
      const userData = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        isActive: newUser.isActive
      };
      
      // Send API request
      const response = await api.post('/admin/users', userData);
      
      // Add new user to list
      setUsers([...users, response.data]);
      
      // Close modal and reset form
      setShowAddUserModal(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        isActive: true
      });
      setFormErrors({});
    } catch (err) {
      console.error('Error creating user:', err);
      setFormErrors({
        submit: err.response?.data?.message || 'Failed to create user. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = 
      searchTerm === '' ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Role filter
    const matchesRole = filters.role === '' || user.role === filters.role;
    
    // Status filter
    const matchesStatus = 
      filters.status === '' || 
      (filters.status === 'active' && user.isActive) || 
      (filters.status === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <X size={20} className="me-2" />
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div className="mb-3 mb-md-0">
              <h2 className="mb-1">Admin Dashboard</h2>
              <p className="text-muted mb-0">Manage system users, roles and permissions</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddUserModal(true)}
              >
                <UserPlus size={16} />
                <span>Add User</span>
              </button>
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
                  placeholder="Search users by name, email, role..."
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
            
            <div className="col-md-7">
              <div className="d-flex gap-2 justify-content-md-end">
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
          </div>
          
          {showFilterPanel && (
            <div className="row mt-3 pt-3 border-top g-3">
              <div className="col-md-6">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-muted small mb-0">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>ID</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-3">
                          <User size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="fw-medium">{user.username}</div>
                          <div className="small text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'manager' ? 'warning' : 'info'} bg-opacity-75 d-flex align-items-center gap-1 w-auto`} style={{ maxWidth: 'fit-content' }}>
                        {user.role === 'admin' && <Shield size={14} />}
                        {user.role === 'manager' && <Settings size={14} />}
                        {user.role === 'user' && <User size={14} />}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${user.isActive ? 'success' : 'danger'} bg-opacity-75 d-flex align-items-center gap-1 w-auto`} style={{ maxWidth: 'fit-content' }}>
                        {user.isActive ? <UserCheck size={14} /> : <UserX size={14} />}
                        <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>
                    <td className="small text-muted">ID: {user.id}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                          {user.isActive ? (
                            <>
                              <UserX size={14} />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <UserCheck size={14} />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="text-muted">
                      <Users size={24} className="mb-2" />
                      <p>No users found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="supplier-detail-overlay" onClick={() => setShowAddUserModal(false)}>
          <div 
            className="supplier-detail-modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '600px' }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddUserModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmitUser}>
                  {formErrors.submit && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <AlertCircle size={18} className="me-2" />
                      <div>{formErrors.submit}</div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <User size={16} className="text-primary" />
                      </span>
                      <input 
                        type="text" 
                        className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                        id="username"
                        name="username"
                        value={newUser.username}
                        onChange={handleNewUserChange}
                        placeholder="Enter username"
                      />
                      {formErrors.username && (
                        <div className="invalid-feedback">
                          {formErrors.username}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <Mail size={16} className="text-primary" />
                      </span>
                      <input 
                        type="email" 
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleNewUserChange}
                        placeholder="Enter email"
                      />
                      {formErrors.email && (
                        <div className="invalid-feedback">
                          {formErrors.email}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <Lock size={16} className="text-primary" />
                      </span>
                      <input 
                        type="password" 
                        className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleNewUserChange}
                        placeholder="Enter password"
                      />
                      {formErrors.password && (
                        <div className="invalid-feedback">
                          {formErrors.password}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <Lock size={16} className="text-primary" />
                      </span>
                      <input 
                        type="password" 
                        className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={newUser.confirmPassword}
                        onChange={handleNewUserChange}
                        placeholder="Confirm password"
                      />
                      {formErrors.confirmPassword && (
                        <div className="invalid-feedback">
                          {formErrors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleNewUserChange}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActive"
                      name="isActive"
                      checked={newUser.isActive}
                      onChange={handleNewUserChange}
                    />
                    <label className="form-check-label" htmlFor="isActive">Active</label>
                  </div>
                  
                  <div className="modal-footer px-0 pb-0">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddUserModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary d-flex align-items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>Create User</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;