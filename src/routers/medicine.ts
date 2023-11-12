import express from 'express';
import {
  getAllMedicine,
  createMedicine,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  uploadImages,
} from '../controllers/medicine';
import uploadCloud from '../middlewares/uploadCloud';

const router = express.Router();

router.route('/').get(getAllMedicine).post(createMedicine);
router
  .route('/upload/:id')
  .patch(uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getMedicine)
  .patch(updateMedicine)
  .delete(deleteMedicine);

export default router;
