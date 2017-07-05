'use strict';

describe('Pollreports E2E Tests:', function () {
  describe('Test Pollreports page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/pollreports');
      expect(element.all(by.repeater('pollreport in pollreports')).count()).toEqual(0);
    });
  });
});
