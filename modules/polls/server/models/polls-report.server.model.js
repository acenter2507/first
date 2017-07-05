'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * View Schema
 */
var PollReportSchema = new Schema({
  poll: {
    type: Schema.ObjectId,
    ref: 'Poll'
  },
  viewCnt: {
    type: 'Number',
    default: 0
  },
  voteCnt: {
    type: 'Number',
    default: 0
  },
  cmtCnt: {
    type: 'Number',
    default: 0
  },
  likeCnt: {
    type: 'Number',
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
  }
});

PollReportSchema.statics.countUpView = function(id, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.viewCnt += 1;
    return report.save();
  });
};

PollReportSchema.statics.countUpVote = function(id, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.voteCnt += 1;
    return report.save();
  });
};

PollSchema.statics.countUpCmt = function(id, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.cmtCnt += 1;
    return report.save();
  });
};

PollSchema.statics.countDownCmt = function(id, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.cmtCnt -= 1;
    return report.save();
  });
};

PollSchema.statics.countLike = function(id, cnt, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.likeCnt += cnt;
    return report.save();
  });
};
mongoose.model('PollReport', PollReportSchema);