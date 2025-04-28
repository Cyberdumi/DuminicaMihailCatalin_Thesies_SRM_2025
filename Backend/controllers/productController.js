const Product = require('../models/Product');
const { Op } = require("sequelize"); 

exports.getAllProducts = async (req, res) => {
    try {
        const { search } = req.query; 
        let options = {};
        if (search) {
            options.where = {
                name: {
                    [Op.like]: `%${search}%` 
                }
            };
        }
        const products = await Product.findAll(options);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        if (!req.body.name) {
             return res.status(400).json({ message: 'Product name is required' });
        }
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Product.update(req.body, { where: { id: id } });
        if (updated) {
            const updatedProduct = await Product.findByPk(id);
            res.status(200).json(updatedProduct);
        } else {
            const existingProduct = await Product.findByPk(id);
            if (!existingProduct) return res.status(404).json({ message: 'Product not found' });
            res.status(200).json(existingProduct); 
        }
    } catch (error) {
         if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.destroy({ where: { id: id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
         if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ message: 'Cannot delete product with associated offers.', error: error.message });
        }
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};