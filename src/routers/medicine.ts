import express from 'express';
import {
  getAllMedicine,
  createMedicine,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  uploadImages,
} from '../controllers/medicine';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import uploadCloud from '../middlewares/upload-cloud';

const router = express.Router();

router
  .route('/')
  .get(getAllMedicine)
  .post([authenticateUser, authorizePermissions('admin')], createMedicine);
router
  .route('/upload/:id')
  .patch(
    [authenticateUser, authorizePermissions('admin')],
    uploadCloud.array('images', 10),
    uploadImages
  );
router
  .route('/:id')
  .get(authenticateUser, getMedicine)
  .patch([authenticateUser, authorizePermissions('admin')], updateMedicine)
  .delete([authenticateUser, authorizePermissions('admin')], deleteMedicine);

export default router;
