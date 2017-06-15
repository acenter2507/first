'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Opt = mongoose.model('Opt'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  opt;

/**
 * Opt routes tests
 */
describe('Opt CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Opt
    user.save(function () {
      opt = {
        name: 'Opt name'
      };

      done();
    });
  });

  it('should be able to save a Opt if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Opt
        agent.post('/api/opts')
          .send(opt)
          .expect(200)
          .end(function (optSaveErr, optSaveRes) {
            // Handle Opt save error
            if (optSaveErr) {
              return done(optSaveErr);
            }

            // Get a list of Opts
            agent.get('/api/opts')
              .end(function (optsGetErr, optsGetRes) {
                // Handle Opts save error
                if (optsGetErr) {
                  return done(optsGetErr);
                }

                // Get Opts list
                var opts = optsGetRes.body;

                // Set assertions
                (opts[0].user._id).should.equal(userId);
                (opts[0].name).should.match('Opt name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Opt if not logged in', function (done) {
    agent.post('/api/opts')
      .send(opt)
      .expect(403)
      .end(function (optSaveErr, optSaveRes) {
        // Call the assertion callback
        done(optSaveErr);
      });
  });

  it('should not be able to save an Opt if no name is provided', function (done) {
    // Invalidate name field
    opt.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Opt
        agent.post('/api/opts')
          .send(opt)
          .expect(400)
          .end(function (optSaveErr, optSaveRes) {
            // Set message assertion
            (optSaveRes.body.message).should.match('Please fill Opt name');

            // Handle Opt save error
            done(optSaveErr);
          });
      });
  });

  it('should be able to update an Opt if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Opt
        agent.post('/api/opts')
          .send(opt)
          .expect(200)
          .end(function (optSaveErr, optSaveRes) {
            // Handle Opt save error
            if (optSaveErr) {
              return done(optSaveErr);
            }

            // Update Opt name
            opt.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Opt
            agent.put('/api/opts/' + optSaveRes.body._id)
              .send(opt)
              .expect(200)
              .end(function (optUpdateErr, optUpdateRes) {
                // Handle Opt update error
                if (optUpdateErr) {
                  return done(optUpdateErr);
                }

                // Set assertions
                (optUpdateRes.body._id).should.equal(optSaveRes.body._id);
                (optUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Opts if not signed in', function (done) {
    // Create new Opt model instance
    var optObj = new Opt(opt);

    // Save the opt
    optObj.save(function () {
      // Request Opts
      request(app).get('/api/opts')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Opt if not signed in', function (done) {
    // Create new Opt model instance
    var optObj = new Opt(opt);

    // Save the Opt
    optObj.save(function () {
      request(app).get('/api/opts/' + optObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', opt.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Opt with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/opts/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Opt is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Opt which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Opt
    request(app).get('/api/opts/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Opt with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Opt if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Opt
        agent.post('/api/opts')
          .send(opt)
          .expect(200)
          .end(function (optSaveErr, optSaveRes) {
            // Handle Opt save error
            if (optSaveErr) {
              return done(optSaveErr);
            }

            // Delete an existing Opt
            agent.delete('/api/opts/' + optSaveRes.body._id)
              .send(opt)
              .expect(200)
              .end(function (optDeleteErr, optDeleteRes) {
                // Handle opt error error
                if (optDeleteErr) {
                  return done(optDeleteErr);
                }

                // Set assertions
                (optDeleteRes.body._id).should.equal(optSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Opt if not signed in', function (done) {
    // Set Opt user
    opt.user = user;

    // Create new Opt model instance
    var optObj = new Opt(opt);

    // Save the Opt
    optObj.save(function () {
      // Try deleting Opt
      request(app).delete('/api/opts/' + optObj._id)
        .expect(403)
        .end(function (optDeleteErr, optDeleteRes) {
          // Set message assertion
          (optDeleteRes.body.message).should.match('User is not authorized');

          // Handle Opt error error
          done(optDeleteErr);
        });

    });
  });

  it('should be able to get a single Opt that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Opt
          agent.post('/api/opts')
            .send(opt)
            .expect(200)
            .end(function (optSaveErr, optSaveRes) {
              // Handle Opt save error
              if (optSaveErr) {
                return done(optSaveErr);
              }

              // Set assertions on new Opt
              (optSaveRes.body.name).should.equal(opt.name);
              should.exist(optSaveRes.body.user);
              should.equal(optSaveRes.body.user._id, orphanId);

              // force the Opt to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Opt
                    agent.get('/api/opts/' + optSaveRes.body._id)
                      .expect(200)
                      .end(function (optInfoErr, optInfoRes) {
                        // Handle Opt error
                        if (optInfoErr) {
                          return done(optInfoErr);
                        }

                        // Set assertions
                        (optInfoRes.body._id).should.equal(optSaveRes.body._id);
                        (optInfoRes.body.name).should.equal(opt.name);
                        should.equal(optInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Opt.remove().exec(done);
    });
  });
});
