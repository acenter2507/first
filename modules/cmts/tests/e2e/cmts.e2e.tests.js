'use strict';

describe('Cmts E2E Tests:', function () {
  describe('Test Cmts page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/cmts');
      expect(element.all(by.repeater('cmt in cmts')).count()).toEqual(0);
    });
  });
});
