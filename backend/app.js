const express = require('express');
const cors = require('cors');
const app = express();
const groupRoutes = require('./routes/groups')
app.use(cors());
app.use(express.json());

// Add this line to register auth route
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/user', require('./routes/user'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/groups', groupRoutes);

module.exports = app;
