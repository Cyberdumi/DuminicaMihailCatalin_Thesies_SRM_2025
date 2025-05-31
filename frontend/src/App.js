import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/layout/Navbar';
import SupplierList from './components/suppliers/SupplierList';
import SupplierDetails from './components/suppliers/SupplierDetails';
import SupplierForm from './components/suppliers/SupplierForm';
import ProductList from './components/products/ProductList';
import ProductDetails from './components/products/ProductDetails';
import ProductForm from './components/products/ProductForm';
import ContactList from './components/contacts/ContactList';
import ContactDetails from './components/contacts/ContactDetails';
import ContactForm from './components/contacts/ContactForm';
import OfferList from './components/offers/OfferList';
import OfferDetails from './components/offers/OfferDetails';
import OfferForm from './components/offers/OfferForm';
import Dashboard from './components/dashboard/dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Unauthorized from './components/auth/Unauthorized';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container mt-4">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                
                {/* Supplier Routes */}
                <Route path="/suppliers" element={<SupplierList />} />
                <Route element={<ProtectedRoute requiredRoles={['admin', 'manager']} />}>
                  <Route path="/suppliers/new" element={<SupplierForm />} />
                  <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
                </Route>
                <Route path="/suppliers/:id" element={<SupplierDetails />} />
                
                {/* Product Routes */}
                <Route path="/products" element={<ProductList />} />
                <Route element={<ProtectedRoute requiredRoles={['admin', 'manager']} />}>
                  <Route path="/products/new" element={<ProductForm />} />
                  <Route path="/products/:id/edit" element={<ProductForm />} />
                </Route>
                <Route path="/products/:id" element={<ProductDetails />} />
                
                {/* Contact Routes */}
                <Route path="/contacts" element={<ContactList />} />
                <Route element={<ProtectedRoute requiredRoles={['admin', 'manager']} />}>
                  <Route path="/contacts/new" element={<ContactForm />} />
                  <Route path="/contacts/:id/edit" element={<ContactForm />} />
                </Route>
                <Route path="/contacts/:id" element={<ContactDetails />} />

                {/* Offer Routes */}
                <Route path="/offers" element={<OfferList />} />
                <Route element={<ProtectedRoute requiredRoles={['admin', 'manager']} />}>
                  <Route path="/offers/new" element={<OfferForm />} />
                  <Route path="/offers/:id/edit" element={<OfferForm />} />
                </Route>
                <Route path="/offers/:id" element={<OfferDetails />} />
                
                {/* Admin Routes */}
                <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;