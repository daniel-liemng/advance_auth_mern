const express = require('express')
const morgan = require('morgan')

require('dotenv').config({path: './config.env'})

const app = express()

app.use(express.json())
app.use(morgan('dev'))

// Route
app.use('/api/auth', require('./routes/auth'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))