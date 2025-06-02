import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import offerService from '../../services/offerService';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function ReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerData, setOfferData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [offersByMonth, setOffersByMonth] = useState([]);
  const [reportType, setReportType] = useState('offers');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offers, suppliers, products] = await Promise.all([
          offerService.getAll(),
          supplierService.getAll(),
          productService.getAll()
        ]);
        
        const activeOffers = offers.filter(o => new Date(o.validTo) >= new Date());
        const expiredOffers = offers.filter(o => new Date(o.validTo) < new Date());
        
        setOfferData([
          { name: 'Active', value: activeOffers.length },
          { name: 'Expired', value: expiredOffers.length }
        ]);
        
        const supplierCounts = suppliers.map(supplier => {
          const supplierOffers = offers.filter(o => o.supplierId === supplier.id);
          return {
            name: supplier.name,
            count: supplierOffers.length
          };
        }).sort((a, b) => b.count - a.count).slice(0, 5); 
        
        setSupplierData(supplierCounts);
        
        const productCounts = products.map(product => {
          const productOffers = offers.filter(o => o.productId === product.id);
          return {
            name: product.name,
            count: productOffers.length
          };
        }).sort((a, b) => b.count - a.count).slice(0, 5); 
        
        setProductData(productCounts);
        
        const monthlyData = {};
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthName = date.toLocaleString('default', { month: 'short' });
          monthlyData[monthName] = 0;
        }
        
        offers.forEach(offer => {
          const createdAt = new Date(offer.createdAt);
          if (createdAt >= new Date(today.getFullYear(), today.getMonth() - 5, 1)) {
            const monthName = createdAt.toLocaleString('default', { month: 'short' });
            if (monthlyData[monthName] !== undefined) {
              monthlyData[monthName]++;
            }
          }
        });
        
        const monthlyArray = Object.keys(monthlyData).map(month => ({
          name: month,
          offers: monthlyData[month]
        }));
        
        setOffersByMonth(monthlyArray);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="fade-in">
      <h2 className="page-header mb-4">Advanced Reports</h2>
      
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${reportType === 'offers' ? 'active' : ''}`} 
                onClick={() => setReportType('offers')}
              >
                Offers Status
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${reportType === 'suppliers' ? 'active' : ''}`} 
                onClick={() => setReportType('suppliers')}
              >
                Top Suppliers
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${reportType === 'products' ? 'active' : ''}`} 
                onClick={() => setReportType('products')}
              >
                Top Products
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${reportType === 'monthly' ? 'active' : ''}`} 
                onClick={() => setReportType('monthly')}
              >
                Monthly Trend
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          <div style={{ width: '100%', height: 400 }}>
            {reportType === 'offers' && (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={offerData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {offerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {reportType === 'suppliers' && (
              <ResponsiveContainer>
                <BarChart
                  data={supplierData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Offers" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {reportType === 'products' && (
              <ResponsiveContainer>
                <BarChart
                  data={productData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Offers" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {reportType === 'monthly' && (
              <ResponsiveContainer>
                <LineChart
                  data={offersByMonth}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="offers" name="New Offers" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        These reports provide insights into your supplier relationships and offer trends. Use the tabs above to switch between different report types.
      </div>
    </div>
  );
}

export default ReportsDashboard;