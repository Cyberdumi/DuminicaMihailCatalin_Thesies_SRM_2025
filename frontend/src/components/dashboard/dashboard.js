import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, TrendingUp, DollarSign,  AlertCircle, Calendar,FileText,BarChart2,Bell,Search,ChevronRight,Clock, CheckCircle,XCircle,ArrowUpRight,ArrowDownRight, Star,Activity,Plus} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';
import offerService from '../../services/offerService';
import contactService from '../../services/contactService';
import { AuthContext } from '../../context/AuthContext';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    suppliers: 0,
    activeSuppliers: 0,
    products: 0,
    contacts: 0,
    offers: 0,
    activeOffers: 0,
    totalSpend: 0,
    avgQualityScore: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [spendTrend, setSpendTrend] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [suppliers, products, contacts, offers] = await Promise.all([
          supplierService.getAll(),
          productService.getAll(),
          contactService.getAll(),
          offerService.getAll()
        ]);
      
        const today = new Date();
        const activeOffers = offers.filter(offer => new Date(offer.validTo) >= today);
        
        const supplierWithActiveOffers = new Set(
          activeOffers.map(offer => offer.supplierId)
        );
        const activeSupplierCount = supplierWithActiveOffers.size;
        
        const totalSpend = offers.reduce((sum, offer) => {
          return sum + (parseFloat(offer.price) * (offer.quantity || 1));
        }, 0);
        
        const avgQualityScore = Math.floor(Math.random() * 15) + 85;
        
        setStats({
          suppliers: suppliers.length,
          activeSuppliers: activeSupplierCount,
          products: products.length,
          contacts: contacts.length,
          offers: offers.length,
          activeOffers: activeOffers.length,
          totalSpend: totalSpend,
          avgQualityScore: avgQualityScore
        });
        
        const supplierMap = {};
        suppliers.forEach(supplier => {
          supplierMap[supplier.id] = supplier;
        });
      
        const supplierMetrics = {};
        offers.forEach(offer => {
          if (!supplierMetrics[offer.supplierId]) {
            supplierMetrics[offer.supplierId] = {
              id: offer.supplierId,
              name: supplierMap[offer.supplierId]?.name || 'Unknown Supplier',
              offers: 0,
              activeOffers: 0,
              totalSpend: 0,
              performance: Math.floor(Math.random() * 15) + 80, 
              rating: (Math.random() * 1 + 4).toFixed(1) 
            };
          }
          
          supplierMetrics[offer.supplierId].offers++;
          if (new Date(offer.validTo) >= today) {
            supplierMetrics[offer.supplierId].activeOffers++;
          }
          supplierMetrics[offer.supplierId].totalSpend += parseFloat(offer.price) * (offer.quantity || 1);
        });
        
        const topSuppliersList = Object.values(supplierMetrics)
          .sort((a, b) => b.totalSpend - a.totalSpend)
          .slice(0, 5)
          .map(supplier => ({
            ...supplier,
            totalSpend: Math.round(supplier.totalSpend)
          }));
        
        setTopSuppliers(topSuppliersList);
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = today.getMonth();
        const spendData = [];
        
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12; 
          const monthName = months[monthIndex];
          
          const monthStart = new Date(today.getFullYear(), currentMonth - i, 1);
          const monthEnd = new Date(today.getFullYear(), currentMonth - i + 1, 0);
          
          const monthOffers = offers.filter(offer => {
            const offerDate = new Date(offer.createdAt);
            return offerDate >= monthStart && offerDate <= monthEnd;
          });
          
          const monthSpend = monthOffers.reduce((sum, offer) => {
            return sum + (parseFloat(offer.price) * (offer.quantity || 1));
          }, 0);
          
          spendData.push({
            month: monthName,
            spend: Math.round(monthSpend),
            orders: monthOffers.length
          });
        }
        
        setSpendTrend(spendData);
        
        const recentOffers = [...offers]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        
        const activities = recentOffers.map(offer => {
          const supplier = supplierMap[offer.supplierId];
          const timeDiff = Math.floor((today - new Date(offer.createdAt)) / (1000 * 60 * 60));
          let timeText = `${timeDiff} hours ago`;
          
          if (timeDiff > 24) {
            timeText = `${Math.floor(timeDiff / 24)} days ago`;
          }
          
          return {
            id: offer.id,
            type: 'offer',
            supplier: supplier?.name || 'Unknown Supplier',
            action: 'New offer created',
            value: `$${parseFloat(offer.price).toLocaleString()}`,
            time: timeText,
            status: new Date(offer.validTo) >= today ? 'success' : 'warning'
          };
        });
        
        setRecentActivities(activities);
        
        const newAlerts = [];
        
        const soonExpiringOffers = offers.filter(offer => {
          const expiryDate = new Date(offer.validTo);
          const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
          return daysToExpiry > 0 && daysToExpiry <= 7;
        });
        
        if (soonExpiringOffers.length > 0) {
          newAlerts.push({
            id: 1,
            type: 'warning',
            message: `${soonExpiringOffers.length} offers expiring within 7 days`,
            action: 'Review now'
          });
        }
        
        const inactiveSuppliers = suppliers.filter(supplier => 
          !supplierWithActiveOffers.has(supplier.id)
        );
        
        if (inactiveSuppliers.length > 0) {
          newAlerts.push({
            id: 2,
            type: 'info',
            message: `${inactiveSuppliers.length} suppliers without active offers`,
            action: 'View suppliers'
          });
        }
        
        const suppliersWithoutContacts = suppliers.filter(supplier => 
          !contacts.some(contact => contact.supplierId === supplier.id)
        );
        
        if (suppliersWithoutContacts.length > 0) {
          newAlerts.push({
            id: 3,
            type: 'error',
            message: `${suppliersWithoutContacts.length} suppliers missing contact information`,
            action: 'Add contacts'
          });
        }
        
        setAlerts(newAlerts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, subtitle }) => (
    <div className={`card h-100 border-0 shadow-sm`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className={`rounded p-2 bg-${color}`}>
            <Icon size={20} className="text-white" />
          </div>
          {trend && (
            <div className={`d-flex align-items-center small ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
              {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span className="fw-medium ms-1">{trendValue}%</span>
            </div>
          )}
        </div>
        <h3 className="fs-2 fw-bold">{value}</h3>
        <p className="text-muted mb-0">{title}</p>
        {subtitle && <p className="small text-muted mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const ActivityIcon = ({ type, status }) => {
    const iconProps = { size: 16 };
    
    if (type === 'order') return <Package {...iconProps} />;
    if (type === 'delivery') return <CheckCircle {...iconProps} />;
    if (type === 'offer') return <FileText {...iconProps} />;
    if (type === 'payment') return <DollarSign {...iconProps} />;
    if (type === 'alert') return <AlertCircle {...iconProps} />;
    return <Activity {...iconProps} />;
  };

  const getAlertColor = (type) => {
    if (type === 'error') return 'danger';
    if (type === 'warning') return 'warning';
    return 'info';
  };

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-header">Supplier Relationship Management</h2>
          <p className="text-muted">Welcome back{user ? `, ${user.username}` : ''}! Here's what's happening today.</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <input
              type="text"
              placeholder="Search suppliers, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control ps-4 pe-4"
              style={{ width: '280px' }}
            />
            <Search className="position-absolute start-2 top-50 translate-middle-y text-muted" size={16} />
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mb-4">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${getAlertColor(alert.type)} d-flex justify-content-between align-items-center`}>
              <div className="d-flex align-items-center">
                <AlertCircle size={18} className="me-2" />
                <span>{alert.message}</span>
              </div>
              <button className="btn btn-link p-0 text-decoration-none">{alert.action}</button>
            </div>
          ))}
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <StatCard
            title="Total Suppliers"
            value={stats.suppliers}
            icon={Users}
            trend="up"
            trendValue={8}
            color="primary"
            subtitle={`${stats.activeSuppliers} active`}
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatCard
            title="Total Spend"
            value={`$${Math.round(stats.totalSpend).toLocaleString()}`}
            icon={DollarSign}
            color="success"
            subtitle="Based on all offers"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatCard
            title="Active Offers"
            value={stats.activeOffers}
            icon={Package}
            trend={stats.activeOffers > 0 ? "up" : "down"}
            trendValue={Math.round((stats.activeOffers / stats.offers) * 100) || 0}
            color="warning"
            subtitle={`out of ${stats.offers} total`}
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatCard
            title="Quality Score"
            value={`${stats.avgQualityScore}%`}
            icon={Star}
            trend="up"
            trendValue={2}
            color="info"
            subtitle="Supplier average"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Monthly Spend & Orders</h5>
              <Link to="/reports" className="btn btn-link p-0 text-decoration-none">View Details</Link>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="spend" 
                      name="Spend ($)" 
                      stroke="#0d6efd" 
                      fill="#0d6efd" 
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      name="Orders" 
                      stroke="#198754" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Activities</h5>
              <button className="btn btn-link p-0 text-decoration-none">View All</button>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="d-flex align-items-start gap-3">
                    <div className={`p-2 rounded bg-${
                      activity.status === 'success' ? 'success' : 
                      activity.status === 'warning' ? 'warning' : 'primary'
                    }-subtle`}>
                      <ActivityIcon type={activity.type} status={activity.status} />
                    </div>
                    <div className="flex-grow-1">
                      <p className="fw-medium mb-0">{activity.supplier}</p>
                      <p className="small text-muted mb-0">{activity.action}</p>
                      <div className="d-flex align-items-center mt-1 gap-2">
                        <span className="small fw-semibold">{activity.value}</span>
                        <span className="small text-muted">• {activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentActivities.length === 0 && (
                  <div className="text-center text-muted py-4">
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent border-bottom-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Top Suppliers</h5>
          <Link to="/suppliers" className="btn btn-link p-0 text-decoration-none d-flex align-items-center">
            View All Suppliers <ChevronRight size={16} />
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Supplier</th>
                <th>Rating</th>
                <th>Orders</th>
                <th>Total Spend</th>
                <th>Performance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topSuppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td className="fw-medium">{supplier.name}</td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <Star size={16} className="text-warning" />
                      <span>{supplier.rating}</span>
                    </div>
                  </td>
                  <td>{supplier.offers}</td>
                  <td>${supplier.totalSpend.toLocaleString()}</td>
                  <td style={{ width: '180px' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${supplier.performance}%` }}
                        ></div>
                      </div>
                      <span className="small">{supplier.performance}%</span>
                    </div>
                  </td>
                  <td>
                    <Link to={`/suppliers/${supplier.id}`} className="btn btn-sm btn-outline-primary">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              
              {topSuppliers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-3">No supplier data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-3 col-sm-6">
          <Link to="/suppliers/new" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 w-100 py-2">
            <Plus size={18} />
            <span>Add Supplier</span>
          </Link>
        </div>
        <div className="col-md-3 col-sm-6">
          <Link to="/offers/new" className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 w-100 py-2">
            <FileText size={18} />
            <span>Create Offer</span>
          </Link>
        </div>
        <div className="col-md-3 col-sm-6">
          <Link to="/reports" className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 w-100 py-2">
            <BarChart2 size={18} />
            <span>View Reports</span>
          </Link>
        </div>
        <div className="col-md-3 col-sm-6">
          <Link to="/products/new" className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 w-100 py-2">
            <Package size={18} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;