(function () {
  'use strict';

  describe('Opts Controller Tests', function () {
    // Initialize global variables
    var OptsController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      OptsService,
      mockOpt;

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
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _OptsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      OptsService = _OptsService_;

      // create mock Opt
      mockOpt = new OptsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Opt Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Opts controller.
      OptsController = $controller('OptsController as vm', {
        $scope: $scope,
        optResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleOptPostData;

      beforeEach(function () {
        // Create a sample Opt object
        sampleOptPostData = new OptsService({
          name: 'Opt Name'
        });

        $scope.vm.opt = sampleOptPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (OptsService) {
        // Set POST response
        $httpBackend.expectPOST('api/opts', sampleOptPostData).respond(mockOpt);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Opt was created
        expect($state.go).toHaveBeenCalledWith('opts.view', {
          optId: mockOpt._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/opts', sampleOptPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Opt in $scope
        $scope.vm.opt = mockOpt;
      });

      it('should update a valid Opt', inject(function (OptsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/opts\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('opts.view', {
          optId: mockOpt._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (OptsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/opts\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Opts
        $scope.vm.opt = mockOpt;
      });

      it('should delete the Opt and redirect to Opts', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/opts\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('opts.list');
      });

      it('should should not delete the Opt and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
