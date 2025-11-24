import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require authentication on routes
 * Uses Clerk's auth data attached to req.auth by clerkMiddleware()
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    // Skip auth in development/test if SKIP_AUTH is explicitly set
    if (process.env.SKIP_AUTH === 'true') {
        if (process.env.NODE_ENV !== 'production') {
            console.log('⚠️  Auth check skipped (SKIP_AUTH=true)');
        }
        return next();
    }

    // Check if user is authenticated via Clerk
    if (!req.auth?.userId) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required. Please sign in.'
        });
    }

    next();
};

/**
 * Get the current authenticated user's Clerk ID
 */
export const getCurrentUser = (req: Request): string | null => {
    // If auth is skipped, return test user ID
    if (process.env.SKIP_AUTH === 'true') {
        return 'test-user-123';
    }
    return req.auth?.userId || null;
};

/**
 * Get full auth data from the request
 */
export const getUserData = (req: Request) => {
    return {
        userId: req.auth?.userId,
        sessionId: req.auth?.sessionId,
        orgId: req.auth?.orgId,
        orgRole: req.auth?.orgRole
    };
};
