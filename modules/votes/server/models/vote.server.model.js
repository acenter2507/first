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
  poll: {
    type : Schema.ObjectId,
    ref : 'Poll'
  },
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
  updateCnt: {
    type: Number,
    default: 0
  },
  updated: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Vote', VoteSchema);
