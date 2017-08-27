'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider', '$breadcrumbProvider',
  function ($stateProvider, $breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
      prefixStateName: 'admin.dashboard',
      includeAbstract: true,
      template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last, root: $first}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
    });
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        ncyBreadcrumb: {
          label: 'Root',
          skip: true
        },
        templateUrl: 'modules/admins/client/views/admin.client.view.html',
        controller: 'AdminsController',
        data: {
          roles: ['admin']
        }
      });
  }
]);
