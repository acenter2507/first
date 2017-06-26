(function () {
  'use strict';

  describe('Categorys Route Tests', function () {
    // Initialize global variables
    var $scope,
      CategorysService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CategorysService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CategorysService = _CategorysService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('categorys');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/categorys');
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
          CategorysController,
          mockCategory;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('categorys.view');
          $templateCache.put('modules/categorys/client/views/view-category.client.view.html', '');

          // create mock Category
          mockCategory = new CategorysService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Category Name'
          });

          // Initialize Controller
          CategorysController = $controller('CategorysController as vm', {
            $scope: $scope,
            categoryResolve: mockCategory
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:categoryId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.categoryResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            categoryId: 1
          })).toEqual('/categorys/1');
        }));

        it('should attach an Category to the controller scope', function () {
          expect($scope.vm.category._id).toBe(mockCategory._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/categorys/client/views/view-category.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CategorysController,
          mockCategory;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('categorys.create');
          $templateCache.put('modules/categorys/client/views/form-category.client.view.html', '');

          // create mock Category
          mockCategory = new CategorysService();

          // Initialize Controller
          CategorysController = $controller('CategorysController as vm', {
            $scope: $scope,
            categoryResolve: mockCategory
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.categoryResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/categorys/create');
        }));

        it('should attach an Category to the controller scope', function () {
          expect($scope.vm.category._id).toBe(mockCategory._id);
          expect($scope.vm.category._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/categorys/client/views/form-category.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CategorysController,
          mockCategory;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('categorys.edit');
          $templateCache.put('modules/categorys/client/views/form-category.client.view.html', '');

          // create mock Category
          mockCategory = new CategorysService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Category Name'
          });

          // Initialize Controller
          CategorysController = $controller('CategorysController as vm', {
            $scope: $scope,
            categoryResolve: mockCategory
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:categoryId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.categoryResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            categoryId: 1
          })).toEqual('/categorys/1/edit');
        }));

        it('should attach an Category to the controller scope', function () {
          expect($scope.vm.category._id).toBe(mockCategory._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/categorys/client/views/form-category.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
