import express from 'express';
import {
  getAllPests,
  createPest,
  getPest,
  updatePest,
  deletePest,
  uploadImages,
} from '../controllers/pest';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router.route('/').get(getAllPests).post(createPest);
router
  .route('/upload/:id')
  .patch(uploadCloud.array('images', 10), uploadImages);
router.route('/:id').get(getPest).patch(updatePest).delete(deletePest);

export default router;
