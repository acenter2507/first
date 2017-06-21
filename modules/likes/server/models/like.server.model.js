'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Like Schema
 */
var LikeSchema = new Schema({
  poll: {
    type: Schema.ObjectId,
    ref: 'Poll'
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  type: {
    type: Number,
    default: 0 // 0: notthing, 1: like, 2: dislike
  },
  lastType: {
    type: Number,
    default: 0 // 0: notthing, 1: like, 2: dislike
  }
});

mongoose.model('Like', LikeSchema);
