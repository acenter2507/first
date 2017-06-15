'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Cmt = mongoose.model('Cmt'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  cmt;

/**
 * Cmt routes tests
 */
describe('Cmt CRUD tests', function () {

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

    // Save a user to the test db and create new Cmt
    user.save(function () {
      cmt = {
        name: 'Cmt name'
      };

      done();
    });
  });

  it('should be able to save a Cmt if logged in', function (done) {
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

        // Save a new Cmt
        agent.post('/api/cmts')
          .send(cmt)
          .expect(200)
          .end(function (cmtSaveErr, cmtSaveRes) {
            // Handle Cmt save error
            if (cmtSaveErr) {
              return done(cmtSaveErr);
            }

            // Get a list of Cmts
            agent.get('/api/cmts')
              .end(function (cmtsGetErr, cmtsGetRes) {
                // Handle Cmts save error
                if (cmtsGetErr) {
                  return done(cmtsGetErr);
                }

                // Get Cmts list
                var cmts = cmtsGetRes.body;

                // Set assertions
                (cmts[0].user._id).should.equal(userId);
                (cmts[0].name).should.match('Cmt name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Cmt if not logged in', function (done) {
    agent.post('/api/cmts')
      .send(cmt)
      .expect(403)
      .end(function (cmtSaveErr, cmtSaveRes) {
        // Call the assertion callback
        done(cmtSaveErr);
      });
  });

  it('should not be able to save an Cmt if no name is provided', function (done) {
    // Invalidate name field
    cmt.name = '';

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

        // Save a new Cmt
        agent.post('/api/cmts')
          .send(cmt)
          .expect(400)
          .end(function (cmtSaveErr, cmtSaveRes) {
            // Set message assertion
            (cmtSaveRes.body.message).should.match('Please fill Cmt name');

            // Handle Cmt save error
            done(cmtSaveErr);
          });
      });
  });

  it('should be able to update an Cmt if signed in', function (done) {
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

        // Save a new Cmt
        agent.post('/api/cmts')
          .send(cmt)
          .expect(200)
          .end(function (cmtSaveErr, cmtSaveRes) {
            // Handle Cmt save error
            if (cmtSaveErr) {
              return done(cmtSaveErr);
            }

            // Update Cmt name
            cmt.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Cmt
            agent.put('/api/cmts/' + cmtSaveRes.body._id)
              .send(cmt)
              .expect(200)
              .end(function (cmtUpdateErr, cmtUpdateRes) {
                // Handle Cmt update error
                if (cmtUpdateErr) {
                  return done(cmtUpdateErr);
                }

                // Set assertions
                (cmtUpdateRes.body._id).should.equal(cmtSaveRes.body._id);
                (cmtUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Cmts if not signed in', function (done) {
    // Create new Cmt model instance
    var cmtObj = new Cmt(cmt);

    // Save the cmt
    cmtObj.save(function () {
      // Request Cmts
      request(app).get('/api/cmts')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Cmt if not signed in', function (done) {
    // Create new Cmt model instance
    var cmtObj = new Cmt(cmt);

    // Save the Cmt
    cmtObj.save(function () {
      request(app).get('/api/cmts/' + cmtObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', cmt.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Cmt with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/cmts/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Cmt is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Cmt which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Cmt
    request(app).get('/api/cmts/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Cmt with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Cmt if signed in', function (done) {
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

        // Save a new Cmt
        agent.post('/api/cmts')
          .send(cmt)
          .expect(200)
          .end(function (cmtSaveErr, cmtSaveRes) {
            // Handle Cmt save error
            if (cmtSaveErr) {
              return done(cmtSaveErr);
            }

            // Delete an existing Cmt
            agent.delete('/api/cmts/' + cmtSaveRes.body._id)
              .send(cmt)
              .expect(200)
              .end(function (cmtDeleteErr, cmtDeleteRes) {
                // Handle cmt error error
                if (cmtDeleteErr) {
                  return done(cmtDeleteErr);
                }

                // Set assertions
                (cmtDeleteRes.body._id).should.equal(cmtSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Cmt if not signed in', function (done) {
    // Set Cmt user
    cmt.user = user;

    // Create new Cmt model instance
    var cmtObj = new Cmt(cmt);

    // Save the Cmt
    cmtObj.save(function () {
      // Try deleting Cmt
      request(app).delete('/api/cmts/' + cmtObj._id)
        .expect(403)
        .end(function (cmtDeleteErr, cmtDeleteRes) {
          // Set message assertion
          (cmtDeleteRes.body.message).should.match('User is not authorized');

          // Handle Cmt error error
          done(cmtDeleteErr);
        });

    });
  });

  it('should be able to get a single Cmt that has an orphaned user reference', function (done) {
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

          // Save a new Cmt
          agent.post('/api/cmts')
            .send(cmt)
            .expect(200)
            .end(function (cmtSaveErr, cmtSaveRes) {
              // Handle Cmt save error
              if (cmtSaveErr) {
                return done(cmtSaveErr);
              }

              // Set assertions on new Cmt
              (cmtSaveRes.body.name).should.equal(cmt.name);
              should.exist(cmtSaveRes.body.user);
              should.equal(cmtSaveRes.body.user._id, orphanId);

              // force the Cmt to have an orphaned user reference
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

                    // Get the Cmt
                    agent.get('/api/cmts/' + cmtSaveRes.body._id)
                      .expect(200)
                      .end(function (cmtInfoErr, cmtInfoRes) {
                        // Handle Cmt error
                        if (cmtInfoErr) {
                          return done(cmtInfoErr);
                        }

                        // Set assertions
                        (cmtInfoRes.body._id).should.equal(cmtSaveRes.body._id);
                        (cmtInfoRes.body.name).should.equal(cmt.name);
                        should.equal(cmtInfoRes.body.user, undefined);

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
      Cmt.remove().exec(done);
    });
  });
});
