const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.STRING
    },
    unitOfMeasure: {
        type: DataTypes.STRING
    }
  
}, {
    tableName: 'products',
    timestamps: true
});


module.exports = Product;