'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  paginate = require('mongoose-paginate'),
  slug = require('mongoose-url-slugs'),
  crypto = require('crypto'),
  validator = require('validator');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (email) {
  return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
  displayName: {
    type: String,
    trim: true,
    validate: [validateLocalStrategyProperty, 'Please fill in your last name']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    default: '',
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  password: {
    type: String,
    default: ''
  },
  salt: {
    type: String
  },
  profileImageURL: {
    type: String,
    default: 'modules/users/client/img/brand/icon.png'
  },
  provider: {
    type: String,
    required: 'Provider is required'
  },
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user'],
    required: 'Please provide at least one role'
  },
  updated: {
    type: Date
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Number, // 0: First time 1: Waiting - 2: Actived - 3: Block 
    default: 0
  },
  language: {
    type: String,
    default: 'en'
  },
  // Các số liệu thống kê của user
  report: {
    // Số poll đã tạo
    pollCnt: { type: 'Number', default: 0 },
    // Số comment đã tạo
    cmtCnt: { type: 'Number', default: 0 },
    // Số vote đã tạo
    voteCnt: { type: 'Number', default: 0 },
    // Số like đã tạo
    likeCnt: { type: 'Number', default: 0 },
    // Xếp hạng
    rank: { type: 'Number', default: 0 },
    // Số option đã tham gia đề xuất
    suggestCnt: { type: 'Number', default: 0 },
    // Số lần được ghé tham page cá nhân
    beViewCnt: { type: 'Number', default: 0 },
    // Số poll đã xem
    viewCnt: { type: 'Number', default: 0 },
    // Số lần report người khác
    reportCnt: { type: 'Number', default: 0 },
    // Số lần bị report
    beReportCnt: { type: 'Number', default: 0 }
  },
  activeAccountToken: {
    type: String
  },
  providerData: {},
  additionalProvidersData: {},
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

UserSchema.plugin(slug('displayName', { update: true }));
UserSchema.plugin(paginate);

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

UserSchema.statics.generateRandomPassphrase = function () {
  return new Promise(function (resolve, reject) {
    var password = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&@';
    for (var i = 0; i < 8; i++) {
      password += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return resolve(password);
  });
};

UserSchema.statics.countUpPoll = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.pollCnt += 1;
      return user.save();
    }
  });
};
UserSchema.statics.countDownPoll = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.pollCnt -= 1;
      return user.save();
    }
  });
};

UserSchema.statics.countUpCmt = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.cmtCnt += 1;
      return user.save();
    }
  });
};
UserSchema.statics.countDownCmt = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.cmtCnt -= 1;
      return user.save();
    }
  });
};

UserSchema.statics.countUpVote = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.voteCnt += 1;
      return user.save();
    }
  });
};
UserSchema.statics.countDownVote = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.voteCnt -= 1;
      return user.save();
    }
  });
};

UserSchema.statics.countUpLike = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.likeCnt += 1;
      return user.save();
    }
  });
};
UserSchema.statics.countDownLike = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.likeCnt -= 1;
      return user.save();
    }
  });
};

UserSchema.statics.countUpSuggest = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.suggestCnt += 1;
      return user.save();
    }
  });
};

UserSchema.statics.countUpBeView = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.beViewCnt += 1;
      return user.save();
    }
  });
};

UserSchema.statics.countUpView = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.viewCnt += 1;
      return user.save();
    }
  });
};

UserSchema.statics.countUpReport = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.reportCnt += 1;
      return user.save();
    }
  });
};

UserSchema.statics.countUpBeReport = function (id) {
  return this.findById(id).exec(function (err, user) {
    if (user) {
      user.report.beReportCnt += 1;
      return user.save();
    }
  });
};


mongoose.model('User', UserSchema);
