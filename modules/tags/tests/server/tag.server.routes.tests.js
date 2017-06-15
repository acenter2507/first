'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Tag = mongoose.model('Tag'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  tag;

/**
 * Tag routes tests
 */
describe('Tag CRUD tests', function () {

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

    // Save a user to the test db and create new Tag
    user.save(function () {
      tag = {
        name: 'Tag name'
      };

      done();
    });
  });

  it('should be able to save a Tag if logged in', function (done) {
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

        // Save a new Tag
        agent.post('/api/tags')
          .send(tag)
          .expect(200)
          .end(function (tagSaveErr, tagSaveRes) {
            // Handle Tag save error
            if (tagSaveErr) {
              return done(tagSaveErr);
            }

            // Get a list of Tags
            agent.get('/api/tags')
              .end(function (tagsGetErr, tagsGetRes) {
                // Handle Tags save error
                if (tagsGetErr) {
                  return done(tagsGetErr);
                }

                // Get Tags list
                var tags = tagsGetRes.body;

                // Set assertions
                (tags[0].user._id).should.equal(userId);
                (tags[0].name).should.match('Tag name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Tag if not logged in', function (done) {
    agent.post('/api/tags')
      .send(tag)
      .expect(403)
      .end(function (tagSaveErr, tagSaveRes) {
        // Call the assertion callback
        done(tagSaveErr);
      });
  });

  it('should not be able to save an Tag if no name is provided', function (done) {
    // Invalidate name field
    tag.name = '';

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

        // Save a new Tag
        agent.post('/api/tags')
          .send(tag)
          .expect(400)
          .end(function (tagSaveErr, tagSaveRes) {
            // Set message assertion
            (tagSaveRes.body.message).should.match('Please fill Tag name');

            // Handle Tag save error
            done(tagSaveErr);
          });
      });
  });

  it('should be able to update an Tag if signed in', function (done) {
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

        // Save a new Tag
        agent.post('/api/tags')
          .send(tag)
          .expect(200)
          .end(function (tagSaveErr, tagSaveRes) {
            // Handle Tag save error
            if (tagSaveErr) {
              return done(tagSaveErr);
            }

            // Update Tag name
            tag.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Tag
            agent.put('/api/tags/' + tagSaveRes.body._id)
              .send(tag)
              .expect(200)
              .end(function (tagUpdateErr, tagUpdateRes) {
                // Handle Tag update error
                if (tagUpdateErr) {
                  return done(tagUpdateErr);
                }

                // Set assertions
                (tagUpdateRes.body._id).should.equal(tagSaveRes.body._id);
                (tagUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Tags if not signed in', function (done) {
    // Create new Tag model instance
    var tagObj = new Tag(tag);

    // Save the tag
    tagObj.save(function () {
      // Request Tags
      request(app).get('/api/tags')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Tag if not signed in', function (done) {
    // Create new Tag model instance
    var tagObj = new Tag(tag);

    // Save the Tag
    tagObj.save(function () {
      request(app).get('/api/tags/' + tagObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', tag.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Tag with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/tags/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Tag is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Tag which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Tag
    request(app).get('/api/tags/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Tag with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Tag if signed in', function (done) {
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

        // Save a new Tag
        agent.post('/api/tags')
          .send(tag)
          .expect(200)
          .end(function (tagSaveErr, tagSaveRes) {
            // Handle Tag save error
            if (tagSaveErr) {
              return done(tagSaveErr);
            }

            // Delete an existing Tag
            agent.delete('/api/tags/' + tagSaveRes.body._id)
              .send(tag)
              .expect(200)
              .end(function (tagDeleteErr, tagDeleteRes) {
                // Handle tag error error
                if (tagDeleteErr) {
                  return done(tagDeleteErr);
                }

                // Set assertions
                (tagDeleteRes.body._id).should.equal(tagSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Tag if not signed in', function (done) {
    // Set Tag user
    tag.user = user;

    // Create new Tag model instance
    var tagObj = new Tag(tag);

    // Save the Tag
    tagObj.save(function () {
      // Try deleting Tag
      request(app).delete('/api/tags/' + tagObj._id)
        .expect(403)
        .end(function (tagDeleteErr, tagDeleteRes) {
          // Set message assertion
          (tagDeleteRes.body.message).should.match('User is not authorized');

          // Handle Tag error error
          done(tagDeleteErr);
        });

    });
  });

  it('should be able to get a single Tag that has an orphaned user reference', function (done) {
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

          // Save a new Tag
          agent.post('/api/tags')
            .send(tag)
            .expect(200)
            .end(function (tagSaveErr, tagSaveRes) {
              // Handle Tag save error
              if (tagSaveErr) {
                return done(tagSaveErr);
              }

              // Set assertions on new Tag
              (tagSaveRes.body.name).should.equal(tag.name);
              should.exist(tagSaveRes.body.user);
              should.equal(tagSaveRes.body.user._id, orphanId);

              // force the Tag to have an orphaned user reference
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

                    // Get the Tag
                    agent.get('/api/tags/' + tagSaveRes.body._id)
                      .expect(200)
                      .end(function (tagInfoErr, tagInfoRes) {
                        // Handle Tag error
                        if (tagInfoErr) {
                          return done(tagInfoErr);
                        }

                        // Set assertions
                        (tagInfoRes.body._id).should.equal(tagSaveRes.body._id);
                        (tagInfoRes.body.name).should.equal(tag.name);
                        should.equal(tagInfoRes.body.user, undefined);

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
      Tag.remove().exec(done);
    });
  });
});
