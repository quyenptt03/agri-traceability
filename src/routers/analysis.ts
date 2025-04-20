import {
  analysisCount,
  analysisHerd,
  analysisResources,
  analysisDiseases,
} from '../controllers/analysis';
import express from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';

const router = express.Router();

router.route('/').post(authenticateUser, analysisCount);
router.route('/herd').post(authenticateUser, analysisHerd);
router.route('/resources').post(authenticateUser, analysisResources);
router.route('/diseases').post(authenticateUser, analysisDiseases);

export default router;
