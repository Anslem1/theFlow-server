const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../../Models/User')

exports.signUp = async (req, res) => {
  //   let isEmail, isUserName
  //   try {
  //     isEmail = await User.findOne({ email: req.body.email })
  //   } catch (error) {
  //     console.log({ error, message: 'from Find email' })
  //   }
  //   try {
  //     isUserName = await User.findOne({ username: req.body.username })
  //   } catch (error) {
  //     console.log({ error, message: 'from Find username' })
  //   }
  //   isEmail && res.status(400).json({ message: 'Email already exist' })
  //  U isUserName && res.status(400).json({ message: 'Username already exist' })
  //   User.findOne({ email: req.body.email }).exec((error, email) => {})

  //   const salt = await bcrypt.genSalt(12)
  //   const hashedPassword = await bcrypt.hash(req.body.password, salt)

  //   const newUser = new User({
  //     username: req.body.username,
  //     email: req.body.email,
  //     password: hashedPassword
  //   })
  //   newUser.save((error, user) => {
  //     error && res.status(400).json({ error })
  //     if (user) {
  //       const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
  //         expiresIn: '30d'
  //       })
  //       res
  //         .status(200)
  //         .json({ token, user, message: 'User successfully created' })
  //     }
  //   })

  User.findOne({ email: req.body.email }).exec((error, email) => {
    error && re.status(400).json({ error })
    try {
      User.findOne({ username: req.body.username }).exec(
        async (error, username) => {
          error && res.status(400).json({ error })
          if (username && email) {
            res
              .status(400)
              .json({ message: 'Username and email already exist' })
          } else if (email) {
            res.status(400).json({ message: 'Email already exist' })
          } else if (username) {
            res.status(400).json({ message: 'username already exist' })
          } else {
            const salt = await bcrypt.genSalt(12)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            const { email, username } = req.body
            const newUser = new User({
              email,
              username,
              password: hashedPassword
            })
            newUser.save((error, user) => {
              error && res.status(400).json({ error })
              if (user) {
                const token = jwt.sign(
                  { _id: user._id },
                  process.env.JWT_SECRET,
                  {
                    expiresIn: '30d'
                  }
                )
                const { password, ...userCreds } = user._doc
                res.status(200).json({
                  token,
                  user: userCreds,
                  message: 'User created successfully'
                })
              }
            })
          }
        }
      )
    } catch (error) {
      res.status(500).json({ error })
    }
  })
}

exports.signIn = async (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    error && res.status(400).json({ error })
    if (user) {
      const validated = await bcrypt.compare(req.body.password, user.password)
      if (user && validated) {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '30d'
        })
        res.cookie('token', token, { expiresIn: '30d' })
        const { password, ...userCreds } = user._doc
        res.status(200).json({ token, user: userCreds })
      } else {
        res.status(400).json({ message: 'Wrong email or password' })
      }
    } else {
      res.status(400).json({ message: 'We could not find user' })
    }
  })
}

exports.signOut = (req, res) => {
  res.clearCookie('token')
  res.status(200).json({
    message: 'You have signed out successfully'
  })
}
