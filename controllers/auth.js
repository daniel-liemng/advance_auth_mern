const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')

// Register
exports.register = async (req, res, next) => {
  const {username, email, password} = req.body

  try {
    const user = await User.create({username, email, password})

    // res.status(201).json({success: true, token: 'dfdfd'})
    sendToken(user, 201, res)
  } catch (err) {
    // res.status(500).json({success: false, error: err.message})
    next(err)
  }

}

// Login
exports.login = async (req, res, next) => {
  const {email, password} = req.body

  if (!email || !password) {
    // res.status(400).json({success: false, error: 'Please provide email and password'})
    return next(new ErrorResponse('Please provide email and password', 400))
  }

  try {
    const user = await User.findOne({email}).select("+password")

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

exports.forgotpassword = (req, res, next) => {
  res.send('Forgot')
}

exports.resetpassword = (req, res, next) => {
  res.send('Reset')
}

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken()

  res.status(statusCode).json({success: true, token})
}