import dotenv from 'dotenv';
dotenv.config(); // ← Must be FIRST — before any module that reads process.env

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db';
import { isBlockchainConfigured } from './services/blockchain';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import credentialRoutes from './routes/credentials';
import graphRoutes from './routes/graph';
import issuerRoutes from './routes/issuers';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import achievementRoutes from './routes/achievement';
import submissionRoutes from './routes/submissions';

import { startVerificationWorker } from './workers/verificationWorker';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ── Socket.io setup ──────────────────────────────────────────────────────────
const io = new SocketServer(server, {
    cors: {
        origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:8080'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Authenticate Socket.io connections via JWT
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }
    try {
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string) as { userId: string };
        (socket as any).userId = decoded.userId;
        next();
    } catch {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    if (userId) {
        socket.join(userId);
        console.log(`[Socket.io] User ${userId} connected (socket: ${socket.id})`);
    }
    socket.on('disconnect', () => {
        console.log(`[Socket.io] User ${userId} disconnected`);
    });
});

// Export io for use in other modules (e.g. worker)
export { io };

// ── Express middleware ───────────────────────────────────────────────────────
app.use(cors({ origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:8080'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/issuers', issuerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/submissions', submissionRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        blockchain: isBlockchainConfigured() ? 'enabled' : 'disabled (database-only mode)',
    });
});

// ── Start server ─────────────────────────────────────────────────────────────
const start = async () => {
    await connectDB();

    // Start BullMQ verification worker (passes io for real-time push)
    startVerificationWorker(io);

    server.listen(PORT, () => {
        console.log(`🚀 Backend running on http://localhost:${PORT}`);
        console.log(`🔌 Socket.io ready`);
    });
};

// ── Global crash guards — keep the process alive through transient errors ────
process.on('uncaughtException', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use. Kill stale node: taskkill /F /IM node.exe`);
    } else {
        console.error('❌ Uncaught Exception:', err.message);
    }
    // Do NOT call process.exit() — let nodemon restart cleanly
});

process.on('unhandledRejection', (reason: any) => {
    console.error('❌ Unhandled Rejection:', reason?.message || reason);
});

start();
