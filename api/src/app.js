const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const { connect } = require('./config/db');

const PORT = process.env.PORT;
const FE_PORT = process.env.FE_PORT;
const FRONTEND_URL = process.env.FRONTEND_URL; // e.g., https://your-frontend.vercel.app

// Middleware
// Allow FE localhost during dev, or FRONTEND_URL in production
const DEFAULT_FE = 'https://39-archive.vercel.app';
const allowedOrigin = FRONTEND_URL || (FE_PORT ? `http://localhost:${FE_PORT}` : 'http://localhost:3000');
const corsOptions = {
	origin: [allowedOrigin, DEFAULT_FE],
	credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight for all routes
app.use(express.json());

// Cookie parser phải được đặt trước khi sử dụng routes
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const composerRoutes = require('./routes/composerRoutes');
const performerRoutes = require('./routes/performerRoutes');
const songRoutes = require('./routes/songRoutes');
const accountRoutes = require('./routes/accountRoutes.js');
const uploadsRoutes = require('./routes/uploadsRoutes');
const newsRoutes = require('./routes/newsRoutes');
const testRoutes = require('./routes/testRoutes');
 
// Use routes
app.use('/composer', composerRoutes);
app.use('/performer', performerRoutes);
app.use('/song', songRoutes);
app.use('/uploads', uploadsRoutes); // Serve files từ Cloudinary
app.use('/account', accountRoutes);
app.use('/test', testRoutes); // Test routes cho Cloudinary
app.use('/news',newsRoutes);
app.use('/playlist', require('./routes/playlistRoutes'));

connect();

module.exports = app;
