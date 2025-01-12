import express from 'express';
import {
  getAllShelters,
  createShelter,
  getShelter,
  updateShelter,
  deleteShelter,
} from '../controllers/shelter';
import { authenticateUser } from '../middlewares/authentication';

const router = express.Router();

router.route('/').get(getAllShelters).post(authenticateUser, createShelter);
router.route('/herd/:id').delete(deleteShelter);
router
  .route('/:id')
  .get(getShelter)
  .patch(authenticateUser, updateShelter)
  .delete(authenticateUser, deleteShelter);

export default router;
