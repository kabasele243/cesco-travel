import express from 'express';
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} from '../controller/userController.js';
import { signup, login , forgotPassword, resetPassword, updatePassword, protect} from '../controller/authController.js';
import reviewRouter from './reviewRoutes.js'

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/signup').post(signup);
router.route('/login').post(login);

router.get('/me', protect);

router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword').patch(resetPassword);
router.route('/updatePaswword').patch(updatePassword);
router.route('/deleteMe').patch(deleteMe);

router.get('/me', getMe, getUser);
router.route('/updateMe').patch(updateMe);


router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
