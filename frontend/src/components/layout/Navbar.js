import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Building2,Package,Users,FileText,BarChart2,Shield,User,LogOut,LogIn, UserPlus,ChevronDown,Menu,Home,Settings, Bell} from 'lucide-react';

function Navbar() {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount] = useState(2); 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
   
    document.body.style.paddingTop = '72px';
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.paddingTop = '0';
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark bg-primary fixed-top ${scrolled ? 'shadow' : ''}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
            <Home size={18} className="text-primary" />
          </div>
          <span className="fw-bold">SRM Platform</span>
        </Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <Menu size={24} />
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav me-auto">
                <li className="nav-item mx-1">
                  <Link 
                    className={`nav-link d-flex align-items-center px-3 py-2 ${isActive('/suppliers') ? 'active bg-primary bg-opacity-25 rounded' : ''}`} 
                    to="/suppliers"
                  >
                    <Building2 size={18} className="me-2" />
                    <span>Suppliers</span>
                  </Link>
                </li>
                <li className="nav-item mx-1">
                  <Link 
                    className={`nav-link d-flex align-items-center px-3 py-2 ${isActive('/products') ? 'active bg-primary bg-opacity-25 rounded' : ''}`} 
                    to="/products"
                  >
                    <Package size={18} className="me-2" />
                    <span>Products</span>
                  </Link>
                </li>
                <li className="nav-item mx-1">
                  <Link 
                    className={`nav-link d-flex align-items-center px-3 py-2 ${isActive('/contacts') ? 'active bg-primary bg-opacity-25 rounded' : ''}`} 
                    to="/contacts"
                  >
                    <Users size={18} className="me-2" />
                    <span>Contacts</span>
                  </Link>
                </li>
                <li className="nav-item mx-1">
                  <Link 
                    className={`nav-link d-flex align-items-center px-3 py-2 ${isActive('/offers') ? 'active bg-primary bg-opacity-25 rounded' : ''}`} 
                    to="/offers"
                  >
                    <FileText size={18} className="me-2" />
                    <span>Offers</span>
                  </Link>
                </li>
                <li className="nav-item mx-1">
                  <Link 
                    className={`nav-link d-flex align-items-center px-3 py-2 ${isActive('/reports') ? 'active bg-primary bg-opacity-25 rounded' : ''}`} 
                    to="/reports"
                  >
                    <BarChart2 size={18} className="me-2" />
                    <span>Reports</span>
                  </Link>
                </li>
                {currentUser?.role === 'admin' && (
                  <li className="nav-item mx-1">
                    <Link 
                      className={`nav-link d-flex align-items-center px-3 py-2 ${isActive('/admin') ? 'active bg-primary bg-opacity-25 rounded' : ''}`} 
                      to="/admin"
                    >
                      <Shield size={18} className="me-2" />
                      <span>Admin</span>
                    </Link>
                  </li>
                )}
              </ul>
              
              <ul className="navbar-nav ms-auto d-flex align-items-center">
                <li className="nav-item me-2">
                  <a href="#" className="nav-link position-relative">
                    <Bell size={20} />
                    {notificationCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {notificationCount}
                        <span className="visually-hidden">unread notifications</span>
                      </span>
                    )}
                  </a>
                </li>
                
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle d-flex align-items-center" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    <div className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                      <span className="fw-bold">{currentUser?.username?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span>{currentUser?.username}</span>
                    <ChevronDown size={16} className="ms-1" />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" aria-labelledby="navbarDropdown">
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
                      <button className="dropdown-item d-flex align-items-center py-2" onClick={handleLogout}>
                        <LogOut size={16} className="me-2 text-primary" />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </>
          ) : (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item mx-1">
                <Link 
                  className={`nav-link d-flex align-items-center px-3 py-2 ${isActive('/login') ? 'active bg-primary bg-opacity-25 rounded' : ''}`} 
                  to="/login"
                >
                  <LogIn size={18} className="me-2" />
                  <span>Login</span>
                </Link>
              </li>
              <li className="nav-item mx-1">
                <Link 
                  className={`nav-link d-flex align-items-center px-3 py-2 ${isActive('/register') ? 'active bg-primary bg-opacity-25 rounded' : ''}`} 
                  to="/register"
                >
                  <UserPlus size={18} className="me-2" />
                  <span>Register</span>
                </Link>
              </li>
              <li className="nav-item mx-1">
                <Link 
                  className={`nav-link d-flex align-items-center px-3 py-2 ${isActive('/reports') ? 'active bg-primary bg-opacity-25 rounded' : ''}`} 
                  to="/reports"
                >
                  <BarChart2 size={18} className="me-2" />
                  <span>Reports</span>
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