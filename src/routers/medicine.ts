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
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router
  .route('/')
  .get(getAllMedicine)
  .post(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    createMedicine
  );
router
  .route('/upload/:id')
  .patch(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    uploadCloud.array('images', 10),
    uploadImages
  );
router
  .route('/:id')
  .get(authenticateUser, getMedicine)
  .patch(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    updateMedicine
  )
  .delete(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    deleteMedicine
  );

export default router;
