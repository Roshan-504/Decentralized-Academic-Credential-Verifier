import express from 'express';
import {
  issueCertificate,
  getAllCertificates,
  getCertificateById,
  revokeCertificate,
} from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - anyone can verify
router.get('/:id', getCertificateById);

// Protected routes - only admin
router.post('/', protect, issueCertificate);
router.get('/', protect, getAllCertificates);
router.patch('/:id/revoke', protect, revokeCertificate);

export default router;