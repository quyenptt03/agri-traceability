import express from 'express';
import {
  getAllResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/resource';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';

const router = express.Router();

router
  .route('/')
  .get(getAllResources)
  .post([authenticateUser, authorizePermissions('admin')], createResource);

router
  .route('/:id')
  .get(getResource)
  .patch([authenticateUser, authorizePermissions('admin')], updateResource)
  .delete([authenticateUser, authorizePermissions('admin')], deleteResource);

export default router;
