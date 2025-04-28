
const Supplier = require('../models/Supplier'); 


exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
    }
};


exports.getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findByPk(id); 
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching supplier', error: error.message });
    }
};


exports.createSupplier = async (req, res) => {
    try {
     
        if (!req.body.name || !req.body.email) {
             return res.status(400).json({ message: 'Supplier name and email are required' });
        }
        const newSupplier = await Supplier.create(req.body);
        res.status(201).json(newSupplier); 
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Error creating supplier', error: error.message });
    }
};


exports.updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Supplier.update(req.body, {
            where: { id: id }
        });

        if (updated) {
            const updatedSupplier = await Supplier.findByPk(id); 
            res.status(200).json(updatedSupplier);
        } else {
          
            const existingSupplier = await Supplier.findByPk(id);
            if (!existingSupplier) {
                return res.status(404).json({ message: 'Supplier not found' });
            }
           
            res.status(200).json(existingSupplier); 
        }
    } catch (error) {
         if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Error updating supplier', error: error.message });
    }
};


exports.deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Supplier.destroy({
            where: { id: id }
        });

        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Supplier not found' });
        }
    } catch (error) {
     
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ message: 'Cannot delete supplier with associated records (contacts, offers, etc.)', error: error.message });
        }
        res.status(500).json({ message: 'Error deleting supplier', error: error.message });
    }
};