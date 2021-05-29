const router = require('express').Router()

const {login, register, forgotpassword, resetpassword} = require('../controllers/auth')

router.route('/register').post(register)

router.route('/login').post(login)

router.route('/forgotpassword').post(forgotpassword)

router.route('/resetpassword/:resetToken').post(resetpassword)

module.exports = router