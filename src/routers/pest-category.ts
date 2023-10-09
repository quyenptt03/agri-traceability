import {
  createPestCategory,
  getAllPestCategories,
  getPestCategory,
  updatePestCategory,
  deletePestCategory,
} from '../controllers/pest-category';
import express from 'express';

const router = express.Router();

router.route('/').get(getAllPestCategories).post(createPestCategory);

router
  .route('/:id')
  .get(getPestCategory)
  .patch(updatePestCategory)
  .delete(deletePestCategory);

export default router;
