const express = require('express');
const { createJob, sendEmailToCandidates,getAllJobsByCompany,getJobByIdForCompany,updateJobForCompany,deleteJobForCompany,partialUpdateJobForCompany} = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware, createJob);
router.post('/send-email', authMiddleware, sendEmailToCandidates);
router.get('/:companyId',authMiddleware, getAllJobsByCompany);
router.get('/:companyId/:jobId',authMiddleware, getJobByIdForCompany);
router.put('/:companyId/:jobId',authMiddleware, updateJobForCompany);
router.delete('/:companyId/:jobId',authMiddleware, deleteJobForCompany);
router.patch('/:companyId/:jobId',authMiddleware, partialUpdateJobForCompany);

module.exports = router;
