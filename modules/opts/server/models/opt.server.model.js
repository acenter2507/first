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
  poll: {
    type : Schema.ObjectId,
    ref : 'Poll'
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

mongoose.model('Opt', OptSchema);
