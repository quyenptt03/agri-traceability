import {
  createActivity,
  deleteActivity,
  getActivity,
  getAllActivities,
  updateActivity,
} from '../controllers/activity';
import express from 'express';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';

const router = express.Router();

router.route('/').get(getAllActivities).post(authenticateUser, createActivity);

router
  .route('/:id')
  .get(getActivity)
  .patch(authenticateUser, updateActivity)
  .delete(authenticateUser, deleteActivity);

export default router;
