import express from 'express';
import {
  issueCertificate,
  getAllCertificates,
  getCertificatesByIssuer,
  getCertificateById,
  revokeCertificate,
} from '../controllers/certificateController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (Admin / Issuer)
router.post('/', protect, authorize('admin', 'issuer'), issueCertificate);
router.get('/', protect, getAllCertificates);
router.get('/by-issuer/:issuerId', protect, getCertificatesByIssuer);
router.patch('/:id/revoke', protect, authorize('admin'), revokeCertificate);

// Public route - anyone can verify
router.get('/:id', getCertificateById);

export default router;