import express from 'express';
import {
  createFarmingArea,
  deleteFarmingArea,
  getAllFarmingArea,
  updateFarmingArea,
  getFarmingArea,
  uploadImages,
} from '../controllers/farming-area';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();
router.route('/').get(getAllFarmingArea).post(createFarmingArea);
router
  .route('/upload/:id')
  .patch(uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getFarmingArea)
  .patch(updateFarmingArea)
  .delete(deleteFarmingArea);

export default router;
