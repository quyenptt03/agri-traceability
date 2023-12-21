import express from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
  uploadImages,
} from '../controllers/category';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router
  .route('/')
  .get(getAllCategories)
  .post(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    createCategory
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
  .get(getCategory)
  .patch(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    updateCategory
  )
  .delete(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    deleteCategory
  );

export default router;
