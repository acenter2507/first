(function () {
  'use strict';

  describe('Notifs Route Tests', function () {
    // Initialize global variables
    var $scope,
      NotifsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _NotifsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      NotifsService = _NotifsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('notifs');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/notifs');
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
          NotifsController,
          mockNotif;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('notifs.view');
          $templateCache.put('modules/notifs/client/views/view-notif.client.view.html', '');

          // create mock Notif
          mockNotif = new NotifsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Notif Name'
          });

          // Initialize Controller
          NotifsController = $controller('NotifsController as vm', {
            $scope: $scope,
            notifResolve: mockNotif
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:notifId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.notifResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            notifId: 1
          })).toEqual('/notifs/1');
        }));

        it('should attach an Notif to the controller scope', function () {
          expect($scope.vm.notif._id).toBe(mockNotif._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/notifs/client/views/view-notif.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          NotifsController,
          mockNotif;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('notifs.create');
          $templateCache.put('modules/notifs/client/views/form-notif.client.view.html', '');

          // create mock Notif
          mockNotif = new NotifsService();

          // Initialize Controller
          NotifsController = $controller('NotifsController as vm', {
            $scope: $scope,
            notifResolve: mockNotif
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.notifResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/notifs/create');
        }));

        it('should attach an Notif to the controller scope', function () {
          expect($scope.vm.notif._id).toBe(mockNotif._id);
          expect($scope.vm.notif._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/notifs/client/views/form-notif.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          NotifsController,
          mockNotif;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('notifs.edit');
          $templateCache.put('modules/notifs/client/views/form-notif.client.view.html', '');

          // create mock Notif
          mockNotif = new NotifsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Notif Name'
          });

          // Initialize Controller
          NotifsController = $controller('NotifsController as vm', {
            $scope: $scope,
            notifResolve: mockNotif
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:notifId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.notifResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            notifId: 1
          })).toEqual('/notifs/1/edit');
        }));

        it('should attach an Notif to the controller scope', function () {
          expect($scope.vm.notif._id).toBe(mockNotif._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/notifs/client/views/form-notif.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
