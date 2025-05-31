const { User, Supplier, Product, Contact, Offer } = require('../models');
const { Op } = require('sequelize');


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { username, email, role, isActive } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
   
    if (user.role === 'admin' && isActive === false) {
      const adminCount = await User.count({ 
        where: { 
          role: 'admin',
          isActive: true,
          id: { [Op.ne]: user.id }
        } 
      });
      
      if (adminCount === 0) {
        return res.status(400).json({ 
          message: 'Cannot deactivate the only active admin user' 
        });
      }
    }
    
    await user.update({
      username,
      email,
      role,
      isActive
    });
    
 
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
   
    if (user.role === 'admin') {
      const adminCount = await User.count({ 
        where: { 
          role: 'admin',
          id: { [Op.ne]: user.id }
        } 
      });
      
      if (adminCount === 0) {
        return res.status(400).json({ 
          message: 'Cannot delete the only admin user' 
        });
      }
    }
    
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};


exports.getSystemStats = async (req, res) => {
  try {
    const [
      userCount,
      activeUserCount,
      adminCount,
      managerCount,
      supplierCount,
      productCount,
      contactCount,
      offerCount,
      activeOfferCount
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: { role: 'admin' } }),
      User.count({ where: { role: 'manager' } }),
      Supplier.count(),
      Product.count(),
      Contact.count(),
      Offer.count(),
      Offer.count({ where: { validTo: { [Op.gt]: new Date() } } })
    ]);
    
    res.status(200).json({
      users: {
        total: userCount,
        active: activeUserCount,
        admins: adminCount,
        managers: managerCount,
        regularUsers: userCount - adminCount - managerCount
      },
      suppliers: supplierCount,
      products: productCount,
      contacts: contactCount,
      offers: {
        total: offerCount,
        active: activeOfferCount,
        expired: offerCount - activeOfferCount
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Error fetching system stats', error: error.message });
  }
};