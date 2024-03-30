import express from 'express';
import {
  getAllHarvests,
  createHarvest,
  getHarvest,
  getHarvestsByHerd,
  updateHarvest,
  deleteHarvest,
  uploadImages,
} from '../controllers/harvest';
import { authenticateUser } from '../middlewares/authentication';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router.route('/').get(getAllHarvests).post(authenticateUser, createHarvest);
router.route('/herd/:id').get(authenticateUser, getHarvestsByHerd);
router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getHarvest)
  .patch(authenticateUser, updateHarvest)
  .delete(authenticateUser, deleteHarvest);

export default router;
