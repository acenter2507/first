'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Follow Schema
 */
var FollowSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  poll: {
    type: Schema.ObjectId,
    ref: 'Poll'
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Follow', FollowSchema);
