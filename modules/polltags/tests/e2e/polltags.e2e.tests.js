'use strict';

describe('Polltags E2E Tests:', function () {
  describe('Test Polltags page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/polltags');
      expect(element.all(by.repeater('polltag in polltags')).count()).toEqual(0);
    });
  });
});
