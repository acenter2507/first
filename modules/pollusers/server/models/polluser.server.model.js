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
  name: {
    type: String,
    default: '',
    required: 'Please fill Polluser name',
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

mongoose.model('Polluser', PolluserSchema);
