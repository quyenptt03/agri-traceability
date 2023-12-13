import express from 'express';
import {
  createUser,
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  changePassword,
  changeUserRole,
} from '../controllers/user';
import {
  authenticateUser,
  authorizePermissions,
} from '../middlewares/authentication';

const router = express.Router();

router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllUsers)
  .post(authenticateUser, authorizePermissions('admin'), createUser);
router.route('/my-profile').get(authenticateUser, showCurrentUser);
router.route('/update-user').patch(authenticateUser, updateUser);
router.route('/change-password').patch(authenticateUser, changePassword);
router
  .route('/:id')
  .get(authenticateUser, getSingleUser)
  .patch(authenticateUser, authorizePermissions('admin'), changeUserRole);

export default router;
