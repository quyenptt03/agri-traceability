import express from 'express';
import {
  register,
  login,
  logout,
  login2,
  logout2,
  getActiveUser,
  register2,
} from '../controllers/auth';
import { authenticateUser } from '../middlewares/authentication';

const router = express.Router();

router.post('/register', register2);
router.post('/login', login2);
router.get('/logout', authenticateUser, logout2);
router.get('/active-users', authenticateUser, getActiveUser);

export default router;
