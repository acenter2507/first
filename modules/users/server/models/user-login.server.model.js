'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * View Schema
 */
var UserloginSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: 'String',
    default: ''
  },
  agent: {
    type: 'String',
    default: ''
  }
});

mongoose.model('Userlogin', UserloginSchema);