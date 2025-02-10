import express from 'express';
import {
  getAllRoom,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/room';
import { authenticateUser } from '../middlewares/authentication';

const router = express.Router();

router.route('/').get(getAllRoom).post(authenticateUser, createRoom);
router.route('/herd/:id').delete(deleteRoom);
router
  .route('/:id')
  .get(getRoom)
  .patch(authenticateUser, updateRoom)
  .delete(authenticateUser, deleteRoom);

export default router;
