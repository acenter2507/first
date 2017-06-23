'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Polluser Schema
 */
var PolluserSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  poll: {
    type: Schema.ObjectId,
    ref: 'Poll'
  },
  following: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Polluser', PolluserSchema);
