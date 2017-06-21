'use strict';

describe('Notifs E2E Tests:', function () {
  describe('Test Notifs page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/notifs');
      expect(element.all(by.repeater('notif in notifs')).count()).toEqual(0);
    });
  });
});
