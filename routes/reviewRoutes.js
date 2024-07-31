import express from 'express';
import {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  setTourUserIds,
} from '../controller/reviewController.js';
import { protect, restrictTo } from '../controller/authController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(
    restrictTo('user'),
    setTourUserIds,
    createReview
  );

router
  .route('/:id')
  .get(getReview)
  .patch(
    restrictTo('user', 'admin'),
    updateReview
  )
  .delete(
    restrictTo('user', 'admin'),
    deleteReview
  );

export default router;
