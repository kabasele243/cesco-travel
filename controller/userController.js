import User from "../models/userModel.js";

export const getAllUsers = async(req, res) => {
 

  try {
    const users = await User.find()

    res.status(200).json(
      {
        status: 'success',
        results: users.length,
        data: {
          users
        }
      }
    );
  } catch (error) {
    res.status(400).json(error);
  }
};

export const createUser = (req, res) => {

  res.send('Create User');
};

export const updateUser = (req, res) => {
  res.send('Update User');
};

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getUser = (req, res) => {
  res.send('Get User');
};

export const deleteUser = (req, res) => {
  res.send('Delete User');
};

export const updateMe = async (req, res, next) => {
  try {
      // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error
    });
  }

};

export const deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error
    });
  }

};
