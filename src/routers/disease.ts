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

router
  .route('/')
  .get(getAllDiseases)
  .post([authenticateUser, authorizePermissions('admin')], createDisease);
router
  .route('/upload/:id')
  .patch(
    [authenticateUser, authorizePermissions('admin')],
    uploadCloud.array('images', 10),
    uploadImages
  );
router
  .route('/:id')
  .get(getDisease)
  .patch([authenticateUser, authorizePermissions('admin')], updateDisease)
  .delete([authenticateUser, authorizePermissions('admin')], deleteDisease);

export default router;
