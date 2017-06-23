'use strict';

describe('Pollusers E2E Tests:', function () {
  describe('Test Pollusers page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/pollusers');
      expect(element.all(by.repeater('polluser in pollusers')).count()).toEqual(0);
    });
  });
});
