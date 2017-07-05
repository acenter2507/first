(function () {
  'use strict';

  describe('Views Route Tests', function () {
    // Initialize global variables
    var $scope,
      ViewsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ViewsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ViewsService = _ViewsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('views');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/views');
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
          ViewsController,
          mockView;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('views.view');
          $templateCache.put('modules/views/client/views/view-view.client.view.html', '');

          // create mock View
          mockView = new ViewsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'View Name'
          });

          // Initialize Controller
          ViewsController = $controller('ViewsController as vm', {
            $scope: $scope,
            viewResolve: mockView
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:viewId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.viewResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            viewId: 1
          })).toEqual('/views/1');
        }));

        it('should attach an View to the controller scope', function () {
          expect($scope.vm.view._id).toBe(mockView._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/views/client/views/view-view.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ViewsController,
          mockView;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('views.create');
          $templateCache.put('modules/views/client/views/form-view.client.view.html', '');

          // create mock View
          mockView = new ViewsService();

          // Initialize Controller
          ViewsController = $controller('ViewsController as vm', {
            $scope: $scope,
            viewResolve: mockView
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.viewResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/views/create');
        }));

        it('should attach an View to the controller scope', function () {
          expect($scope.vm.view._id).toBe(mockView._id);
          expect($scope.vm.view._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/views/client/views/form-view.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ViewsController,
          mockView;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('views.edit');
          $templateCache.put('modules/views/client/views/form-view.client.view.html', '');

          // create mock View
          mockView = new ViewsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'View Name'
          });

          // Initialize Controller
          ViewsController = $controller('ViewsController as vm', {
            $scope: $scope,
            viewResolve: mockView
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:viewId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.viewResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            viewId: 1
          })).toEqual('/views/1/edit');
        }));

        it('should attach an View to the controller scope', function () {
          expect($scope.vm.view._id).toBe(mockView._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/views/client/views/form-view.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
