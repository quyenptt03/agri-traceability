import express from 'express';
import {
  getAllProcessors,
  createProcessor,
  getProcessor,
  updateProcessor,
  deleteProcessor,
  uploadImages,
  getAllProducts,
} from '../controllers/processor';
import { authenticateUser } from '../middlewares/authentication';
import uploadCloud from '../middlewares/upload-cloud';

const router = express.Router();

router.route('/').get(getAllProcessors).post(authenticateUser, createProcessor);
router.route('/products').get(getAllProducts);
router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getProcessor)
  .patch(authenticateUser, updateProcessor)
  .delete(authenticateUser, deleteProcessor);

export default router;
