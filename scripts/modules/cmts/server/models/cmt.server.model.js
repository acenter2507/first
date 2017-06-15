'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Cmt Schema
 */
var CmtSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Cmt name',
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

mongoose.model('Cmt', CmtSchema);
