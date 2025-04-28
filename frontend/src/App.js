import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/layout/Navbar';
import SupplierList from './components/suppliers/SupplierList';
import SupplierDetails from './components/suppliers/SupplierDetails';
import SupplierForm from './components/suppliers/SupplierForm';


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<h1>Welcome to SRM</h1>} />
            
        
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/suppliers/new" element={<SupplierForm />} />
            <Route path="/suppliers/:id" element={<SupplierDetails />} />
            <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
            
        
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;