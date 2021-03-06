'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  // Mongo database
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
    title: defaultEnvConfig.app.title + ' - Dev Env'
  },
  http: process.env.HTTP || 'http',
  mailer: {
    account: {
      from: process.env.ACCOUNT_MAILER_FROM || 'blablaerwebapp@gmail.com',
      options: {
        service: process.env.ACCOUNT_MAILER_SERVICE_PROVIDER || 'gmail',
        host: process.env.ACCOUNT_MAILER_HOST || 'smtp.gmail.com',
        port: process.env.ACCOUNT_MAILER_PORT || 465,
        secure: true,
        auth: {
          user: process.env.ACCOUNT_MAILER_EMAIL_ID || 'blablaerwebapp@gmail.com',
          pass: process.env.ACCOUNT_MAILER_PASSWORD || '192837645'
        }
      }
    },
    inform: {
      from: process.env.ACCOUNT_MAILER_FROM || 'blablaerwebapp@gmail.com',
      options: {
        service: process.env.ACCOUNT_MAILER_SERVICE_PROVIDER || 'gmail',
        host: process.env.ACCOUNT_MAILER_HOST || 'smtp.gmail.com',
        port: process.env.ACCOUNT_MAILER_PORT || 465,
        secure: true,
        auth: {
          user: process.env.ACCOUNT_MAILER_EMAIL_ID || 'blablaerwebapp@gmail.com',
          pass: process.env.ACCOUNT_MAILER_PASSWORD || '192837645'
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
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || '1045924145508686',
    clientSecret: process.env.FACEBOOK_SECRET || 'b0d086419f3f2780da4963a20f1c101a',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'LrxRLtYr17TE9M0SCuL2RWu4n',
    clientSecret: process.env.TWITTER_SECRET || 'z1xsq4viqJfRoy4pAONCsDbe1x89ApeSEJ7mbhHHxyqpZKTnal',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || '733507362322-pu3hf7a3eh9c1o6c8rdjosm1q8v9b91u.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || 'DkfxoyYGnhau2IRmb1_rRqyK',
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
  }
};
