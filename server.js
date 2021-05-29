const express = require('express')
const morgan = require('morgan')

const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')
const errorHanlder = require('./middleware/error')

require('dotenv').config({path: './config.env'})

connectDB()

const app = express()

app.use(express.json())
app.use(morgan('dev'))

// Route
app.use('/api/auth', require('./routes/auth'))

// Error Handler Middleware should be placed last of the middlewares
app.use(errorHandler)


const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Handle server error
process.on('unhandledRejection', (err, promise) => {
  console.log(`Logged Error: ${err}`);
  server.close(() => process.exit(1)) 
})
