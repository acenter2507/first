'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Report Schema
 */
var ReportSchema = new Schema({
  poll: {
    type : Schema.ObjectId,
    ref : 'Poll'
  },
  victim: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String,
    default: ''
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Report', ReportSchema);
