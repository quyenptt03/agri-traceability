import express from 'express';
import {
  getAllAnimals,
  createAnimal,
  getAnimal,
  updateAnimal,
  deleteAnimal,
  deleteHerdAnimals,
  uploadImages,
} from '../controllers/animal';
import { authenticateUser } from '../middlewares/authentication';
import uploadCloud from '../middlewares/upload-cloud';

const router = express.Router();

router.route('/').get(getAllAnimals).post(authenticateUser, createAnimal);
router.route('/herd/:id').delete(deleteHerdAnimals);
router
  .route('/upload/:id')
  .patch(authenticateUser, uploadCloud.array('images', 10), uploadImages);
router
  .route('/:id')
  .get(getAnimal)
  .patch(authenticateUser, updateAnimal)
  .delete(authenticateUser, deleteAnimal);

export default router;
