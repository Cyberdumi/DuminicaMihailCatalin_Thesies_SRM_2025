const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING
    },
    jobTitle: {
        type: DataTypes.STRING
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'suppliers',
            key: 'id'
        }
    }
}, {
    tableName: 'contacts',
    timestamps: true
});

module.exports = Contact;