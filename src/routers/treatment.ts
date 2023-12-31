import express from 'express';
import {
  getAllTreatment,
  getTreatment,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} from '../controllers/treatment';

const router = express.Router();

router.route('/').get(getAllTreatment).post(createTreatment);
router
  .route('/:id')
  .get(getTreatment)
  .patch(updateTreatment)
  .delete(deleteTreatment);

export default router;
