import express from 'express';
import {
  getAllFarmProduct,
  createFarmProduct,
  getFarmProduct,
  updateFarmProduct,
  deleteFarmProduct,
  uploadImages,
} from '../controllers/farm-product';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router.route('/').get(getAllFarmProduct).post(createFarmProduct);
router
  .route('/upload/:id')
  .patch(uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getFarmProduct)
  .patch(updateFarmProduct)
  .delete(deleteFarmProduct);

export default router;
