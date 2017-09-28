'use strict';

module.exports = {
  // SSL
  secure: {
    ssl: false,
    privateKey: '/etc/letsencrypt/live/www.cadobongdafree.com/privkey.pem',
    certificate: '/etc/letsencrypt/live/www.cadobongdafree.com/cert.pem'
  },
  http: process.env.HTTP || 'http',
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || '93182jflajfoaiwudajkdnkUHAD',
  // Mongo database
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/blablaer',
    options: {
      user: 'BlablaerAdmin',
      pass: 'a9123kjfiwd32lk3jhhd434'
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: process.env.LOG_FORMAT || 'combined',
    options: {
      // Stream defaults to process.stdout
      // Uncomment/comment to toggle the logging to a log on the file system
      stream: {
        directoryPath: process.env.LOG_DIR_PATH || process.cwd() + '/logs',
        fileName: process.env.LOG_FILE || 'access.log',
        rotatingLogs: { // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
          active: process.env.LOG_ROTATING_ACTIVE === 'true' ? true : false, // activate to use rotating logs 
          fileName: process.env.LOG_ROTATING_FILE || 'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
          frequency: process.env.LOG_ROTATING_FREQUENCY || 'daily',
          verbose: process.env.LOG_ROTATING_VERBOSE === 'true' ? true : false
        }
      }
    }
  },
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
    clientID: process.env.FACEBOOK_ID || '1687290154629169',
    clientSecret: process.env.FACEBOOK_SECRET || 'dbe4cc32b74448cce1b0f87f5d21986c',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'a36McXPyiEj5VuriKsZvzxozc',
    clientSecret: process.env.TWITTER_SECRET || 'DFlechKegQzjuBJhHCSr0THVFIpuiiphP5gTm2R8loZTEfbHKf',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || '733507362322-8h3opimem8vbkrpqlk514qmgp2k0d1ds.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || '2rwQ73Cbn6gneD285a4ljzmo',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || '81vweff38wvefi',
    clientSecret: process.env.LINKEDIN_SECRET || 'efY69dZN1Sz2kNrY',
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
    sandbox: false
  }
};
