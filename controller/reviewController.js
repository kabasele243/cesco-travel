import Review from '../models/reviewModel.js';

export const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const getAllReviews = async (req, res, next) => {
  // To allow for nested GET reviews on tour (hack)
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
  
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;
  
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'success',
      error
    });
  }

};

export const getReview = async (req, res, next) => {
  try {
    let query = Review.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
  
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'success',
      error
    });
  }

};

export const createReview = async (req, res, next) => {

  try {
    const doc = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  } catch (error) {
    res.status(201).json({
      status: 'success',
      error
    });
  }

};

export const updateReview = async (req, res, next) => {

  try {
    const doc = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'success',
      error
    });
  }

};

export const deleteReview = async (req, res, next) => {
  try {
    const doc = await Review.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'success',
      error
    });
  }
};
