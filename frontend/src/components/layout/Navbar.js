import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Building2,Package,Users,FileText,BarChart2,Shield,User,LogOut,LogIn,UserPlus,ChevronDown,Menu,Home,Settings,Bell,Briefcase,DollarSign,Calendar} from 'lucide-react';

function Navbar() {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(2);
  
  useEffect(() => {
    
    document.body.style.paddingTop = '56px'; 
    
  
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark bg-primary fixed-top ${scrolled ? 'shadow' : ''}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <Building2 size={24} className="me-2" />
          <span className="fw-bold">SRM System</span>
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={mobileMenuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
        
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActive('/') ? 'active' : ''}`} 
                    to="/"
                  >
                    <Home size={18} className="me-2" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActive('/suppliers') ? 'active' : ''}`} 
                    to="/suppliers"
                  >
                    <Briefcase size={18} className="me-2" />
                    <span>Suppliers</span>
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActive('/products') ? 'active' : ''}`} 
                    to="/products"
                  >
                    <Package size={18} className="me-2" />
                    <span>Products</span>
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActive('/contacts') ? 'active' : ''}`} 
                    to="/contacts"
                  >
                    <Users size={18} className="me-2" />
                    <span>Contacts</span>
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActive('/offers') ? 'active' : ''}`} 
                    to="/offers"
                  >
                    <DollarSign size={18} className="me-2" />
                    <span>Offers</span>
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className={`nav-link d-flex align-items-center ${isActive('/reports') ? 'active' : ''}`} 
                    to="/reports"
                  >
                    <BarChart2 size={18} className="me-2" />
                    <span>Reports</span>
                  </Link>
                </li>
                
                {currentUser?.role === 'admin' && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link d-flex align-items-center ${isActive('/admin') ? 'active' : ''}`} 
                      to="/admin"
                    >
                      <Shield size={18} className="me-2" />
                      <span>Admin</span>
                    </Link>
                  </li>
                )}
              </ul>
              
              <ul className="navbar-nav ms-auto d-flex align-items-center">
                <li className="nav-item dropdown me-2">
                  <a 
                    className="nav-link position-relative" 
                    href="#" 
                    role="button" 
                    id="notificationsDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <Bell size={20} />
                    {notificationCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {notificationCount}
                        <span className="visually-hidden">unread notifications</span>
                      </span>
                    )}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" style={{ minWidth: '280px' }}>
                    <li className="px-3 py-2 d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Notifications</h6>
                      <span className="badge bg-primary rounded-pill">{notificationCount}</span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <a className="dropdown-item py-2" href="#">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 bg-light rounded-circle p-2">
                            <Package size={16} className="text-primary" />
                          </div>
                          <div className="ms-3">
                            <div className="text-dark">New product added</div>
                            <div className="small text-muted">5 minutes ago</div>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item py-2" href="#">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 bg-light rounded-circle p-2">
                            <Calendar size={16} className="text-primary" />
                          </div>
                          <div className="ms-3">
                            <div className="text-dark">Offer expiring soon</div>
                            <div className="small text-muted">1 hour ago</div>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <a className="dropdown-item text-center small text-primary" href="#">
                        View all notifications
                      </a>
                    </li>
                  </ul>
                </li>
                
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle d-flex align-items-center" 
                    href="#" 
                    role="button" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <div className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                      <span className="fw-bold">{currentUser?.username?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="d-none d-md-inline">{currentUser?.username}</span>
                    <ChevronDown size={16} className="ms-1" />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" aria-labelledby="userDropdown">
                    <li className="px-3 py-1 text-muted small">
                      <div>Signed in as</div>
                      <div className="fw-bold">{currentUser?.email || currentUser?.username}</div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center py-2" to="/profile">
                        <User size={16} className="me-2 text-primary" />
                        <span>Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center py-2" to="/settings">
                        <Settings size={16} className="me-2 text-primary" />
                        <span>Settings</span>
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item d-flex align-items-center py-2" 
                        onClick={handleLogout}
                        type="button"
                      >
                        <LogOut size={16} className="me-2 text-primary" />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </li>
                
                <li className="nav-item ms-2 d-none d-lg-block">
                  <button 
                    className="btn btn-outline-light btn-sm d-flex align-items-center" 
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut size={16} className="me-1" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </>
          ) : (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center" to="/login">
                  <LogIn size={18} className="me-2" />
                  <span>Login</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-outline-light btn-sm d-flex align-items-center" to="/register">
                  <UserPlus size={16} className="me-1" />
                  <span>Register</span>
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;