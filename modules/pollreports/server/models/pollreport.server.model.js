'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * View Schema
 */
var PollreportSchema = new Schema({
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

PollreportSchema.statics.countUpView = function(id, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.viewCnt += 1;
    return report.save();
  });
};

PollreportSchema.statics.countUpVote = function(id, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.voteCnt += 1;
    return report.save();
  });
};

PollreportSchema.statics.countUpCmt = function(id, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.cmtCnt += 1;
    return report.save();
  });
};

PollreportSchema.statics.countDownCmt = function(id, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.cmtCnt -= 1;
    return report.save();
  });
};

PollreportSchema.statics.countLike = function(id, cnt, callback) {
  return this.findOne({ poll: id }).exec(function(err, report) {
    report.likeCnt += cnt;
    return report.save();
  });
};
mongoose.model('Pollreport', PollreportSchema);