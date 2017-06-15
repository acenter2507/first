'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Vote Schema
 */
var VoteSchema = new Schema({
  body: {
    type : String,
    default : '',
    trim : true
  },
  poll: {
    type : Schema.ObjectId,
    ref : 'Poll'
  },
  options: [{
    type : Schema.ObjectId,
    ref : 'Opt'
  }],
  ip: {
    type: String,
    default: ''
  },
  guest: {
    type: Boolean,
    default: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  updates: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Vote', VoteSchema);
