import express from 'express';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getToursWithin,
  getDistances,
} from '../controller/tourController.js';
import { protect, restrictTo, isLoggedIn } from '../controller/authController.js';



const router = express.Router();

router.route('/tour-stats').get(getTourStats);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router.route('/').get(getAllTours).post(protect, restrictTo('admin', 'lead-guide'), createTour);
router.route('/:id').get(getTour).patch(protect, restrictTo('admin', 'lead-guide'),updateTour).delete(protect, restrictTo('admin', 'lead-guide'),deleteTour);

export default router;
