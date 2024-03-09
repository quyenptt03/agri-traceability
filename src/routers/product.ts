import express from 'express';
import {
  getAllProduct,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
} from '../controllers/product';
import { authenticateUser } from '../middlewares/authentication';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router.route('/').get(getAllProduct).post(authenticateUser, createProduct);
router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getProduct)
  .patch(authenticateUser, updateProduct)
  .delete(authenticateUser, deleteProduct);

export default router;
