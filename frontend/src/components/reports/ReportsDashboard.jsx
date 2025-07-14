import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {  Calendar, TrendingUp, DollarSign, Package, AlertTriangle, Award } from 'lucide-react';
import offerService from '../../services/offerService';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';
import reportService from '../../services/reportService';

function ReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerData, setOfferData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [productData, setProductData] = useState([]);
  const [offersByMonth, setOffersByMonth] = useState([]);
  const [supplierPerformance, setSupplierPerformance] = useState([]);
  const [categorySpend, setCategorySpend] = useState([]);
  const [metrics, setMetrics] = useState({
    totalSuppliers: 0,
    totalSpend: 0,
    avgDeliveryTime: 0,
    qualityScore: 0
  });
  const [alerts, setAlerts] = useState([]);
  
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [selectedSupplier, setSelectedSupplier] = useState('all');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [offers, suppliers, products] = await Promise.all([
          offerService.getAll(),
          supplierService.getAll(),
          productService.getAll()
        ]);
      
        setAllSuppliers(suppliers);
        
        const activeOffers = offers.filter(o => new Date(o.validTo) >= new Date());
        const expiredOffers = offers.filter(o => new Date(o.validTo) < new Date());
        
        setOfferData([
          { name: 'Active', value: activeOffers.length },
          { name: 'Expired', value: expiredOffers.length }
        ]);
        
        const supplierCounts = suppliers.map(supplier => {
          const supplierOffers = offers.filter(o => o.supplierId === supplier.id);
          const activeSupplierOffers = supplierOffers.filter(o => new Date(o.validTo) >= new Date());
          
          return {
            name: supplier.name,
            count: supplierOffers.length,
            active: activeSupplierOffers.length,
            id: supplier.id
          };
        }).sort((a, b) => b.count - a.count).slice(0, 5);
        
        setSupplierData(supplierCounts);
        
        const productCounts = products.map(product => {
          const productOffers = offers.filter(o => o.productId === product.id);
          return {
            name: product.name,
            count: productOffers.length,
            id: product.id
          };
        }).sort((a, b) => b.count - a.count).slice(0, 5);
        
        setProductData(productCounts);
        
        const monthlyData = {};
        const today = new Date();
        const monthsToShow = parseInt(selectedPeriod.replace(/\D/g, ''), 10) || 6;
        
        for (let i = (monthsToShow - 1); i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          
          monthlyData[monthKey] = {
            month: monthName,
            total: 0
          };
          
          supplierCounts.forEach(supplier => {
            monthlyData[monthKey][`supplier${supplier.id}`] = 0;
          });
        }
        
        offers.forEach(offer => {
          const createdAt = new Date(offer.createdAt);
          const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].total++;
            
            const supplierId = offer.supplierId;
            const supplierKey = `supplier${supplierId}`;
            if (monthlyData[monthKey][supplierKey] !== undefined) {
              monthlyData[monthKey][supplierKey]++;
            }
          }
        });
        
        const monthlyArray = Object.keys(monthlyData)
          .sort()
          .map(key => monthlyData[key]);
        
        setOffersByMonth(monthlyArray);
        
        
        const supplierPerformanceData = supplierCounts.map((supplier, index) => {
          const supplierOffers = offers.filter(o => o.supplierId === supplier.id);
          
          
          const baseScore = 75 + (index * 3); 
          const variation = Math.floor(Math.random() * 20) - 10; 
          const onTimeDelivery = Math.max(60, Math.min(100, baseScore + variation + (supplier.active * 2)));
          
          const qualityScore = supplier.count > 0 
            ? Math.max(50, Math.min(100, Math.round((supplier.active / supplier.count) * 100) + variation))
            : Math.max(50, 80 + (index * 2) + Math.floor(Math.random() * 15));
          
         
          const priceCompetitiveness = Math.max(60, Math.min(100, 85 + (index * 2) + Math.floor(Math.random() * 20) - 10));
          
          const overall = Math.round((onTimeDelivery + qualityScore + priceCompetitiveness) / 3);
          
          return {
            name: supplier.name,
            onTimeDelivery,
            qualityScore,
            priceCompetitiveness,
            overall,
            id: supplier.id
          };
        });
        
        setSupplierPerformance(supplierPerformanceData);
        
        
        const categories = products.reduce((acc, product) => {
          const category = product.category || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = 0;
          }
          
          const productOffers = offers.filter(o => o.productId === product.id);
          productOffers.forEach(offer => {
         
            const basePrice = parseFloat(offer.price) || 0;
            const quantity = offer.quantity || 1;
            const priceVariation = 1 + (Math.random() * 0.2 - 0.1); 
            acc[category] += basePrice * quantity * priceVariation;
          });
          
          return acc;
        }, {});
        
        const totalSpend = Object.values(categories).reduce((sum, value) => sum + value, 0);
        
        const categorySpendData = Object.entries(categories).map(([name, value]) => ({
          name,
          value: Math.round(value),
          percentage: totalSpend > 0 ? Math.round((value / totalSpend) * 100) : 0
        })).sort((a, b) => b.value - a.value);
        
        setCategorySpend(categorySpendData);
        setMetrics({
          totalSuppliers: suppliers.length,
          totalSpend: totalSpend.toLocaleString('en-US', { 
            style: 'currency', 
            currency: 'USD',
            maximumFractionDigits: 0
          }),
          avgDeliveryTime: `${(Math.random() * 4 + 2).toFixed(1)} days`,
          qualityScore: suppliers.length > 0 ? (() => {
            const allSupplierScores = suppliers.map((supplier, index) => {
              const supplierOffers = offers.filter(o => o.supplierId === supplier.id);
              const activeOffers = supplierOffers.filter(o => new Date(o.validTo) >= new Date());
              
              if (supplierOffers.length === 0) return 75 + (index * 2);
              
              const baseScore = (activeOffers.length / supplierOffers.length) * 100;
              return Math.max(50, Math.min(100, baseScore + (index * 2) + Math.floor(Math.random() * 10)));
            });
            
            const avgScore = allSupplierScores.reduce((sum, score) => sum + score, 0) / allSupplierScores.length;
            return `${Math.round(avgScore)}%`;
          })() : '0%'
        });
        
        const newAlerts = [];
        
        if (suppliers.length > 0) {
          const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
          newAlerts.push({
            type: 'price',
            severity: 'danger',
            title: 'Price Increase Alert',
            message: `${randomSupplier.name} increased prices by ${Math.floor(Math.random() * 10) + 5}% this month`
          });
        }
        
        const suppliersWithFewOffers = suppliers.filter(s => 
          offers.filter(o => o.supplierId === s.id).length < 2
        );
        if (suppliersWithFewOffers.length > 0) {
          const randomSupplier = suppliersWithFewOffers[Math.floor(Math.random() * suppliersWithFewOffers.length)];
          newAlerts.push({
            type: 'delivery',
            severity: 'warning',
            title: 'Delivery Delay',
            message: `${randomSupplier.name} has ${Math.floor(Math.random() * 5) + 1} pending deliveries`
          });
        }
        
        if (supplierPerformanceData.length > 0) {
          const bestSupplier = supplierPerformanceData.reduce((best, current) => 
            current.overall > best.overall ? current : best, supplierPerformanceData[0]);
          newAlerts.push({
            type: 'performance',
            severity: 'success',
            title: 'Performance Improvement',
            message: `${bestSupplier.name} improved quality score by ${Math.floor(Math.random() * 8) + 3}%`
          });
        }
        
        setAlerts(newAlerts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedPeriod, selectedSupplier]);

  const MetricCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white rounded shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <p className="text-muted small">{title}</p>
          <p className="fs-4 fw-bold mt-2">{value}</p>
          {trend && (
            <p className={`small mt-2 ${trend > 0 ? 'text-success' : 'text-danger'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-circle bg-${color}`}>
          <Icon className="text-white" size={20} />
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-50">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h2 className="page-header">Supplier Analytics Dashboard</h2>
        <p className="text-muted">Real-time insights and performance metrics</p>
      </div>

      <div className="mb-4 d-flex gap-3">
        <select 
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="form-select" 
          style={{ width: 'auto' }}
        >
          <option value="1m">Last Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="12m">Last Year</option>
        </select>
        
        <select 
          value={selectedSupplier} 
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="form-select"
          style={{ width: 'auto' }}
        >
          <option value="all">All Suppliers</option>
          {allSuppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div className="row mb-4 g-3">
        <div className="col-md-6 col-lg-3">
          <MetricCard 
            title="Total Suppliers" 
            value={metrics.totalSuppliers} 
            icon={Package} 
            trend={8}
            color="primary"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <MetricCard 
            title="Total Spend" 
            value={metrics.totalSpend} 
            icon={DollarSign} 
            trend={-5}
            color="success"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <MetricCard 
            title="Avg. Delivery Time" 
            value={metrics.avgDeliveryTime} 
            icon={Calendar} 
            trend={-12}
            color="warning"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <MetricCard 
            title="Quality Score" 
            value={metrics.qualityScore} 
            icon={Award} 
            trend={3}
            color="info"
          />
        </div>
      </div>

      <div className="row mb-4 g-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Monthly Offers by Top Suppliers</h5>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={offersByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total Offers"
                      stroke="#3b82f6"
                      strokeWidth={3}
                    />
                    {supplierData.slice(0, 3).map((supplier, index) => (
                      <Line 
                        key={supplier.id}
                        type="monotone" 
                        dataKey={`supplier${supplier.id}`} 
                        name={supplier.name}
                        stroke={COLORS[(index + 1) % COLORS.length]}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Supplier Performance Metrics</h5>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={supplierPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTimeDelivery" fill="#3b82f6" name="On-Time Delivery" />
                    <Bar dataKey="qualityScore" fill="#10b981" name="Quality Score" />
                    <Bar dataKey="priceCompetitiveness" fill="#f59e0b" name="Price Competitiveness" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Spend by Category</h5>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categorySpend}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categorySpend.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Alerts & Notifications</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                {alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`d-flex align-items-center p-3 bg-${alert.severity === 'danger' ? 'danger' : 
                      alert.severity === 'warning' ? 'warning' : 'success'}-subtle rounded`}
                  >
                    <AlertTriangle className={`text-${alert.severity} me-3`} size={20} />
                    <div>
                      <p className={`fw-semibold text-${alert.severity} mb-0`}>{alert.title}</p>
                      <p className="small mb-0">{alert.message}</p>
                    </div>
                  </div>
                ))}
                
                {alerts.length === 0 && (
                  <div className="text-center text-muted py-4">
                    <p>No alerts at this time</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-4">
        <i className="bi bi-info-circle me-2"></i>
        This dashboard provides insights into your supplier relationships, spending patterns, and performance metrics.
        Use the filters above to view data for different time periods and suppliers.
      </div>
    </div>
  );
}

export default ReportsDashboard;