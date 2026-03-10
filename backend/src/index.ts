import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import credentialRoutes from './routes/credentials';
import graphRoutes from './routes/graph';
import issuerRoutes from './routes/issuers';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:8080'] }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/issuers', issuerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
};

start();
