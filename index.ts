require('dotenv').config()
import express = require('express')
import mongoose = require('mongoose')
import Routes from './routes/routes'
import cors from 'cors'

const PORT = process.env.PORT || 5001

const app = express()
app.use(express.json())
app.use(cors())
app.use(Routes)

mongoose.connect(process.env.DB_URL!)
.then(()=> console.log('Connected to DB'))
.catch((error) => console.log(error))

// mongoose.connect('mongodb+srv://tarasfrbslist:qwerty1234@cluster0.qu85lby.mongodb.net/db1')
// .then(()=> console.log('Connected to DB'))
// .catch((error) => console.log(error))



app.listen(PORT,() => console.log(`Server started on ${PORT} at ${(new Date()).toLocaleTimeString()}`))