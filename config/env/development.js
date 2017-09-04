'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/polls-dev',
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    options: {
      // Stream defaults to process.stdout
      // Uncomment/comment to toggle the logging to a log on the file system
      //stream: {
      //  directoryPath: process.cwd(),
      //  fileName: 'access.log',
      //  rotatingLogs: { // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
      //    active: false, // activate to use rotating logs 
      //    fileName: 'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
      //    frequency: 'daily',
      //    verbose: false
      //  }
      //}
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || '1045924145508686',
    clientSecret: process.env.FACEBOOK_SECRET || 'b0d086419f3f2780da4963a20f1c101a',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/github/callback'
  },
  paypal: {
    clientID: process.env.PAYPAL_ID || 'CLIENT_ID',
    clientSecret: process.env.PAYPAL_SECRET || 'CLIENT_SECRET',
    callbackURL: '/api/auth/paypal/callback',
    sandbox: true
  },
  mailer: {
    account: {
      from: process.env.ACCOUNT_MAILER_FROM || 'account@cadobongdafree.com',
      options: {
        // service: process.env.ACCOUNT_MAILER_SERVICE_PROVIDER || 'Gmail',
        host: process.env.ACCOUNT_MAILER_HOST || 'mx1.hostinger.vn',
        port: process.env.ACCOUNT_MAILER_PORT || '587',
        secure: true,
        tls: { cipher: 'SSLv3' },
        auth: {
          user: process.env.ACCOUNT_MAILER_EMAIL_ID || 'account@cadobongdafree.com',
          pass: process.env.ACCOUNT_MAILER_PASSWORD || '1aA@1aA@'
        }
      }
    },
    inform: {
      from: process.env.INFORM_MAILER_FROM || 'acenter2507@gmail.com',
      options: {
        service: process.env.INFORM_MAILER_SERVICE_PROVIDER || 'Gmail',
        auth: {
          user: process.env.INFORM_MAILER_EMAIL_ID || 'acenter2507',
          pass: process.env.INFORM_MAILER_PASSWORD || '1@Aa1@Aa'
        }
      }
    },
  },
  livereload: true,
  seedDB: {
    seed: process.env.MONGO_SEED === 'true' ? true : false,
    options: {
      logResults: process.env.MONGO_SEED_LOG_RESULTS === 'false' ? false : true,
      seedUser: {
        provider: 'local',
        email: process.env.MONGO_SEED_USER_EMAIL || 'user@localhost.com',
        displayName: 'User Local',
        roles: ['user']
      },
      seedAdmin: {
        provider: 'local',
        email: process.env.MONGO_SEED_ADMIN_EMAIL || 'admin@localhost.com',
        displayName: 'Admin Local',
        roles: ['user', 'admin']
      }
    }
  }
};
