'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Voteopt Schema
 */
var VoteoptSchema = new Schema({
  vote: {
    type : Schema.ObjectId,
    ref : 'Vote',
    required: 'Please fill Vote info'
  },
  opt: {
    type : Schema.ObjectId,
    ref : 'Opt',
    required: 'Please fill Option info'
  }
});

mongoose.model('Voteopt', VoteoptSchema);
