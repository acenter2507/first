'use strict';

angular.module(ApplicationConfiguration.applicationModuleName).run(templateConfig);

templateConfig.$inject = ['$http', '$templateCache'];
function templateConfig($http, $templateCache) {
  // $http.get('modules/polls/client/views/quick-poll.client.view.html', { cache: $templateCache });
  // $http.get('modules/core/client/views/templates/list-poll.client.template.html', { cache: $templateCache });
  // $http.get('modules/polls/client/views/quick-poll.client.view.html', { cache: $templateCache });
  // $http.get('modules/core/client/views/templates/list-poll.client.template.html').then(res => {
  //   $templateCache.put('poll_item', res.data);
  // });
  // $http.get('modules/polls/client/views/quick-poll.client.view.html').then(res => {
  //   $templateCache.put('quick_poll', res.data);
  // });
}