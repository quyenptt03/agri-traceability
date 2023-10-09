import express from 'express';
import {
  getAllFarmProduct,
  createFarmProduct,
  getFarmProduct,
  updateFarmProduct,
  deleteFarmProduct,
} from '../controllers/farm-product';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router
  .route('/')
  .get(getAllFarmProduct)
  .post(uploadCloud.array('images', 10), createFarmProduct);

router
  .route('/:id')
  .get(getFarmProduct)
  .patch(uploadCloud.array('images', 10), updateFarmProduct)
  .delete(deleteFarmProduct);

export default router;
