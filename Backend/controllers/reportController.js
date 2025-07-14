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

exports.getSupplierPerformance = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      include: [{
        model: Offer,
        as: 'offers'
      }]
    });
    
    const performance = suppliers.map(supplier => {
      
      const offers = supplier.offers || [];
      const activeOffers = offers.filter(o => new Date(o.validTo) >= new Date());
      
      return {
        id: supplier.id,
        name: supplier.name,
        onTimeDelivery: Math.floor(Math.random() * 15) + 85, 
        qualityScore: offers.length > 0 ? Math.round((activeOffers.length / offers.length) * 100) : 0,
        priceCompetitiveness: Math.floor(Math.random() * 15) + 85, 
        overall: Math.floor(Math.random() * 10) + 85 
      };
    });
    
    res.status(200).json(performance);
  } catch (error) {
    console.error('Error fetching supplier performance:', error);
    res.status(500).json({ message: 'Error fetching supplier performance', error: error.message });
  }
};

exports.getCategorySpend = async (req, res) => {
  try {

    const products = await Product.findAll({
      include: [{
        model: Offer,
        as: 'offers'
      }]
    });
    
    const categories = {};
    let totalSpend = 0;
    
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = 0;
      }
      
      const offers = product.offers || [];
      offers.forEach(offer => {
        const value = parseFloat(offer.price) * (offer.quantity || 1);
        categories[category] += value;
        totalSpend += value;
      });
    });
    
    const result = Object.entries(categories).map(([name, value]) => ({
      name,
      value: Math.round(value),
      percentage: Math.round((value / totalSpend) * 100)
    }));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching category spend:', error);
    res.status(500).json({ message: 'Error fetching category spend', error: error.message });
  }
};