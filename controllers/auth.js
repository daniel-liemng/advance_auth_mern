const crypto = require('crypto')

const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')

// Register
exports.register = async (req, res, next) => {
  const { username, email, password } = req.body

  try {
    const user = await User.create({ username, email, password })

    // res.status(201).json({success: true, token: 'dfdfd'})
    sendToken(user, 201, res)
  } catch (err) {
    // res.status(500).json({success: false, error: err.message})
    next(err)
  }
}

// Login
exports.login = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    // res.status(400).json({success: false, error: 'Please provide email and password'})
    return next(new ErrorResponse('Please provide email and password', 400))
  }

  try {
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      // res.status(404).json({success: false, error: 'Invalid credentials'})
      return next(new ErrorResponse('Invalid Credentials', 404))
    }

    const isMatch = await user.matchPasswords(password)

    if (!isMatch) {
      // res.status(404).json({success: false, error: 'Invalid credentials'})
      return next(new ErrorResponse('Invalid Credentials', 401))
    }

    // res.status(200).json({success: true, token: 'adfd'})
    sendToken(user, 200, res)
  } catch (err) {
    // res.status(500).json({success: false, error: err.message})
    next(err)
  }
}

// Forget Password
exports.forgotpassword = async (req, res, next) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return next(new ErrorResponse('Email could not be sent', 404))
    }

    const resetToken = user.getResetPasswordToken()

    // Save user -> contain resetPassToken and resetPassExpire in Model
    await user.save()

    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`

    const message = `
      <h1>You have requested a password reset.</h1>
      <p>Please go to this link to reset your password.</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: message,
      })

      res.status(200).json({ success: true, data: 'Email Sent' })
    } catch (err) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined

      await user.save()

      return next(new ErrorResponse('Email could not be sent', 500))
    }
  } catch (err) {
    next(err)
  }
}

exports.resetpassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex')

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return next(new ErrorResponse('Invalid Reset Token', 400))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    res.status(201).json({
      success: true,
      data: 'Password Reset Success',
    })
  } catch (err) {
    next(err)
  }
}

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken()

  res.status(statusCode).json({ success: true, token })
}
