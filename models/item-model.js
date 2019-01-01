const mongoose = require('mongoose')

const Schema = mongoose.Schema

const itemSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: false,
    lowercase: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  calories: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  protien: {
    type: Number,
    required: true
  },
  favorite: {
    type: Boolean,
    required: false,
    default: false
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

const Item = mongoose.model('Item', itemSchema)

module.exports = Item
