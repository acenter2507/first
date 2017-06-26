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
  color: {
    type : String,
    default : '#267ED5'
  },
  status: {
    type : Number,
    default : 1 // 1: Approved, 2: Waiting, 3: Rejected
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
