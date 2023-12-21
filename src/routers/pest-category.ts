import {
  createPestCategory,
  getAllPestCategories,
  getPestCategory,
  updatePestCategory,
  deletePestCategory,
} from '../controllers/pest-category';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';
import express from 'express';

const router = express.Router();

router
  .route('/')
  .get(getAllPestCategories)
  .post(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    createPestCategory
  );

router
  .route('/:id')
  .get(getPestCategory)
  .patch(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    updatePestCategory
  )
  .delete(
    [authenticateUser, authorizePermissions('admin', 'manager')],
    deletePestCategory
  );

export default router;
