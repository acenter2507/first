'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Pollreport Schema
 */
var PollreportSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Pollreport name',
    trim: true
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

mongoose.model('Pollreport', PollreportSchema);
