# Supplier Relationship Management (SRM) System

## Project Overview

A comprehensive web-based Supplier Relationship Management system designed to streamline supplier interactions, track offers, manage products, and provide analytical insights for better business decision-making. The system features role-based access control, real-time analytics, and a modern responsive interface.

## 🏗️ Architecture

### System Architecture
```
Frontend (React.js) ↔ Backend API (Node.js/Express) ↔ Database (MySQL)
```

### Project Structure
```
SRM_Project/
├── frontend/                 # React.js application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── admin/       # Admin-specific components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── layout/      # Layout components (Navbar, etc.)
│   │   │   ├── offers/      # Offer management components
│   │   │   ├── products/    # Product management components
│   │   │   └── suppliers/   # Supplier management components
│   │   ├── context/         # React Context providers
│   │   ├── services/        # API service functions
│   │   └── utils/           # Utility functions
├── backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   └── app.js             # Express application entry point
└── README.md
```

## 🛠️ Technologies Used

### Backend Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **CORS Handling**: cors middleware
- **Request Parsing**: body-parser
- **Validation**: express-validator (if implemented)

### Frontend Technologies
- **Framework**: React.js (Create React App)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Framework**: Bootstrap 5
- **State Management**: React Context API
- **Icons**: Lucide React
- **Charts**: Recharts
- **Export Functionality**: 
  - jsPDF (PDF export)
  - react-csv (CSV export)
- **Styling**: Custom CSS with Bootstrap utilities

### Development Tools
- **Package Manager**: npm
- **Code Editor**: VS Code (recommended)
- **Database Management**: MySQL Workbench/phpMyAdmin
- **Version Control**: Git
- **Browser DevTools**: React Developer Tools



### Relationships
- **Supplier** → **Contacts** (One-to-Many)
- **Supplier** → **Offers** (One-to-Many)
- **Product** → **Offers** (One-to-Many)

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure Authentication**:
  - User registration with validation
  - Login with username/email and password
  - JWT-based session management
  - Automatic token refresh
- **Role-Based Access Control**:
  - Admin: Full system access
  - Manager: Limited administrative functions
  - User: Standard user capabilities
- **Security Features**:
  - Password encryption with bcrypt
  - Protected API routes
  - Session timeout handling
  - Secure logout functionality

### 📈 Dashboard & Analytics
- **Key Performance Indicators**:
  - Total suppliers count with active/inactive breakdown
  - Active offers tracking with expiration alerts
  - Monthly spend analysis and trends
  - Supplier performance metrics and ratings
- **Interactive Charts**:
  - Monthly spend trends (line chart)
  - Orders over time (bar chart)
  - Category distribution (pie chart)
  - Supplier performance comparison
- **Quick Actions**: 
  - Direct access to add suppliers, products, offers
  - Recent activity feed
  - Notifications and alerts

### 🏢 Supplier Management
- **Comprehensive Directory**:
  - Complete supplier listing with pagination
  - Advanced search and filtering capabilities
  - Sortable columns (name, email, phone, etc.)
- **Detailed Profiles**:
  - Supplier information management
  - Performance tracking and ratings
  - Historical data and trends
- **Associated Data**:
  - Contact management for each supplier
  - Offers history and current deals
  - Communication logs and notes
- **Supplier Operations**:
  - Add new suppliers with validation
  - Edit existing supplier information
  - Supplier status management
  - Bulk operations support

### 📦 Product Management
- **Product Catalog**:
  - Comprehensive product listing
  - Category-based organization
  - Search and filtering by multiple criteria
- **View Options**:
  - Grid view with product cards
  - List view with detailed information
  - Sortable and filterable tables
- **Product Operations**:
  - Add new products with categories
  - Edit product information
  - Product status management
  - Price history tracking
- **Analytics**:
  - Product performance metrics
  - Associated offers overview
  - Category analysis

### 👥 Contact Management
- **Contact Directory**:
  - Centralized contact management
  - Search and filtering capabilities
  - Contact role and position tracking
- **Supplier Integration**:
  - Contact-supplier associations
  - Multiple contacts per supplier
  - Contact hierarchy management
- **Communication**:
  - Contact information management
  - Communication history (if implemented)
  - Contact status tracking

### 💰 Offer Management
- **Offer Tracking**:
  - Comprehensive offer listing
  - Price offers with validity periods
  - Offer status (active/expired/pending)
  - Quantity and pricing details
- **Advanced Features**:
  - Multi-criteria filtering (supplier, product, date range, price)
  - Sorting by various parameters
  - Bulk operations on offers
  - Offer comparison tools
- **Export Capabilities**:
  - Export to CSV format
  - PDF generation with custom formatting
  - Filtered export options
- **Analytics**:
  - Price comparison across suppliers
  - Offer trends over time
  - Supplier pricing analysis

### 📊 Reporting & Analytics
- **Supplier Performance Dashboard**:
  - Performance ratings and metrics
  - Delivery performance tracking
  - Quality assessments
  - Cost effectiveness analysis
- **Financial Analytics**:
  - Spend analysis by category
  - Cost trends over time
  - Budget tracking and forecasting
  - Supplier cost comparison
- **Interactive Visualizations**:
  - Bar charts for category spending
  - Line graphs for trend analysis
  - Pie charts for distribution
  - Heat maps for performance metrics
- **Report Generation**:
  - Custom report builder
  - Scheduled report generation
  - Multiple export formats

### 👨‍💼 Admin Panel
- **User Management**:
  - Complete user directory
  - Add/edit/deactivate user accounts
  - Role assignment and permissions
  - User activity monitoring
- **System Administration**:
  - System statistics and monitoring
  - Application configuration
  - Data management tools
  - Backup and maintenance
- **Security Management**:
  - Access control management
  - Security audit logs
  - Permission management

### 🎨 User Interface Features
- **Responsive Design**: 
  - Mobile-first approach
  - Tablet and desktop optimization
  - Cross-browser compatibility
- **Modern UI Components**:
  - Bootstrap 5 with custom styling
  - Consistent design language
  - Accessible interface elements
- **Interactive Elements**:
  - Sortable and filterable tables
  - Advanced search functionality
  - Modal dialogs for forms
  - Dropdown menus and navigation
  - Tabbed interfaces
- **User Experience**:
  - Loading states and progress indicators
  - Error handling with user-friendly messages
  - Success notifications and feedback
  - Consistent navigation and breadcrumbs
  - Keyboard navigation support

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **npm** package manager
- **Git** for version control


## 🔗 API Endpoints

### Authentication Routes
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/logout      - User logout
GET  /api/auth/me          - Get current user info
PUT  /api/auth/profile     - Update user profile
```

### Supplier Routes
```
GET    /api/suppliers           - Get all suppliers
POST   /api/suppliers           - Create new supplier
GET    /api/suppliers/:id       - Get supplier by ID
PUT    /api/suppliers/:id       - Update supplier
DELETE /api/suppliers/:id       - Delete supplier
GET    /api/suppliers/:id/contacts - Get supplier contacts
GET    /api/suppliers/:id/offers   - Get supplier offers
```

### Product Routes
```
GET    /api/products        - Get all products
POST   /api/products        - Create new product
GET    /api/products/:id    - Get product by ID
PUT    /api/products/:id    - Update product
DELETE /api/products/:id    - Delete product
GET    /api/products/:id/offers - Get product offers
```

### Contact Routes
```
GET    /api/contacts        - Get all contacts
POST   /api/contacts        - Create new contact
GET    /api/contacts/:id    - Get contact by ID
PUT    /api/contacts/:id    - Update contact
DELETE /api/contacts/:id    - Delete contact
```

### Offer Routes
```
GET    /api/offers          - Get all offers
POST   /api/offers          - Create new offer
GET    /api/offers/:id      - Get offer by ID
PUT    /api/offers/:id      - Update offer
DELETE /api/offers/:id      - Delete offer
GET    /api/offers/export   - Export offers to CSV
```

### Admin Routes (Protected)
```
GET    /api/admin/users     - Get all users
POST   /api/admin/users     - Create new user
GET    /api/admin/users/:id - Get user by ID
PUT    /api/admin/users/:id - Update user
DELETE /api/admin/users/:id - Delete user
GET    /api/admin/stats     - Get system statistics
```

### Analytics Routes
```
GET /api/analytics/dashboard     - Get dashboard data
GET /api/analytics/suppliers     - Get supplier analytics
GET /api/analytics/spending      - Get spending analytics
GET /api/analytics/performance   - Get performance metrics
```

## 📱 Usage Guide

### Getting Started
1. **Registration/Login**: 
   - Create an account or login with existing credentials
   - Admin accounts have full access to all features

2. **Dashboard Overview**: 
   - View key metrics and recent activity
   - Access quick actions for common tasks
   - Monitor system health and performance

### Core Workflows

#### Supplier Management
1. Navigate to Suppliers section
2. Add new suppliers with contact information
3. Manage supplier details and status
4. Track supplier performance and history

#### Product Catalog
1. Access Products section
2. Organize products by categories
3. Maintain product information and pricing
4. Track product performance and offers

#### Offer Tracking
1. Navigate to Offers section
2. Create and manage price offers
3. Set validity periods and quantities
4. Export offers for analysis

#### Reporting
1. Access Reports section
2. Generate custom reports
3. Analyze supplier performance
4. Export data for external use

### Admin Functions
1. **User Management**:
   - Add new users with appropriate roles
   - Manage user permissions and access
   - Monitor user activity

2. **System Configuration**:
   - Configure system settings
   - Manage data integrity
   - Monitor system performance

## 🔧 Configuration

### Database Configuration
- Ensure MySQL is running on the specified port
- Create the database with appropriate permissions
- Run any migration scripts if available

### Security Configuration
- Use strong JWT secrets in production
- Configure CORS for your domain
- Implement HTTPS in production environment

### Performance Optimization
- Enable database indexing for frequently queried fields
- Configure caching for static assets
- Optimize API response times

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Run tests to ensure functionality
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Code Standards
- Follow React and Node.js best practices
- Use consistent naming conventions
- Comment complex logic
- Write unit tests for new features
- Ensure responsive design compatibility



## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Author

**Duminica Mihail Catalin**  
*SRM Thesis Project 2025*  
*Student at [Your University Name]*

### Contact Information
- Email: [your.email@example.com]
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [Your GitHub Profile]




## 🔄 Version History

### v1.0.0 (Current)
- Initial release with core functionality
- User authentication and authorization
- Supplier, Product, Contact, and Offer management
- Dashboard with analytics
- Admin panel for user management
- Responsive UI with Bootstrap 5

### Planned Features
- Mobile application
- Advanced reporting tools
- Integration with external APIs
- Real-time notifications
- Advanced analytics and ML insights

---

*This project represents a comprehensive solution for supplier relationship management, designed to streamline business processes and provide valuable insights for better decision-making.*