import { AuthObject } from '@clerk/express';

declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId?: string;
                sessionId?: string;
                actor?: any;
                sessionClaims?: any;
                orgId?: string;
                orgRole?: string;
                orgSlug?: string;
                orgPermissions?: string[];
                has?: (permission: string) => boolean;
            };
        }
    }
}
