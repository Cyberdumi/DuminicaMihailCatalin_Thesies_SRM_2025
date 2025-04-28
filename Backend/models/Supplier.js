const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
    name: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    contactPerson: {
        type: DataTypes.STRING
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
    address: {
        type: DataTypes.TEXT 
    }
}, {
    tableName: 'suppliers', 
    timestamps: true        
});

module.exports = Supplier;