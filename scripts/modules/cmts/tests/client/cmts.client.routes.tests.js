(function () {
  'use strict';

  describe('Cmts Route Tests', function () {
    // Initialize global variables
    var $scope,
      CmtsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CmtsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CmtsService = _CmtsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('cmts');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/cmts');
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
          CmtsController,
          mockCmt;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('cmts.view');
          $templateCache.put('modules/cmts/client/views/view-cmt.client.view.html', '');

          // create mock Cmt
          mockCmt = new CmtsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Cmt Name'
          });

          // Initialize Controller
          CmtsController = $controller('CmtsController as vm', {
            $scope: $scope,
            cmtResolve: mockCmt
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:cmtId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.cmtResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            cmtId: 1
          })).toEqual('/cmts/1');
        }));

        it('should attach an Cmt to the controller scope', function () {
          expect($scope.vm.cmt._id).toBe(mockCmt._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/cmts/client/views/view-cmt.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CmtsController,
          mockCmt;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('cmts.create');
          $templateCache.put('modules/cmts/client/views/form-cmt.client.view.html', '');

          // create mock Cmt
          mockCmt = new CmtsService();

          // Initialize Controller
          CmtsController = $controller('CmtsController as vm', {
            $scope: $scope,
            cmtResolve: mockCmt
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.cmtResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/cmts/create');
        }));

        it('should attach an Cmt to the controller scope', function () {
          expect($scope.vm.cmt._id).toBe(mockCmt._id);
          expect($scope.vm.cmt._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/cmts/client/views/form-cmt.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CmtsController,
          mockCmt;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('cmts.edit');
          $templateCache.put('modules/cmts/client/views/form-cmt.client.view.html', '');

          // create mock Cmt
          mockCmt = new CmtsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Cmt Name'
          });

          // Initialize Controller
          CmtsController = $controller('CmtsController as vm', {
            $scope: $scope,
            cmtResolve: mockCmt
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:cmtId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.cmtResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            cmtId: 1
          })).toEqual('/cmts/1/edit');
        }));

        it('should attach an Cmt to the controller scope', function () {
          expect($scope.vm.cmt._id).toBe(mockCmt._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/cmts/client/views/form-cmt.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
