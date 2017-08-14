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
  rank: {
    type: 'Number',
    default: 0
  }
});

UserreportSchema.statics.countUpView = function(id, callback) {
  return this.findOne({ user: id }).exec(function(err, report) {
    report.viewCnt += 1;
    return report.save();
  });
};

UserreportSchema.statics.countUpPoll = function(id, callback) {
  return this.findOne({ user: id }).exec(function(err, report) {
    report.pollCnt += 1;
    return report.save();
  });
};

UserreportSchema.statics.countDownPoll = function(id, callback) {
  return this.findOne({ user: id }).exec(function(err, report) {
    report.pollCnt -= 1;
    return report.save();
  });
};

UserreportSchema.statics.countUpCmt = function(id, callback) {
  return this.findOne({ user: id }).exec(function(err, report) {
    report.cmtCnt += 1;
    return report.save();
  });
};

UserreportSchema.statics.countDownCmt = function(id, callback) {
  return this.findOne({ user: id }).exec(function(err, report) {
    report.cmtCnt -= 1;
    return report.save();
  });
};

mongoose.model('Userreport', UserreportSchema);