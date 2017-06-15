'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Opt Schema
 */
var OptSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Opt name',
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

mongoose.model('Opt', OptSchema);
