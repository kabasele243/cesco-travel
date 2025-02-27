import { promisify} from 'util';
import jwt from 'jsonwebtoken';
import User from "../models/userModel.js";
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    // expires: new Date(
    //   Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    // ),
    httpOnly: true,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

export const signup = async (req, res, next) => {
    try { 
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
          }
        );

        createSendToken(newUser, 201, req, res);
    } catch (error) {
      console.log({error})
        res.status(400).json(error);
    }
}

export const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
      }
  
      const user = await User.findOne({ email }).select('+password');
    
      if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
      }

      createSendToken(user, 200, req, res);

    } catch (error) {
      console.log(error);
        res.status(400).json(error);
    }
}

export const protect = async (req, res, next) => {
  try {

    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    res.status(400).json(err);
  }
};

export const isLoggedIn = async (req, res, next) => {
  // console.log(req)
  if (req?.cookies?.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

export const forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    // await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      body: { resetURL }
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
};

export const resetPassword = async (req, res, next) => {

  try {
      // 1) Get user based on the token
  const hashedToken = crypto
  .createHash('sha256')
  .update(req.params.token)
  .digest('hex');

const user = await User.findOne({
  passwordResetToken: hashedToken,
  passwordResetExpires: { $gt: Date.now() }
});

// 2) If token has not expired, and there is user, set the new password
if (!user) {
  return next(new AppError('Token is invalid or has expired', 400));
}
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();

// 3) Update changedPasswordAt property for the user
// 4) Log the user in, send JWT
createSendToken(user, 200, req, res);
  } catch (error) {
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }

};

export const updatePassword = async (req, res, next) => {

  try {
    // 1) Get user from collection
         const user = await User.findById(req.user.id).select('+password');

         // 2) Check if POSTed current password is correct
         if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
           return next(new AppError('Your current password is wrong.', 401));
         }
     
         // 3) If so, update password
         user.password = req.body.password;
         user.passwordConfirm = req.body.passwordConfirm;
         await user.save();
         // User.findByIdAndUpdate will NOT work as intended!
     
         // 4) Log user in, send JWT
         createSendToken(user, 200, req, res);
  } catch (error) {
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }

};


export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};
