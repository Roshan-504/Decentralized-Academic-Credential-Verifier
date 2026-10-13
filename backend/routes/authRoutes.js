import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  createIssuer,
  getIssuers,
  updateIssuer,
  deleteIssuer,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);

// Admin-only routes for Issuer management
router.post('/create-issuer', protect, authorize('admin'), createIssuer);
router.get('/issuers', protect, authorize('admin'), getIssuers);
router.put('/issuers/:id', protect, authorize('admin'), updateIssuer);
router.delete('/issuers/:id', protect, authorize('admin'), deleteIssuer);

export default router;