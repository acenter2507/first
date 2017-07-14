'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Notif Schema
 */
var NotifSchema = new Schema({
  from: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  to: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  type: {
    type: Number,
    default: 0 // 0: like poll, 1: dislike, 2: reply, 3: comment, 4: option request
  },
  content: {
    type: String,
    default: '',
    required: 'Please fill Notif content',
    trim: true
  },
  state: {
    type: String,
    default: ''
  },
  status: {
    type: Number,
    default: 0
  },
  count: {
    type: Number,
    default: 0
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

mongoose.model('Notif', NotifSchema);
