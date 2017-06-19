'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Opt Schema
 */
var OptSchema = new Schema({
  title: {
    type : String,
    default : '',
    required: 'Please fill Option title',
    trim : true
  },
  body: {
    type : String,
    default : '',
    required: 'Please fill Option body',
    trim : true
  },
  image: {
    type: String,
    default: 'modules/opts/client/img/option.png'
  },
  poll: {
    type : Schema.ObjectId,
    ref : 'Poll',
    required: 'Please fill Poll info',
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  voteCnt: {
    type : Number,
    default : 0
  },
  created: {
    type: Date,
    default: Date.now
  }
});

/**
 * Hook a pre save method to hash the password
 */
OptSchema.pre('save', function (next) {
  next();
});

mongoose.model('Opt', OptSchema);
