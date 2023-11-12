import express from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
  uploadImages,
} from '../controllers/category';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router.route('/').get(getAllCategories).post(createCategory);
router
  .route('/upload/:id')
  .patch(uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

export default router;
