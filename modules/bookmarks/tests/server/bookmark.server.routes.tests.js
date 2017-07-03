'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Bookmark = mongoose.model('Bookmark'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  bookmark;

/**
 * Bookmark routes tests
 */
describe('Bookmark CRUD tests', function () {

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

    // Save a user to the test db and create new Bookmark
    user.save(function () {
      bookmark = {
        name: 'Bookmark name'
      };

      done();
    });
  });

  it('should be able to save a Bookmark if logged in', function (done) {
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

        // Save a new Bookmark
        agent.post('/api/bookmarks')
          .send(bookmark)
          .expect(200)
          .end(function (bookmarkSaveErr, bookmarkSaveRes) {
            // Handle Bookmark save error
            if (bookmarkSaveErr) {
              return done(bookmarkSaveErr);
            }

            // Get a list of Bookmarks
            agent.get('/api/bookmarks')
              .end(function (bookmarksGetErr, bookmarksGetRes) {
                // Handle Bookmarks save error
                if (bookmarksGetErr) {
                  return done(bookmarksGetErr);
                }

                // Get Bookmarks list
                var bookmarks = bookmarksGetRes.body;

                // Set assertions
                (bookmarks[0].user._id).should.equal(userId);
                (bookmarks[0].name).should.match('Bookmark name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Bookmark if not logged in', function (done) {
    agent.post('/api/bookmarks')
      .send(bookmark)
      .expect(403)
      .end(function (bookmarkSaveErr, bookmarkSaveRes) {
        // Call the assertion callback
        done(bookmarkSaveErr);
      });
  });

  it('should not be able to save an Bookmark if no name is provided', function (done) {
    // Invalidate name field
    bookmark.name = '';

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

        // Save a new Bookmark
        agent.post('/api/bookmarks')
          .send(bookmark)
          .expect(400)
          .end(function (bookmarkSaveErr, bookmarkSaveRes) {
            // Set message assertion
            (bookmarkSaveRes.body.message).should.match('Please fill Bookmark name');

            // Handle Bookmark save error
            done(bookmarkSaveErr);
          });
      });
  });

  it('should be able to update an Bookmark if signed in', function (done) {
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

        // Save a new Bookmark
        agent.post('/api/bookmarks')
          .send(bookmark)
          .expect(200)
          .end(function (bookmarkSaveErr, bookmarkSaveRes) {
            // Handle Bookmark save error
            if (bookmarkSaveErr) {
              return done(bookmarkSaveErr);
            }

            // Update Bookmark name
            bookmark.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Bookmark
            agent.put('/api/bookmarks/' + bookmarkSaveRes.body._id)
              .send(bookmark)
              .expect(200)
              .end(function (bookmarkUpdateErr, bookmarkUpdateRes) {
                // Handle Bookmark update error
                if (bookmarkUpdateErr) {
                  return done(bookmarkUpdateErr);
                }

                // Set assertions
                (bookmarkUpdateRes.body._id).should.equal(bookmarkSaveRes.body._id);
                (bookmarkUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Bookmarks if not signed in', function (done) {
    // Create new Bookmark model instance
    var bookmarkObj = new Bookmark(bookmark);

    // Save the bookmark
    bookmarkObj.save(function () {
      // Request Bookmarks
      request(app).get('/api/bookmarks')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Bookmark if not signed in', function (done) {
    // Create new Bookmark model instance
    var bookmarkObj = new Bookmark(bookmark);

    // Save the Bookmark
    bookmarkObj.save(function () {
      request(app).get('/api/bookmarks/' + bookmarkObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', bookmark.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Bookmark with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/bookmarks/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Bookmark is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Bookmark which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Bookmark
    request(app).get('/api/bookmarks/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Bookmark with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Bookmark if signed in', function (done) {
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

        // Save a new Bookmark
        agent.post('/api/bookmarks')
          .send(bookmark)
          .expect(200)
          .end(function (bookmarkSaveErr, bookmarkSaveRes) {
            // Handle Bookmark save error
            if (bookmarkSaveErr) {
              return done(bookmarkSaveErr);
            }

            // Delete an existing Bookmark
            agent.delete('/api/bookmarks/' + bookmarkSaveRes.body._id)
              .send(bookmark)
              .expect(200)
              .end(function (bookmarkDeleteErr, bookmarkDeleteRes) {
                // Handle bookmark error error
                if (bookmarkDeleteErr) {
                  return done(bookmarkDeleteErr);
                }

                // Set assertions
                (bookmarkDeleteRes.body._id).should.equal(bookmarkSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Bookmark if not signed in', function (done) {
    // Set Bookmark user
    bookmark.user = user;

    // Create new Bookmark model instance
    var bookmarkObj = new Bookmark(bookmark);

    // Save the Bookmark
    bookmarkObj.save(function () {
      // Try deleting Bookmark
      request(app).delete('/api/bookmarks/' + bookmarkObj._id)
        .expect(403)
        .end(function (bookmarkDeleteErr, bookmarkDeleteRes) {
          // Set message assertion
          (bookmarkDeleteRes.body.message).should.match('User is not authorized');

          // Handle Bookmark error error
          done(bookmarkDeleteErr);
        });

    });
  });

  it('should be able to get a single Bookmark that has an orphaned user reference', function (done) {
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

          // Save a new Bookmark
          agent.post('/api/bookmarks')
            .send(bookmark)
            .expect(200)
            .end(function (bookmarkSaveErr, bookmarkSaveRes) {
              // Handle Bookmark save error
              if (bookmarkSaveErr) {
                return done(bookmarkSaveErr);
              }

              // Set assertions on new Bookmark
              (bookmarkSaveRes.body.name).should.equal(bookmark.name);
              should.exist(bookmarkSaveRes.body.user);
              should.equal(bookmarkSaveRes.body.user._id, orphanId);

              // force the Bookmark to have an orphaned user reference
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

                    // Get the Bookmark
                    agent.get('/api/bookmarks/' + bookmarkSaveRes.body._id)
                      .expect(200)
                      .end(function (bookmarkInfoErr, bookmarkInfoRes) {
                        // Handle Bookmark error
                        if (bookmarkInfoErr) {
                          return done(bookmarkInfoErr);
                        }

                        // Set assertions
                        (bookmarkInfoRes.body._id).should.equal(bookmarkSaveRes.body._id);
                        (bookmarkInfoRes.body.name).should.equal(bookmark.name);
                        should.equal(bookmarkInfoRes.body.user, undefined);

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
      Bookmark.remove().exec(done);
    });
  });
});
