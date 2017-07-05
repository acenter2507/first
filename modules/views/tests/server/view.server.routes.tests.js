'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  View = mongoose.model('View'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  view;

/**
 * View routes tests
 */
describe('View CRUD tests', function () {

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

    // Save a user to the test db and create new View
    user.save(function () {
      view = {
        name: 'View name'
      };

      done();
    });
  });

  it('should be able to save a View if logged in', function (done) {
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

        // Save a new View
        agent.post('/api/views')
          .send(view)
          .expect(200)
          .end(function (viewSaveErr, viewSaveRes) {
            // Handle View save error
            if (viewSaveErr) {
              return done(viewSaveErr);
            }

            // Get a list of Views
            agent.get('/api/views')
              .end(function (viewsGetErr, viewsGetRes) {
                // Handle Views save error
                if (viewsGetErr) {
                  return done(viewsGetErr);
                }

                // Get Views list
                var views = viewsGetRes.body;

                // Set assertions
                (views[0].user._id).should.equal(userId);
                (views[0].name).should.match('View name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an View if not logged in', function (done) {
    agent.post('/api/views')
      .send(view)
      .expect(403)
      .end(function (viewSaveErr, viewSaveRes) {
        // Call the assertion callback
        done(viewSaveErr);
      });
  });

  it('should not be able to save an View if no name is provided', function (done) {
    // Invalidate name field
    view.name = '';

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

        // Save a new View
        agent.post('/api/views')
          .send(view)
          .expect(400)
          .end(function (viewSaveErr, viewSaveRes) {
            // Set message assertion
            (viewSaveRes.body.message).should.match('Please fill View name');

            // Handle View save error
            done(viewSaveErr);
          });
      });
  });

  it('should be able to update an View if signed in', function (done) {
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

        // Save a new View
        agent.post('/api/views')
          .send(view)
          .expect(200)
          .end(function (viewSaveErr, viewSaveRes) {
            // Handle View save error
            if (viewSaveErr) {
              return done(viewSaveErr);
            }

            // Update View name
            view.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing View
            agent.put('/api/views/' + viewSaveRes.body._id)
              .send(view)
              .expect(200)
              .end(function (viewUpdateErr, viewUpdateRes) {
                // Handle View update error
                if (viewUpdateErr) {
                  return done(viewUpdateErr);
                }

                // Set assertions
                (viewUpdateRes.body._id).should.equal(viewSaveRes.body._id);
                (viewUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Views if not signed in', function (done) {
    // Create new View model instance
    var viewObj = new View(view);

    // Save the view
    viewObj.save(function () {
      // Request Views
      request(app).get('/api/views')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single View if not signed in', function (done) {
    // Create new View model instance
    var viewObj = new View(view);

    // Save the View
    viewObj.save(function () {
      request(app).get('/api/views/' + viewObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', view.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single View with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/views/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'View is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single View which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent View
    request(app).get('/api/views/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No View with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an View if signed in', function (done) {
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

        // Save a new View
        agent.post('/api/views')
          .send(view)
          .expect(200)
          .end(function (viewSaveErr, viewSaveRes) {
            // Handle View save error
            if (viewSaveErr) {
              return done(viewSaveErr);
            }

            // Delete an existing View
            agent.delete('/api/views/' + viewSaveRes.body._id)
              .send(view)
              .expect(200)
              .end(function (viewDeleteErr, viewDeleteRes) {
                // Handle view error error
                if (viewDeleteErr) {
                  return done(viewDeleteErr);
                }

                // Set assertions
                (viewDeleteRes.body._id).should.equal(viewSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an View if not signed in', function (done) {
    // Set View user
    view.user = user;

    // Create new View model instance
    var viewObj = new View(view);

    // Save the View
    viewObj.save(function () {
      // Try deleting View
      request(app).delete('/api/views/' + viewObj._id)
        .expect(403)
        .end(function (viewDeleteErr, viewDeleteRes) {
          // Set message assertion
          (viewDeleteRes.body.message).should.match('User is not authorized');

          // Handle View error error
          done(viewDeleteErr);
        });

    });
  });

  it('should be able to get a single View that has an orphaned user reference', function (done) {
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

          // Save a new View
          agent.post('/api/views')
            .send(view)
            .expect(200)
            .end(function (viewSaveErr, viewSaveRes) {
              // Handle View save error
              if (viewSaveErr) {
                return done(viewSaveErr);
              }

              // Set assertions on new View
              (viewSaveRes.body.name).should.equal(view.name);
              should.exist(viewSaveRes.body.user);
              should.equal(viewSaveRes.body.user._id, orphanId);

              // force the View to have an orphaned user reference
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

                    // Get the View
                    agent.get('/api/views/' + viewSaveRes.body._id)
                      .expect(200)
                      .end(function (viewInfoErr, viewInfoRes) {
                        // Handle View error
                        if (viewInfoErr) {
                          return done(viewInfoErr);
                        }

                        // Set assertions
                        (viewInfoRes.body._id).should.equal(viewSaveRes.body._id);
                        (viewInfoRes.body.name).should.equal(view.name);
                        should.equal(viewInfoRes.body.user, undefined);

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
      View.remove().exec(done);
    });
  });
});
