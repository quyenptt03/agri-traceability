import express from 'express';
import {
  getAllDiseases,
  getDisease,
  createDisease,
  updateDisease,
  deleteDisease,
  uploadImages,
} from '../controllers/disease';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import uploadCloud from '../middlewares/upload-cloud';

const router = express.Router();

router.route('/').get(getAllDiseases).post(createDisease);
router
  .route('/upload/:id')
  .patch(uploadCloud.array('images', 10), uploadImages);
router.route('/:id').get(getDisease).patch(updateDisease).delete(deleteDisease);

export default router;
