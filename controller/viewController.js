import Tour from "../models/tourModel.js";
import User from "../models/userModel.js";
// import Booking from "../models/bookingModel.js";
import AppError from "../utils/appError.js";

export const alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

export const getOverview = async (req, res, next) => {
  try {
      // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
  } catch (error) {
    res.status(500).json(
      new AppError('Something went wrong while updating your data.', 500)
    );
  }

};

export const getTour = async (req, res, next) => {
  try {
      // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });


  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
  } catch (error) {
    res.status(500).json(
      new AppError('Something went wrong while updating your data.', 500)
    );
  }

};

export const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Sign In'
  });
};

export const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

export const getMyTours = async (req, res, next) => {

  try {
      // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
  } catch (error) {
    res.status(500).json(
      new AppError('Something went wrong while updating your data.', 500)
    );
  }

};

export const updateUserData = async (req, res, next) => {

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json(
      new AppError('Something went wrong while updating your data.', 500)
    );
  }
};
