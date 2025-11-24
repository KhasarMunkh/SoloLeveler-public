// MAIN SERVER CONFIGURATION
import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { connectDB, disconnectDB } from './db/client';

// ROUTES
import questsRouter from "./routes/quests";
import usersRouter from "./routes/users";

// Validate required environment variables
if (!process.env.CLERK_SECRET_KEY) {
    console.error('❌ Error: CLERK_SECRET_KEY is not set in .env file');
    process.exit(1);
}

const app = express();

// CORS configuration - allow requests from frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Body parsing middleware
app.use(express.json());

// Clerk authentication middleware - validates JWT tokens
// This populates req.auth with user data if token is valid
app.use(clerkMiddleware());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/quests', questsRouter);

const startServer = async () => {

    try {
        // Connect to database
        await connectDB();

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`✅ Server running on http://localhost:${port}`);
            console.log(`🔐 Clerk authentication enabled`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await disconnectDB();
    process.exit(0);
});

startServer();
