const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      require: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('User', projectSchema)
