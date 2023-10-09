import express from 'express';
import {
  createFarmingArea,
  deleteFarmingArea,
  getAllFarmingArea,
  updateFarmingArea,
  getFarmingArea,
} from '../controllers/farming-area';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router
  .route('/')
  .get(getAllFarmingArea)
  .post(uploadCloud.array('images', 10), createFarmingArea);

router
  .route('/:id')
  .get(getFarmingArea)
  .patch(uploadCloud.array('images', 10), updateFarmingArea)
  .delete(deleteFarmingArea);

export default router;
