import Certificate from '../models/Certificate.js';

// @desc    Issue a new certificate
// @route   POST /api/certificates
// @access  Private (Admin)
export const issueCertificate = async (req, res) => {
  try {
    const {
      certificateId,
      studentName,
      program,
      batch,
      department,
      course,
      year,
      grade,
      institute,
      photoUrl,
      blockchainTxHash,
    } = req.body;

    const exists = await Certificate.findOne({ certificateId });
    if (exists) {
      return res.status(400).json({ message: 'Certificate ID already exists' });
    }

    const certificate = await Certificate.create({
      certificateId,
      studentName,
      program,
      batch,
      department,
      course,
      year,
      grade,
      institute,
      photoUrl: photoUrl || '',
      blockchainTxHash: blockchainTxHash || '',
      issuedBy: req.user._id,
      isValid: true,
    });

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private (Admin)
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('issuedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single certificate by ID (Public - for verification)
// @route   GET /api/certificates/:id
// @access  Public
export const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id })
      .populate('issuedBy', 'name email');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke a certificate
// @route   PATCH /api/certificates/:id/revoke
// @access  Private (Admin)
export const revokeCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (!certificate.isValid) {
      return res.status(400).json({ message: 'Certificate is already revoked' });
    }

    certificate.isValid = false;
    certificate.revokedAt = new Date();
    await certificate.save();

    res.json({ message: 'Certificate revoked successfully', certificate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};