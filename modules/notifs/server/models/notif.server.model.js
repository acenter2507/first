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
    default: 0 // 0: comment to, 1: comment
  },
  content: {
    type: String,
    default: '',
    required: 'Please fill Notif content',
    trim: true
  },
  status: {
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
