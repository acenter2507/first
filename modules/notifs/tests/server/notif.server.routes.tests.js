'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Notif = mongoose.model('Notif'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  notif;

/**
 * Notif routes tests
 */
describe('Notif CRUD tests', function () {

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

    // Save a user to the test db and create new Notif
    user.save(function () {
      notif = {
        name: 'Notif name'
      };

      done();
    });
  });

  it('should be able to save a Notif if logged in', function (done) {
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

        // Save a new Notif
        agent.post('/api/notifs')
          .send(notif)
          .expect(200)
          .end(function (notifSaveErr, notifSaveRes) {
            // Handle Notif save error
            if (notifSaveErr) {
              return done(notifSaveErr);
            }

            // Get a list of Notifs
            agent.get('/api/notifs')
              .end(function (notifsGetErr, notifsGetRes) {
                // Handle Notifs save error
                if (notifsGetErr) {
                  return done(notifsGetErr);
                }

                // Get Notifs list
                var notifs = notifsGetRes.body;

                // Set assertions
                (notifs[0].user._id).should.equal(userId);
                (notifs[0].name).should.match('Notif name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Notif if not logged in', function (done) {
    agent.post('/api/notifs')
      .send(notif)
      .expect(403)
      .end(function (notifSaveErr, notifSaveRes) {
        // Call the assertion callback
        done(notifSaveErr);
      });
  });

  it('should not be able to save an Notif if no name is provided', function (done) {
    // Invalidate name field
    notif.name = '';

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

        // Save a new Notif
        agent.post('/api/notifs')
          .send(notif)
          .expect(400)
          .end(function (notifSaveErr, notifSaveRes) {
            // Set message assertion
            (notifSaveRes.body.message).should.match('Please fill Notif name');

            // Handle Notif save error
            done(notifSaveErr);
          });
      });
  });

  it('should be able to update an Notif if signed in', function (done) {
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

        // Save a new Notif
        agent.post('/api/notifs')
          .send(notif)
          .expect(200)
          .end(function (notifSaveErr, notifSaveRes) {
            // Handle Notif save error
            if (notifSaveErr) {
              return done(notifSaveErr);
            }

            // Update Notif name
            notif.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Notif
            agent.put('/api/notifs/' + notifSaveRes.body._id)
              .send(notif)
              .expect(200)
              .end(function (notifUpdateErr, notifUpdateRes) {
                // Handle Notif update error
                if (notifUpdateErr) {
                  return done(notifUpdateErr);
                }

                // Set assertions
                (notifUpdateRes.body._id).should.equal(notifSaveRes.body._id);
                (notifUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Notifs if not signed in', function (done) {
    // Create new Notif model instance
    var notifObj = new Notif(notif);

    // Save the notif
    notifObj.save(function () {
      // Request Notifs
      request(app).get('/api/notifs')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Notif if not signed in', function (done) {
    // Create new Notif model instance
    var notifObj = new Notif(notif);

    // Save the Notif
    notifObj.save(function () {
      request(app).get('/api/notifs/' + notifObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', notif.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Notif with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/notifs/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Notif is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Notif which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Notif
    request(app).get('/api/notifs/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Notif with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Notif if signed in', function (done) {
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

        // Save a new Notif
        agent.post('/api/notifs')
          .send(notif)
          .expect(200)
          .end(function (notifSaveErr, notifSaveRes) {
            // Handle Notif save error
            if (notifSaveErr) {
              return done(notifSaveErr);
            }

            // Delete an existing Notif
            agent.delete('/api/notifs/' + notifSaveRes.body._id)
              .send(notif)
              .expect(200)
              .end(function (notifDeleteErr, notifDeleteRes) {
                // Handle notif error error
                if (notifDeleteErr) {
                  return done(notifDeleteErr);
                }

                // Set assertions
                (notifDeleteRes.body._id).should.equal(notifSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Notif if not signed in', function (done) {
    // Set Notif user
    notif.user = user;

    // Create new Notif model instance
    var notifObj = new Notif(notif);

    // Save the Notif
    notifObj.save(function () {
      // Try deleting Notif
      request(app).delete('/api/notifs/' + notifObj._id)
        .expect(403)
        .end(function (notifDeleteErr, notifDeleteRes) {
          // Set message assertion
          (notifDeleteRes.body.message).should.match('User is not authorized');

          // Handle Notif error error
          done(notifDeleteErr);
        });

    });
  });

  it('should be able to get a single Notif that has an orphaned user reference', function (done) {
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

          // Save a new Notif
          agent.post('/api/notifs')
            .send(notif)
            .expect(200)
            .end(function (notifSaveErr, notifSaveRes) {
              // Handle Notif save error
              if (notifSaveErr) {
                return done(notifSaveErr);
              }

              // Set assertions on new Notif
              (notifSaveRes.body.name).should.equal(notif.name);
              should.exist(notifSaveRes.body.user);
              should.equal(notifSaveRes.body.user._id, orphanId);

              // force the Notif to have an orphaned user reference
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

                    // Get the Notif
                    agent.get('/api/notifs/' + notifSaveRes.body._id)
                      .expect(200)
                      .end(function (notifInfoErr, notifInfoRes) {
                        // Handle Notif error
                        if (notifInfoErr) {
                          return done(notifInfoErr);
                        }

                        // Set assertions
                        (notifInfoRes.body._id).should.equal(notifSaveRes.body._id);
                        (notifInfoRes.body.name).should.equal(notif.name);
                        should.equal(notifInfoRes.body.user, undefined);

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
      Notif.remove().exec(done);
    });
  });
});
