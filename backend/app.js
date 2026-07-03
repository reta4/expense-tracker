const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json());

app.get('/', (req, res) => res.send('🚀 Secure Proxy server is running smoothly!'));
app.use('/api', authRoutes);
app.use('/api', expenseRoutes);

app.use(errorHandler);

module.exports = app;
