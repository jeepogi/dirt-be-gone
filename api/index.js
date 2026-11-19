require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('@exortek/express-mongo-sanitize'); 
const xssSanitize = require('xss-sanitize'); 
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors()); 
app.use(express.json({ limit: '100mb' }));
app.use(mongoSanitize()); 
app.use(xssSanitize()); 
app.use(rateLimit({ windowMs: 60_000, max: 200 }));

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');   
const requestServiceRoutes = require('./routes/request_service'); 
const serviceRoutes = require('./routes/services'); 

const feedbackRoutes = require('./routes/feedback'); // 👈 ADD THIS LINE

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);   
app.use('/api', requestServiceRoutes); 
app.use('/api', serviceRoutes); 

app.use('/api', feedbackRoutes); // 👈 ADD THIS LINE

module.exports = app;