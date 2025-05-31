require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const sequelize = require('./config/database'); 


const db = require('./models');


const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/contactRoutes');
const offerRoutes = require('./routes/offerRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;


async function testDbConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
testDbConnection();


app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 



app.get('/api', (req, res) => {
    res.json({ message: 'SRM API is running!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});


sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synced successfully.');
        startServer();
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

function startServer() {
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}

module.exports = app;