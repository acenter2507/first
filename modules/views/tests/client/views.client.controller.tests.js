(function () {
  'use strict';

  describe('Views Controller Tests', function () {
    // Initialize global variables
    var ViewsController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      ViewsService,
      mockView;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _ViewsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      ViewsService = _ViewsService_;

      // create mock View
      mockView = new ViewsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'View Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Views controller.
      ViewsController = $controller('ViewsController as vm', {
        $scope: $scope,
        viewResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleViewPostData;

      beforeEach(function () {
        // Create a sample View object
        sampleViewPostData = new ViewsService({
          name: 'View Name'
        });

        $scope.vm.view = sampleViewPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (ViewsService) {
        // Set POST response
        $httpBackend.expectPOST('api/views', sampleViewPostData).respond(mockView);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the View was created
        expect($state.go).toHaveBeenCalledWith('views.view', {
          viewId: mockView._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/views', sampleViewPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock View in $scope
        $scope.vm.view = mockView;
      });

      it('should update a valid View', inject(function (ViewsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/views\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('views.view', {
          viewId: mockView._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (ViewsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/views\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Views
        $scope.vm.view = mockView;
      });

      it('should delete the View and redirect to Views', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/views\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('views.list');
      });

      it('should should not delete the View and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
