import { Request, Response } from 'express';
import { requireAuth, getCurrentUser, getUserData } from '../../services/auth';

describe('Auth Service', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('requireAuth', () => {
    it('should call next() for valid request', () => {
      requireAuth(mockReq as Request, mockRes as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return test user ID', () => {
      const userId = getCurrentUser(mockReq as Request);

      expect(userId).toBe('test-user-123');
    });
  });

  describe('getUserData', () => {
    it('should return user data object from req.auth', () => {
      // In test mode, req.auth is undefined, so all values should be undefined
      const userData = getUserData(mockReq as Request);

      expect(userData).toEqual({
        userId: undefined,
        sessionId: undefined,
        orgId: undefined,
        orgRole: undefined,
      });
    });

    it('should return auth data when present', () => {
      mockReq.auth = {
        userId: 'clerk-user-123',
        sessionId: 'session-456',
        orgId: 'org-789',
        orgRole: 'admin',
      };

      const userData = getUserData(mockReq as Request);

      expect(userData).toEqual({
        userId: 'clerk-user-123',
        sessionId: 'session-456',
        orgId: 'org-789',
        orgRole: 'admin',
      });
    });
  });
});
