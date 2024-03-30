import express from 'express';
import {
  getAllDistributors,
  createDistributor,
  getDistributor,
  updateDistributor,
  deleteDistributor,
  uploadImages,
} from '../controllers/distributor';
import { authenticateUser } from '../middlewares/authentication';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router
  .route('/')
  .get(getAllDistributors)
  .post(authenticateUser, createDistributor);
router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getDistributor)
  .patch(authenticateUser, updateDistributor)
  .delete(authenticateUser, deleteDistributor);

export default router;
