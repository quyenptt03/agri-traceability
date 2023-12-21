import express from 'express';
import {
  createFarmingArea,
  deleteFarmingArea,
  getAllFarmingArea,
  updateFarmingArea,
  getFarmingArea,
  uploadImages,
} from '../controllers/farming-area';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();
router
  .route('/')
  .get(getAllFarmingArea)
  .post(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    createFarmingArea
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
  .get(getFarmingArea)
  .patch(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    updateFarmingArea
  )
  .delete(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    deleteFarmingArea
  );

export default router;
