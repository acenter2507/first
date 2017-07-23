'use strict';

angular
  .module('admin')
  .filter('users_filter', users_filter);

users_filter.$inject = ['$filter'];
// Setup the filter
function users_filter($filter) {
  // Create the return function and set the required parameter as well as an optional paramater
  return function (users, filter) {
    var out = [];
    out = $filter('filter')(users, {
      $: filter.search
    });
    if (filter.status) {
      out.forEach(item => {
        if (item.status !== filter.status) {
          out = _.without(out, item);
        }
      });
    }
    if (filter.provider) {
      out.forEach(item => {
        if (item.provider !== filter.provider) {
          out = _.without(out, item);
        }
      });
    }
    if (filter.roles) {
      if (filter.roles === 'user') {
        out.forEach(item => {
          if (item.roles.indexOf(filter.roles) < 0 || item.roles.length > 1) {
            out = _.without(out, item);
          }
        });
      } else {
        out.forEach(item => {
          if (item.roles.indexOf(filter.roles) < 0) {
            out = _.without(out, item);
          }
        });
      }
    }
    if (filter.created) {
      var create = moment(filter.created);
      out.forEach(item => {
        let item_create = moment(item.created);
        if (!item_create.isSame(create, 'd')) {
          out = _.without(out, item);
        }
      });
    }
    if (filter.polls && parseInt(filter.polls)) {
      if (filter.polls_pref === 'least') {
        out.forEach(item => {
          if (item.pollCnt >= parseInt(filter.polls)) {
            out = _.without(out, item);
          }
        });
      } else {
        out.forEach(item => {
          if (item.pollCnt < parseInt(filter.polls)) {
            out = _.without(out, item);
          }
        });
      }
    }
    return out;
  };

}