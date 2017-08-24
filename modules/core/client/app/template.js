'use strict';

angular.module(ApplicationConfiguration.applicationModuleName).run(templateConfig);

templateConfig.$inject = ['$http', '$templateCache'];
function templateConfig($http, $templateCache) {
  $templateCache.put('poll_item', 'modules/polls/client/views/quick-poll.client.view.html');
  $http.get('modules/polls/client/views/quick-poll.client.view.html', { cache: $templateCache });
}