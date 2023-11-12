import {
  getAllCultivationLogs,
  createCultivationLog,
  getCultivationLog,
  updateCultivationLog,
  deleteCultivationLog,
  getCultivationLogsByFarmProduct,
  uploadImages,
} from '../controllers/cultivation-log';
import express from 'express';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router.route('/').get(getAllCultivationLogs).post(createCultivationLog);
router.route('/farm-product/:id').get(getCultivationLogsByFarmProduct);
router
  .route('/upload/:id')
  .patch(uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getCultivationLog)
  .patch(updateCultivationLog)
  .delete(deleteCultivationLog);

export default router;
