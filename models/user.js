const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  pas: {
    type: String,
    required: true
  },
  avatar: Buffer,
})

module.exports = mongoose.model('User', userSchema)
