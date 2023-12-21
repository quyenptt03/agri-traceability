import express from 'express';
import {
  getAllPests,
  createPest,
  getPest,
  updatePest,
  deletePest,
  uploadImages,
} from '../controllers/pest';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router
  .route('/')
  .get(getAllPests)
  .post(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    createPest
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
  .get(getPest)
  .patch(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    updatePest
  )
  .delete(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    deletePest
  );

export default router;
