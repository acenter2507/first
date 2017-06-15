(function () {
  'use strict';

  describe('Opts Route Tests', function () {
    // Initialize global variables
    var $scope,
      OptsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _OptsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      OptsService = _OptsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('opts');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/opts');
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
          OptsController,
          mockOpt;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('opts.view');
          $templateCache.put('modules/opts/client/views/view-opt.client.view.html', '');

          // create mock Opt
          mockOpt = new OptsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Opt Name'
          });

          // Initialize Controller
          OptsController = $controller('OptsController as vm', {
            $scope: $scope,
            optResolve: mockOpt
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:optId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.optResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            optId: 1
          })).toEqual('/opts/1');
        }));

        it('should attach an Opt to the controller scope', function () {
          expect($scope.vm.opt._id).toBe(mockOpt._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/opts/client/views/view-opt.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          OptsController,
          mockOpt;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('opts.create');
          $templateCache.put('modules/opts/client/views/form-opt.client.view.html', '');

          // create mock Opt
          mockOpt = new OptsService();

          // Initialize Controller
          OptsController = $controller('OptsController as vm', {
            $scope: $scope,
            optResolve: mockOpt
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.optResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/opts/create');
        }));

        it('should attach an Opt to the controller scope', function () {
          expect($scope.vm.opt._id).toBe(mockOpt._id);
          expect($scope.vm.opt._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/opts/client/views/form-opt.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          OptsController,
          mockOpt;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('opts.edit');
          $templateCache.put('modules/opts/client/views/form-opt.client.view.html', '');

          // create mock Opt
          mockOpt = new OptsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Opt Name'
          });

          // Initialize Controller
          OptsController = $controller('OptsController as vm', {
            $scope: $scope,
            optResolve: mockOpt
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:optId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.optResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            optId: 1
          })).toEqual('/opts/1/edit');
        }));

        it('should attach an Opt to the controller scope', function () {
          expect($scope.vm.opt._id).toBe(mockOpt._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/opts/client/views/form-opt.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
