'use strict';

angular.module('core').factory('Categorys', Categorys);

Categorys.$inject = ['CategorysService'];
function Categorys(CategorysService) {
  var svc = {};
  svc.list = [];

  svc.load = function () {
    CategorysService.query().$promise
      .then(_ctgrs => {
        svc.list = _ctgrs;
      });
  };
  svc.add = ctgr => {
    ctgr.count = 0;
    svc.list.push(ctgr);
  };
  svc.remove = ctgr => {
    svc.list = _.without(svc.list, ctgr);
    var rs = new CategorysService({ _id: ctgr._id });
    rs.$remove();
  };
  return svc;
}
