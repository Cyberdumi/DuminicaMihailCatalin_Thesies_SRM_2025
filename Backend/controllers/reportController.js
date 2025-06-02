const { Supplier, Product, Contact, Offer } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.getSummaryReport = async (req, res) => {
  try {
    const [supplierCount, productCount, contactCount, offerCount] = await Promise.all([
      Supplier.count(),
      Product.count(),
      Contact.count(),
      Offer.count()
    ]);


    const activeOfferCount = await Offer.count({
      where: {
        validTo: { [Op.gte]: new Date() }
      }
    });

    const topSuppliers = await Supplier.findAll({
      attributes: [
        'id',
        'name',
        [sequelize.fn('COUNT', sequelize.col('offers.id')), 'offerCount']
      ],
      include: [{
        model: Offer,
        as: 'offers',
        attributes: []
      }],
      group: ['Supplier.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('offers.id')), 'DESC']],
      limit: 5
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    
    const offersByMonth = await Offer.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']]
    });

    res.status(200).json({
      counts: {
        suppliers: supplierCount,
        products: productCount,
        contacts: contactCount,
        offers: offerCount,
        activeOffers: activeOfferCount
      },
      topSuppliers,
      offersByMonth
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

exports.getOffersReport = async (req, res) => {
  try {
    const { 
      supplierId, 
      productId, 
      dateFrom, 
      dateTo, 
      status
    } = req.query;

    let whereClause = {};
    
    if (supplierId) whereClause.supplierId = supplierId;
    if (productId) whereClause.productId = productId;
    
    if (dateFrom) {
      whereClause.validFrom = whereClause.validFrom || {};
      whereClause.validFrom[Op.gte] = new Date(dateFrom);
    }
    
    if (dateTo) {
      whereClause.validTo = whereClause.validTo || {};
      whereClause.validTo[Op.lte] = new Date(dateTo);
    }
    
    if (status === 'active') {
      whereClause.validTo = { [Op.gte]: new Date() };
    } else if (status === 'expired') {
      whereClause.validTo = { [Op.lt]: new Date() };
    }

    const offers = await Offer.findAll({
      where: whereClause,
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'category'] }
      ],
      order: [['validTo', 'DESC']]
    });

    res.status(200).json(offers);
  } catch (error) {
    console.error('Error generating offers report:', error);
    res.status(500).json({ message: 'Error generating offers report', error: error.message });
  }
};