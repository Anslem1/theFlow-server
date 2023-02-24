const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../../Models/User')

const nodemailer = require('nodemailer')

exports.signUp = async (req, res) => {

  User.findOne({ email: req.body.email }).exec((error, email) => {
    error && res.status(400).json({ error })
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
    } else if (!user) {
      res.status(400).json({ message: 'We could not find user' })
    } else return
  })
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  User.findOne({ email }).exec((error, user) => {
    error && res.status(400).json({ error })
    if (user) {
      const secretJWT = process.env.JWT_SECRET
      const token = jwt.sign({ _id: email._id }, secretJWT, {
        expiresIn: '1h'
      })
      let resetPasswordLink
      if (process.env.NODE_ENV === 'development')
        // Server running on Localhost
        resetPasswordLink = `http://localhost:8080/api/auth/reset-password/${user._id}/${token}`
      // running on the web server
      else
        resetPasswordLink = `https://theflow-server.onrender.com/api/auth/reset-password/${user._id}/${token}`

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.NODE_MAILER_EMAIL,
          pass: process.env.NODE_MAILER_PASSWORD
        }
      })

      var mailOptions = {
        from: process.env.NODE_MAILER_EMAIL,
        to: user.email,
        subject: 'theFlow password reset',
        html: `Click on the <a href=${resetPasswordLink}>link</a> to reset password. Valid for 10 minutes`
      }
      // res.json({message:})
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          if (info.response) {
            try {
              res.status(200).json({
                message:
                  "A reset link has been sent to your email. Check your spam if you can't find it in your inbox"
              })
            } catch (error) {
              console.log({ error })
            }
          }
        }
      })
    } else return res.status(400).json({ message: 'User does not exist' })
  })
}

exports.resetPasswordGet = async (req, res) => {
  const { id, token } = req.params
  // console.log(req.params)
  User.findOne({ _id: id }).exec((error, user) => {
    error && console.log({ error })

    if (user) {
      const secretJWT = process.env.JWT_SECRET
      try {
        jwt.verify(token, secretJWT)
        res.render('index', { email: user.email, status: 'Not verified' })
      } catch (error) {
        console.log('not verified')
        res.send('not verified')
        console.log({ error })
      }
    } else return res.status(400).json({ message: 'User does not exist' })
  })
}
exports.resetPasswordPost = async (req, res) => {
  const { id, token } = req.params
  const { password, confirmPassword } = req.body

  User.findOne({ _id: id }).exec(async (error, user) => {
    error && console.log({ error })

    if (user) {
      const secretJWT = process.env.JWT_SECRET

      try {
        if (password === confirmPassword) {
          jwt.verify(token, secretJWT)
          const salt = await bcrypt.genSalt(12)
          const hashedPassword = await bcrypt.hash(req.body.password, salt)
          User.updateOne(
            { _id: id },
            {
              $set: {
                password: hashedPassword
              }
            }
          ).exec((error, password) => {
            error && res.status(400).json({ error })

            if (password) {
              if (process.env.NODE_ENV === 'development') {
                res.redirect('http://localhost:3000/')
              } else {
                res.redirect('https://theflow.vercel.app')
              }
            }
          })
        } else res.json({ message: 'password does not match' })
      } catch (error) {
        res.send('not verified')
        console.log({ error })
      }
    } else return res.status(400).json({ message: 'User does not exist' })
  })
}

exports.signOut = (req, res) => {
  res.clearCookie('token')
  res.status(200).json({
    message: 'You have signed out successfully'
  })
}
