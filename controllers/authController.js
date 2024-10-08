const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    // req.headers('x-forwarded-pro') === 'https' condition is only for Heroku
    // secure = true; // only using cookie on HTTPS
    secure:
      req.secure ||
      req.header('x-forwarded-pro') === 'https'
  };

  res.cookie('jwt', token, cookieOptions);

  //Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    phoneNum: req.body.phoneNum
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  //console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 200, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and password exists
  if (!email || !password) {
    return next(
      new AppError(
        'Please provide email and password!',
        400
      )
    );
  }

  //2) Check if user exists && password is correct
  const user = await User.findOne({ email: email }).select(
    '+password'
  );

  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(
      new AppError('Incorrect email or password', '401')
    ); //401 Unauthrized
  }

  //3) If everything is ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check of it's there
  //   example: authorization: 'Bearer dklasjdklasjd',
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
      new AppError(
        'You are not logged in! Please log in to get access',
        401
      )
    );
  }

  //2) Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token doses no longer exist',
        401
      )
    );
  }

  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password!. Please log in again.',
        401
      )
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for renderd pages, no erros.
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) Verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //4) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      //console.log(currentUser);
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin','lead-guide']
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          'You don not have permission to perfome this action',
          '403'
        )
      );
    next();
  };
};

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    //1) Get user based on POSTed email
    const user = await User.findOne({
      email: req.body.email
    });
    if (!user)
      return next(
        new AppError(
          'There is no user with email address',
          404
        )
      );

    //2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3) Send it to user's email

    try {
      // await sendEmail({
      //   email: user.email,
      //   subject:
      //     'Your password reset token (valid for 10 min)',
      //   message
      // });

      const resetUrl = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;

      await new Email(user, resetUrl).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      // return next(
      //   new AppError(
      //     'There was an error sending the email. Try again later',
      //     500
      //   )
      // );
      return next(err);
    }
  }
);

exports.resetPassword = catchAsync(
  async (req, res, next) => {
    //1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    //2) If token has not expired, and there is user, set the new passwor
    if (!user) {
      return next(
        new AppError('Token is invalid or has expired', 400)
      );
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3) Update changePasswordAT property fo the user

    //4) Log the user in, send JWT
    createSendToken(user, 201, req, res);
  }
);

exports.updatePassword = catchAsync(
  async (req, res, next) => {
    // Protect middle have already checked if the user were exist.
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select(
      '+password'
    );

    //2) Chekc it POSTed current password is correct
    if (
      !(await user.correctPassword(
        req.body.passwordCurrent,
        user.password
      ))
    )
      return next(
        new AppError(
          'Your current password is wrong.',
          '401' // 401 UnAuthorized
        )
      );

    //3) IF so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended:

    //4) Log user in, send JWT
    createSendToken(user, 200, req, res);
  }
);
