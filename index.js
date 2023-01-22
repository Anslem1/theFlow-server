require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const cors = require('cors')
const expressBusboy = require('express-busboy')


mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(console.log('Mongo working?'))
  .catch(err => console.log({ err }))
mongoose.set('strictQuery', true)

const authRoute = require('./Routes/User/User')
const projectRoute = require('./Routes/Project/Project')
const categoryRoute = require('./Routes/Category/category')



app
  .use(cors())
  .use(express.json())
  .use('/api/auth', authRoute)
  .use('/api/project', projectRoute)
  .use('/api/category', categoryRoute)
app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`)  
})
