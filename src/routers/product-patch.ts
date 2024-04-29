import express from 'express';
import {
  getAllProductPatchs,
  createProductPatch,
  getProductPatch,
  updateProductPatch,
  deleteProductPatch,
  uploadImages,
} from '../controllers/product-patch';
import { authenticateUser } from '../middlewares/authentication';
import uploadCloud from '../middlewares/upload-cloud';

const router = express.Router();

router
  .route('/')
  .get(getAllProductPatchs)
  .post(authenticateUser, createProductPatch);
router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getProductPatch)
  .patch(authenticateUser, updateProductPatch)
  .delete(authenticateUser, deleteProductPatch);

export default router;
