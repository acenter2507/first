(function () {
  'use strict';

  describe('Votes Route Tests', function () {
    // Initialize global variables
    var $scope,
      VotesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _VotesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      VotesService = _VotesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('votes');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/votes');
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
          VotesController,
          mockVote;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('votes.view');
          $templateCache.put('modules/votes/client/views/view-vote.client.view.html', '');

          // create mock Vote
          mockVote = new VotesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Vote Name'
          });

          // Initialize Controller
          VotesController = $controller('VotesController as vm', {
            $scope: $scope,
            voteResolve: mockVote
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:voteId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.voteResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            voteId: 1
          })).toEqual('/votes/1');
        }));

        it('should attach an Vote to the controller scope', function () {
          expect($scope.vm.vote._id).toBe(mockVote._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/votes/client/views/view-vote.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          VotesController,
          mockVote;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('votes.create');
          $templateCache.put('modules/votes/client/views/form-vote.client.view.html', '');

          // create mock Vote
          mockVote = new VotesService();

          // Initialize Controller
          VotesController = $controller('VotesController as vm', {
            $scope: $scope,
            voteResolve: mockVote
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.voteResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/votes/create');
        }));

        it('should attach an Vote to the controller scope', function () {
          expect($scope.vm.vote._id).toBe(mockVote._id);
          expect($scope.vm.vote._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/votes/client/views/form-vote.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          VotesController,
          mockVote;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('votes.edit');
          $templateCache.put('modules/votes/client/views/form-vote.client.view.html', '');

          // create mock Vote
          mockVote = new VotesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Vote Name'
          });

          // Initialize Controller
          VotesController = $controller('VotesController as vm', {
            $scope: $scope,
            voteResolve: mockVote
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:voteId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.voteResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            voteId: 1
          })).toEqual('/votes/1/edit');
        }));

        it('should attach an Vote to the controller scope', function () {
          expect($scope.vm.vote._id).toBe(mockVote._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/votes/client/views/form-vote.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
