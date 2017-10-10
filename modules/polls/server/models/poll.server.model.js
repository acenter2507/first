'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  paginate = require('mongoose-paginate'),
  slug = require('mongoose-url-slugs');

/**
 * Poll Schema
 */
var PollSchema = new Schema({
  // Title poll
  title: { type: String, required: 'Please fill Poll title', trim: true },
  // Nội dung poll
  body: { type: String, required: 'Please fill Poll body', trim: true },
  // Tóm tắt
  summary: { type: String, default: '' },
  // Ngôn ngữ
  language: { type: String, default: '' },
  // Mã loại poll
  category: { type: Schema.ObjectId, ref: 'Category' },
  // Cho phép khách vote poll
  allow_guest: { type: Boolean, default: false },
  // Cho phép user add option
  allow_add: { type: Boolean, default: false },
  // Cho phép user vote nhiều options
  allow_multiple: { type: Boolean, default: false },
  // Poll private hoặc public
  isPublic: { type: Boolean, default: false },
  // Mã code khi share poll
  share_code: { type: String, default: '' },
  // User đã tạo poll
  user: { type: Schema.ObjectId, ref: 'User' },
  // Hạn close poll
  close: { type: 'Date', default: null },
  // Đếm số lần view của poll
  viewCnt: { type: 'Number', default: 0 },
  // Đếm số lần vote của poll
  voteCnt: { type: 'Number', default: 0 },
  // Đếm số lần comment của poll
  cmtCnt: { type: 'Number', default: 0 },
  // Đếm số lần like của poll
  likeCnt: { type: 'Number', default: 0 },
  // Đếm số lần bị report
  beReportCnt: { type: 'Number', default: 0 },
  // Ngày tạo
  created: { type: Date, default: Date.now },
  // Ngày thay đổi
  updated: { type: Date },
  /**
   * LenhHN update đổi cấu trúc db 20171008
   */
  tags: [{ type: Schema.ObjectId, ref: 'Tag' }]
});
// Tạo index search
PollSchema.index({ title: 'text', body: 'text', 'tags.name': 'text' });
// Plugin tạo slug url
PollSchema.plugin(slug('title', { update: true }));
// Plugin hỗ trợ pagination
PollSchema.plugin(paginate);

PollSchema.pre('save', function (next) {
  this.updated = new Date();
  next();
});

PollSchema.statics.countUpView = function (id, callback) {
  return this.findById(id).exec(function (err, poll) {
    if (poll) {
      poll.viewCnt += 1;
      return poll.save();
    } else {
      console.log('Error!: Not found poll with ID: ' + id);
    }
  });
};

PollSchema.statics.countUpVote = function (id, callback) {
  return this.findById(id).exec(function (err, poll) {
    if (poll) {
      poll.voteCnt += 1;
      return poll.save();
    } else {
      console.log('Error!: Not found poll with ID: ' + id);
    }
  });
};

PollSchema.statics.countDownVote = function (id, callback) {
  return this.findById(id).exec(function (err, poll) {
    if (poll) {
      poll.voteCnt -= 1;
      return poll.save();
    } else {
      console.log('Error!: Not found poll with ID: ' + id);
    }
  });
};

PollSchema.statics.countUpCmt = function (id, callback) {
  return this.findById(id).exec(function (err, poll) {
    if (poll) {
      poll.cmtCnt += 1;
      return poll.save();
    } else {
      console.log('Error!: Not found poll with ID: ' + id);
    }
  });
};

PollSchema.statics.countDownCmt = function (id, callback) {
  return this.findById(id).exec(function (err, poll) {
    if (poll) {
      poll.cmtCnt -= 1;
      return poll.save();
    } else {
      console.log('Error!: Not found poll with ID: ' + id);
    }
  });
};

PollSchema.statics.countLike = function (id, cnt, callback) {
  return this.findById(id).exec(function (err, poll) {
    if (poll) {
      poll.likeCnt += cnt;
      return poll.save();
    } else {
      console.log('Error!: Not found poll with ID: ' + id);
    }
  });
};

PollSchema.statics.countUpBeReport = function (id) {
  return this.findById(id).exec(function (err, poll) {
    if (poll) {
      poll.beReportCnt += 1;
      return poll.save();
    }
  });
};
PollSchema.statics.removeTag = function (tagId) {
  return this.find({ tags: tagId }).exec(function (err, polls) {
    polls.forEach(function (poll) {
      poll.tags.pull(tagId);
      return poll.save();
    });
  });
};
mongoose.model('Poll', PollSchema);
