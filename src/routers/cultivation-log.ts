import {
  getAllCultivationLogs,
  createCultivationLog,
  getCultivationLog,
  updateCultivationLog,
  deleteCultivationLog,
  getCultivationLogsByFarmProduct,
} from '../controllers/cultivation-log';
import express from 'express';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router
  .route('/')
  .get(getAllCultivationLogs)
  .post(uploadCloud.array('images', 10), createCultivationLog);

router.route('/farm-product/:id').get(getCultivationLogsByFarmProduct);

router
  .route('/:id')
  .get(getCultivationLog)
  .patch(updateCultivationLog)
  .delete(deleteCultivationLog);

export default router;
