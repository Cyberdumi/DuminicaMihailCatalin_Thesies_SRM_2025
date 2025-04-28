const Contact = require('../models/Contact');
const Supplier = require('../models/Supplier'); 


exports.getAllContacts = async (req, res) => {
    try {
        const { supplierId } = req.query; 
        let options = {
            include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }] 
        };
        if (supplierId) {
            options.where = { supplierId: supplierId };
        }
        const contacts = await Contact.findAll(options);
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts', error: error.message });
    }
};


exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByPk(id, {
             include: [{ model: Supplier, as: 'supplier' }] 
        });
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contact', error: error.message });
    }
};


exports.createContact = async (req, res) => {
    try {
        const { firstName, lastName, email, supplierId } = req.body;
        if (!firstName || !lastName || !email || !supplierId) {
             return res.status(400).json({ message: 'First name, last name, email, and supplierId are required' });
        }
        
        const supplier = await Supplier.findByPk(supplierId);
        if (!supplier) {
             return res.status(400).json({ message: `Supplier with ID ${supplierId} not found.` });
        }

        const newContact = await Contact.create(req.body);
        const createdContactWithSupplier = await Contact.findByPk(newContact.id, {
             include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }]
        });
        res.status(201).json(createdContactWithSupplier);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
         if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ message: 'Invalid supplierId provided.', error: error.message });
        }
        res.status(500).json({ message: 'Error creating contact', error: error.message });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.body.supplierId && req.body.supplierId !== undefined) {
            
             const supplier = await Supplier.findByPk(req.body.supplierId);
             if (!supplier) {
                 return res.status(400).json({ message: `Supplier with ID ${req.body.supplierId} not found.` });
             }
        }

        const [updated] = await Contact.update(req.body, { where: { id: id } });
        if (updated) {
            const updatedContact = await Contact.findByPk(id, {
                include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }]
            });
            res.status(200).json(updatedContact);
        } else {
            const existingContact = await Contact.findByPk(id);
            if (!existingContact) return res.status(404).json({ message: 'Contact not found' });
            res.status(200).json(existingContact); 
        }
    } catch (error) {
         if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors.map(e => e.message) });
        }
         if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ message: 'Invalid supplierId provided.', error: error.message });
        }
        res.status(500).json({ message: 'Error updating contact', error: error.message });
    }
};


exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Contact.destroy({ where: { id: id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Contact not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact', error: error.message });
    }
};