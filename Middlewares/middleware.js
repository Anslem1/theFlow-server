const jwt = require('jsonwebtoken')
const multer = require('multer')
const { storage } = require('../cloudinary/index')

exports.requireSignin = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET)
      req.user = user
    } catch (error) {
      return res.status(500).json({ error })
    }
  } else {
    return res.status(400).json({ message: 'Authorization required' })
  }
  next()
}



exports.upload = multer({ storage })