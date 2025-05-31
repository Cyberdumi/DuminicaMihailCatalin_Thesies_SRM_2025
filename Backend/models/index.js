const Supplier = require('./Supplier');
const Product = require('./Product');
const Contact = require('./Contact');
const Offer = require('./Offer');
const User = require('./User');

Supplier.hasMany(Contact, { foreignKey: 'supplierId', as: 'contacts', onDelete: 'CASCADE' });
Contact.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

Supplier.hasMany(Offer, { foreignKey: 'supplierId', as: 'offers', onDelete: 'CASCADE' });
Offer.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

Product.hasMany(Offer, { foreignKey: 'productId', as: 'offers', onDelete: 'CASCADE' });
Offer.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  Supplier,
  Product,
  Contact,
  Offer,
  User
};