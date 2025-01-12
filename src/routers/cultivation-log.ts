import {
  getAllCultivationLogs,
  createHerdCultivationLog,
  getCultivationLog,
  updateHerdCultivationLog,
  deleteCultivationLog,
  // getCultivationLogsByAnimal,
  getCultivationLogsByHerd,
  uploadMediaUri,
  // createCultivationLog,
} from '../controllers/cultivation-log';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import express from 'express';
import uploadCloud from '../middlewares/upload-cloud';

const router = express.Router();

router
  .route('/')
  .get(getAllCultivationLogs)
  .post(authenticateUser, createHerdCultivationLog);

// router.route('/animal/:id').get(authenticateUser, getCultivationLogsByAnimal);
// router.route('/herd').post(authenticateUser, createHerdCultivationLog);

router.route('/herd/:id').get(authenticateUser, getCultivationLogsByHerd);

router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadMediaUri);

router
  .route('/:id')
  .get(getCultivationLog)
  .patch(authenticateUser, updateHerdCultivationLog)
  .delete(authenticateUser, deleteCultivationLog);

export default router;
