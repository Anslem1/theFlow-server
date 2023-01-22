const router = require('express').Router()

const { signUp, signIn, signOut } = require('../../Controllers/User/User')
const {
  validateSignUpRequest,
  isRequestValidated,
  validateSignInRequest
} = require('../../Validators/Auth')

router
  .post('/signup', validateSignUpRequest, isRequestValidated, signUp)
  .post('/signin', validateSignInRequest, isRequestValidated, signIn)
  .post('/signout', signOut)

module.exports = router
