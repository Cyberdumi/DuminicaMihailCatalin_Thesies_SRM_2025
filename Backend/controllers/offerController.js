const Offer = require('../models/Offer');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const { Op } = require("sequelize");


exports.getAllOffers = async (req, res) => {
    try {
       
        const { supplierId, productId, active, sortBy = 'createdAt', order = 'DESC' } = req.query;
        let whereClause = {};
        if (supplierId) whereClause.supplierId = supplierId;
        if (productId) whereClause.productId = productId;
        if (active === 'true') {
            whereClause.validFrom = { [Op.lte]: new Date() }; 
            whereClause.validTo = { [Op.gte]: new Date() };  
        } else if (active === 'false') {
             whereClause = {
                 ...whereClause,
                [Op.or]: [
                    { validFrom: { [Op.gt]: new Date() } }, 
                    { validTo: { [Op.lt]: new Date() } }    
                ]
             }
        }

        const offers = await Offer.findAll({
            where: whereClause,
            include: [
                { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
                { model: Product, as: 'product', attributes: ['id', 'name', 'unitOfMeasure'] }
            ],
            order: [[sortBy, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']]
        });
        res.status(200).json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offers', error: error.message });
    }
};


exports.getOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findByPk(id, {
             include: [
                { model: Supplier, as: 'supplier' }, 
                { model: Product, as: 'product' }
            ]
        });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json(offer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offer', error: error.message });
    }
};


exports.createOffer = async (req, res) => {
    try {
        const { price, validFrom, validTo, supplierId, productId } = req.body;
        if (!price || !validFrom || !validTo || !supplierId || !productId) {
             return res.status(400).json({ message: 'Price, validFrom, validTo, supplierId, and productId are required' });
        }

        const supplier = await Supplier.findByPk(supplierId);
        const product = await Product.findByPk(productId);
        if (!supplier) return res.status(400).json({ message: `Supplier with ID ${supplierId} not found.` });
        if (!product) return res.status(400).json({ message: `Product with ID ${productId} not found.` });

        const newOffer = await Offer.create(req.body);
        
        const createdOfferDetails = await Offer.findByPk(newOffer.id, {
             include: [
                { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
                { model: Product, as: 'product', attributes: ['id', 'name'] }
            ]
        });
        res.status(201).json(createdOfferDetails);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
         if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ message: 'Invalid supplierId or productId provided.', error: error.message });
        }
        res.status(500).json({ message: 'Error creating offer', error: error.message });
    }
};


exports.updateOffer = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.body.supplierId) {
            const supplier = await Supplier.findByPk(req.body.supplierId);
            if (!supplier) return res.status(400).json({ message: `Supplier with ID ${req.body.supplierId} not found.` });
        }
         if (req.body.productId) {
            const product = await Product.findByPk(req.body.productId);
            if (!product) return res.status(400).json({ message: `Product with ID ${req.body.productId} not found.` });
        }

        const [updated] = await Offer.update(req.body, { where: { id: id } });
        if (updated) {
            const updatedOffer = await Offer.findByPk(id, {
                include: [
                    { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
                    { model: Product, as: 'product', attributes: ['id', 'name'] }
                ]
            });
            res.status(200).json(updatedOffer);
        } else {
            const existingOffer = await Offer.findByPk(id);
            if (!existingOffer) return res.status(404).json({ message: 'Offer not found' });
            res.status(200).json(existingOffer); 
        }
    } catch (error) {
         if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
         if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ message: 'Invalid supplierId or productId provided.', error: error.message });
        }
        res.status(500).json({ message: 'Error updating offer', error: error.message });
    }
};


exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Offer.destroy({ where: { id: id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting offer', error: error.message });
    }
};