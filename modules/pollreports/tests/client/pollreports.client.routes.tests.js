(function () {
  'use strict';

  describe('Pollreports Route Tests', function () {
    // Initialize global variables
    var $scope,
      PollreportsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _PollreportsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      PollreportsService = _PollreportsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('pollreports');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/pollreports');
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
          PollreportsController,
          mockPollreport;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('pollreports.view');
          $templateCache.put('modules/pollreports/client/views/view-pollreport.client.view.html', '');

          // create mock Pollreport
          mockPollreport = new PollreportsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Pollreport Name'
          });

          // Initialize Controller
          PollreportsController = $controller('PollreportsController as vm', {
            $scope: $scope,
            pollreportResolve: mockPollreport
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:pollreportId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.pollreportResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            pollreportId: 1
          })).toEqual('/pollreports/1');
        }));

        it('should attach an Pollreport to the controller scope', function () {
          expect($scope.vm.pollreport._id).toBe(mockPollreport._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/pollreports/client/views/view-pollreport.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          PollreportsController,
          mockPollreport;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('pollreports.create');
          $templateCache.put('modules/pollreports/client/views/form-pollreport.client.view.html', '');

          // create mock Pollreport
          mockPollreport = new PollreportsService();

          // Initialize Controller
          PollreportsController = $controller('PollreportsController as vm', {
            $scope: $scope,
            pollreportResolve: mockPollreport
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.pollreportResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/pollreports/create');
        }));

        it('should attach an Pollreport to the controller scope', function () {
          expect($scope.vm.pollreport._id).toBe(mockPollreport._id);
          expect($scope.vm.pollreport._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/pollreports/client/views/form-pollreport.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          PollreportsController,
          mockPollreport;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('pollreports.edit');
          $templateCache.put('modules/pollreports/client/views/form-pollreport.client.view.html', '');

          // create mock Pollreport
          mockPollreport = new PollreportsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Pollreport Name'
          });

          // Initialize Controller
          PollreportsController = $controller('PollreportsController as vm', {
            $scope: $scope,
            pollreportResolve: mockPollreport
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:pollreportId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.pollreportResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            pollreportId: 1
          })).toEqual('/pollreports/1/edit');
        }));

        it('should attach an Pollreport to the controller scope', function () {
          expect($scope.vm.pollreport._id).toBe(mockPollreport._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/pollreports/client/views/form-pollreport.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
