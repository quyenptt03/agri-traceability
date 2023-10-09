import {
  createActivity,
  deleteActivity,
  getActivity,
  getAllActivities,
  updateActivity,
} from '../controllers/activity';
import express from 'express';

const router = express.Router();

router.route('/').get(getAllActivities).post(createActivity);

router
  .route('/:id')
  .get(getActivity)
  .patch(updateActivity)
  .delete(deleteActivity);

export default router;
