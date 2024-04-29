import express from 'express';
import {
  createFarm,
  deleteFarm,
  getAllFarm,
  updateFarm,
  getFarm,
  uploadImages,
} from '../controllers/farm';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import uploadCloud from '../middlewares/upload-cloud';

const router = express.Router();
router
  .route('/')
  .get(getAllFarm)
  .post(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    createFarm
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
  .get(getFarm)
  .patch(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    updateFarm
  )
  .delete(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    deleteFarm
  );

export default router;
