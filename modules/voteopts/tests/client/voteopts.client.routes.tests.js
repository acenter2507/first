(function () {
  'use strict';

  describe('Voteopts Route Tests', function () {
    // Initialize global variables
    var $scope,
      VoteoptsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _VoteoptsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      VoteoptsService = _VoteoptsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('voteopts');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/voteopts');
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
          VoteoptsController,
          mockVoteopt;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('voteopts.view');
          $templateCache.put('modules/voteopts/client/views/view-voteopt.client.view.html', '');

          // create mock Voteopt
          mockVoteopt = new VoteoptsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Voteopt Name'
          });

          // Initialize Controller
          VoteoptsController = $controller('VoteoptsController as vm', {
            $scope: $scope,
            voteoptResolve: mockVoteopt
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:voteoptId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.voteoptResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            voteoptId: 1
          })).toEqual('/voteopts/1');
        }));

        it('should attach an Voteopt to the controller scope', function () {
          expect($scope.vm.voteopt._id).toBe(mockVoteopt._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/voteopts/client/views/view-voteopt.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          VoteoptsController,
          mockVoteopt;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('voteopts.create');
          $templateCache.put('modules/voteopts/client/views/form-voteopt.client.view.html', '');

          // create mock Voteopt
          mockVoteopt = new VoteoptsService();

          // Initialize Controller
          VoteoptsController = $controller('VoteoptsController as vm', {
            $scope: $scope,
            voteoptResolve: mockVoteopt
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.voteoptResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/voteopts/create');
        }));

        it('should attach an Voteopt to the controller scope', function () {
          expect($scope.vm.voteopt._id).toBe(mockVoteopt._id);
          expect($scope.vm.voteopt._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/voteopts/client/views/form-voteopt.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          VoteoptsController,
          mockVoteopt;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('voteopts.edit');
          $templateCache.put('modules/voteopts/client/views/form-voteopt.client.view.html', '');

          // create mock Voteopt
          mockVoteopt = new VoteoptsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Voteopt Name'
          });

          // Initialize Controller
          VoteoptsController = $controller('VoteoptsController as vm', {
            $scope: $scope,
            voteoptResolve: mockVoteopt
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:voteoptId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.voteoptResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            voteoptId: 1
          })).toEqual('/voteopts/1/edit');
        }));

        it('should attach an Voteopt to the controller scope', function () {
          expect($scope.vm.voteopt._id).toBe(mockVoteopt._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/voteopts/client/views/form-voteopt.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
