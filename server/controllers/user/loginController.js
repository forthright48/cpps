const express = require('express');
const User = require('mongoose').model('User');
const recaptcha = require('express-recaptcha');
const allowSignUp = require('middlewares/allowSignUp');
const _ = require('lodash');
const {sendEmailVerification} = require('./verificationController');

const router = express.Router();

router.get('/login', get_login);
router.post('/login', post_login);
router.get('/register', [recaptcha.middleware.render, allowSignUp], get_register);
router.post('/register', [recaptcha.middleware.verify, allowSignUp], post_register);
router.get('/logout', get_logout);

module.exports = {
  addRouter(app) {
    app.use('/user', router);
  }
};

/**
 *Implementation
 */
function get_login(req, res) {
  return res.render('user/login');
}

function post_login(req, res, next) {
  const email = User.normalizeEmail(req.body.email);
  const password = req.body.password;

  User.findOne({
      email
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) {
        req.flash('error', 'Email address not found or Password did not match');
        return res.redirect('/user/login');
      }
      if (user.comparePassword(password)) {
        req.flash('success', 'Successfully logged in');
        req.session.login = true;
        req.session.verified = user.verified;
        if (!user.verified) req.session.verificationValue = user.verificationValue;
        req.session.email = email;
        req.session.status = user.status;
        req.session.userId = user._id;
        req.session.username = user.username;
        return res.redirect('/');
      } else {
        req.flash('error', 'Email address not found or Password did not match');
        return res.redirect('/user/login');
      }
    });
}

function get_register(req, res) {
  return res.render('user/register', {
    recaptcha: req.recaptcha
  });
}

async function post_register(req, res, next) {
  if (req.recaptcha.error) {
    req.flash('error', 'Please complete the captcha');
    return res.redirect('/user/register');
  }
  const email = User.normalizeEmail(req.body.email);
  const password = User.createHash(req.body.password);

  const user = new User({
    email,
    password,
    verificationValue: _.random(100000, 999999),
  });

  try {
    await user.save();
    req.flash('success', 'Successfully registered');
    req.session.login = true;
    req.session.verified = false;
    req.session.verificationValue = user.verificationValue;
    req.session.email = email;
    req.session.status = user.status;
    req.session.userId = user._id;
  } catch (err) {
    if (err.code === 11000) {
      req.flash('error', 'Email address already exists');
    } else {
      req.flash('error', `An error occured while creating user. Error code: ${err.code}`);
    }
    return res.redirect('/user/register');
  }

  try {
    await sendEmailVerification(user.email, user.verificationValue);
    req.flash('success', 'Verification Code sent to your email');
  } catch (err) {
    req.flash('error', `An error occured while sending email for verfication.`);
  } finally {
    return res.redirect('/user/verify');
  }
}

function get_logout(req, res, next) {
  req.session.destroy(function(err) {
    if (err) next(err);
    return res.redirect('/');
  });
}
