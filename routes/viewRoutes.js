import express from 'express';
import { alerts, getOverview, getTour, getLoginForm, getAccount, getMyTours, updateUserData } from '../controller/viewController.js';
import { isLoggedIn, protect, logout } from '../controller/authController.js';

const router = express.Router();

router.use(alerts);

router.get('/',isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/logout', logout);
router.get('/me', getAccount);
router.get('/my-tours', protect, getMyTours);
router.post(
  '/submit-user-data',
  protect,
  updateUserData
);

export default router;
