const router = require('express').Router()

const {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  resetPasswordGet,
  resetPasswordPost
} = require('../../Controllers/User/User')
const {
  validateSignUpRequest,
  isRequestValidated,
  validateSignInRequest
} = require('../../Validators/Auth')

router
  .post('/signup', validateSignUpRequest, isRequestValidated, signUp)
  .post('/signin', validateSignInRequest, isRequestValidated, signIn)
  .post('/forgot-password', forgotPassword)
  .get('/reset-password/:id/:token', resetPasswordGet)
  .post('/reset-password/:id/:token', resetPasswordPost)
  .post('/signout', signOut)

module.exports = router
