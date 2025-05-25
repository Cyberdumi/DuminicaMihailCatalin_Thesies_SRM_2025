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

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Supplier Routes */}
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/suppliers/new" element={<SupplierForm />} />
            <Route path="/suppliers/:id" element={<SupplierDetails />} />
            <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
            
            {/* Product Routes */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            
            {/* Contact Routes */}
            <Route path="/contacts" element={<ContactList />} />
            <Route path="/contacts/new" element={<ContactForm />} />
            <Route path="/contacts/:id" element={<ContactDetails />} />
            <Route path="/contacts/:id/edit" element={<ContactForm />} />

            {/* Offer Routes */}
            <Route path="/offers" element={<OfferList />} />
            <Route path="/offers/new" element={<OfferForm />} />
            <Route path="/offers/:id" element={<OfferDetails />} />
            <Route path="/offers/:id/edit" element={<OfferForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;