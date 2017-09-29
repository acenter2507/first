'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * View Schema
 */
var UserreportSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  viewCnt: {
    type: 'Number',
    default: 0
  },
  pollCnt: {
    type: 'Number',
    default: 0
  },
  cmtCnt: {
    type: 'Number',
    default: 0
  },
  voteCnt: {
    type: 'Number',
    default: 0
  },
  rank: {
    type: 'Number',
    default: 0
  }
});

mongoose.model('Userreport', UserreportSchema);