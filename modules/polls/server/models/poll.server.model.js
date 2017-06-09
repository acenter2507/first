'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Poll Schema
 */
var PollSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Poll name',
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

mongoose.model('Poll', PollSchema);
