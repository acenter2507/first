'use strict';

angular.module(ApplicationConfiguration.applicationModuleName).run(templateConfig);

templateConfig.$inject = ['$http', '$templateCache'];
function templateConfig($http, $templateCache) {
  $http.get('modules/polls/client/views/quick-poll.client.view.html', { cache: $templateCache });
}