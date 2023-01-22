const { check, validationResult } = require('express-validator')

exports.validateSignUpRequest = [
  check('email').notEmpty().withMessage('Email is required'),
  check('username').notEmpty().withMessage('Username is required'),
  check('password')
    .isLength({ min: 6 })
    .withMessage({ message: 'password is should be more than 6 characters' })
]
exports.validateSignInRequest = [
  check('email').notEmpty().withMessage({ message: 'Email is required' }),
  check('password')
    .isLength({ min: 6 })
    .withMessage({ message: 'password is should be more than 6 characters' })
]

exports.isRequestValidated = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.array().length > 0) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }
  next()
}
