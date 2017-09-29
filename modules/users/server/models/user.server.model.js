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
    default: 'modules/users/client/img/profile/default.png'
  },
  provider: {
    type: String,
    required: 'Provider is required'
  },
  providerData: {},
  additionalProvidersData: {},
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
  activeAccountToken: {
    type: String
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  language: {
    type: String,
    default: 'en'
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
 * Hook a pre validate method to test the local password
 */
// UserSchema.methods.verifyEmail = function () {
  // if (this.email.length <= 0) return '';
  // var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // if (!re.test(this.email)) return false;

// };

/**
 * Hook a pre validate method to test the local password
 */
// UserSchema.pre('validate', function (next) {
//   if (this.provider === 'local' && this.password && this.isModified('password')) {
//     var result = owasp.test(this.password);
//     if (result.errors.length) {
//       var error = result.errors.join(' ');
//       this.invalidate('password', error);
//     }
//   }

//   next();
// });

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

/**
* Generates a random passphrase that passes the owasp test.
* Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
* NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
*/
UserSchema.statics.generateRandomPassphrase = function () {
  return new Promise(function (resolve, reject) {
    var password = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 8; i++) {
      password += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return resolve(password);
  });
};

mongoose.model('User', UserSchema);
