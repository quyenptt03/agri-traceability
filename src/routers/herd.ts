import express from 'express';
import {
  getAllHerd,
  createHerd,
  generateHerdMember,
  getHerd,
  updateHerd,
  deleteHerd,
  uploadImages,
} from '../controllers/herd';
import { authenticateUser } from '../middlewares/authentication';
import uploadCloud from '../middlewares/upload-cloud';

const router = express.Router();

router.route('/').get(getAllHerd).post(authenticateUser, createHerd);
router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadImages);
router.route('/:id/generate-animals').post(generateHerdMember);
router
  .route('/:id')
  .get(getHerd)
  .patch(authenticateUser, updateHerd)
  .delete(authenticateUser, deleteHerd);

export default router;
