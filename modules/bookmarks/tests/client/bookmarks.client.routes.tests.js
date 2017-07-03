(function () {
  'use strict';

  describe('Bookmarks Route Tests', function () {
    // Initialize global variables
    var $scope,
      BookmarksService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _BookmarksService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      BookmarksService = _BookmarksService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('bookmarks');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/bookmarks');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          BookmarksController,
          mockBookmark;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('bookmarks.view');
          $templateCache.put('modules/bookmarks/client/views/view-bookmark.client.view.html', '');

          // create mock Bookmark
          mockBookmark = new BookmarksService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Bookmark Name'
          });

          // Initialize Controller
          BookmarksController = $controller('BookmarksController as vm', {
            $scope: $scope,
            bookmarkResolve: mockBookmark
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:bookmarkId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.bookmarkResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            bookmarkId: 1
          })).toEqual('/bookmarks/1');
        }));

        it('should attach an Bookmark to the controller scope', function () {
          expect($scope.vm.bookmark._id).toBe(mockBookmark._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/bookmarks/client/views/view-bookmark.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          BookmarksController,
          mockBookmark;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('bookmarks.create');
          $templateCache.put('modules/bookmarks/client/views/form-bookmark.client.view.html', '');

          // create mock Bookmark
          mockBookmark = new BookmarksService();

          // Initialize Controller
          BookmarksController = $controller('BookmarksController as vm', {
            $scope: $scope,
            bookmarkResolve: mockBookmark
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.bookmarkResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/bookmarks/create');
        }));

        it('should attach an Bookmark to the controller scope', function () {
          expect($scope.vm.bookmark._id).toBe(mockBookmark._id);
          expect($scope.vm.bookmark._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/bookmarks/client/views/form-bookmark.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          BookmarksController,
          mockBookmark;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('bookmarks.edit');
          $templateCache.put('modules/bookmarks/client/views/form-bookmark.client.view.html', '');

          // create mock Bookmark
          mockBookmark = new BookmarksService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Bookmark Name'
          });

          // Initialize Controller
          BookmarksController = $controller('BookmarksController as vm', {
            $scope: $scope,
            bookmarkResolve: mockBookmark
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:bookmarkId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.bookmarkResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            bookmarkId: 1
          })).toEqual('/bookmarks/1/edit');
        }));

        it('should attach an Bookmark to the controller scope', function () {
          expect($scope.vm.bookmark._id).toBe(mockBookmark._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/bookmarks/client/views/form-bookmark.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
