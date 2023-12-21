import express from 'express';
import {
  getAllFarmProduct,
  createFarmProduct,
  getFarmProduct,
  updateFarmProduct,
  deleteFarmProduct,
  uploadImages,
} from '../controllers/farm-product';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router
  .route('/')
  .get(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    getAllFarmProduct
  )
  .post(authenticateUser, createFarmProduct);
router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getFarmProduct)
  .patch(authenticateUser, updateFarmProduct)
  .delete(authenticateUser, deleteFarmProduct);

export default router;
