const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Offer = sequelize.define('Offer', {
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    validFrom: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    validTo: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isInt: true,
            min: 1
        }
    },
    notes: {
        type: DataTypes.TEXT
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'suppliers', key: 'id' }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' }
    }
}, {
    tableName: 'offers',
    timestamps: true
});

module.exports = Offer;