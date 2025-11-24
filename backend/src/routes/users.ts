import { Router } from 'express';
import { requireAuth } from '../services/auth';
import { createOrGetUser, getAllUsers } from '../controllers/userController';

const router = Router();

router.post('/', requireAuth, createOrGetUser);
router.get('/', requireAuth, getAllUsers);

export default router;