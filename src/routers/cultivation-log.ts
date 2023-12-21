import {
  getAllCultivationLogs,
  createCultivationLog,
  getCultivationLog,
  updateCultivationLog,
  deleteCultivationLog,
  getCultivationLogsByFarmProduct,
  uploadImages,
} from '../controllers/cultivation-log';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import express from 'express';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router
  .route('/')
  .get(getAllCultivationLogs)
  .post(authenticateUser, createCultivationLog);
router
  .route('/farm-product/:id')
  .get(authenticateUser, getCultivationLogsByFarmProduct);
router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getCultivationLog)
  .patch(authenticateUser, updateCultivationLog)
  .delete(authenticateUser, deleteCultivationLog);

export default router;
