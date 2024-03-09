import express from 'express';
import {
  getAllTreatment,
  getTreatmentByHerd,
  getTreatment,
  createHerdTreatment,
  updateTreatment,
  deleteTreatment,
} from '../controllers/treatment';

const router = express.Router();

router.route('/').get(getAllTreatment).post(createHerdTreatment);
router.route('/herd/:id').get(getTreatmentByHerd);
router
  .route('/:id')
  .get(getTreatment)
  .patch(updateTreatment)
  .delete(deleteTreatment);

export default router;
