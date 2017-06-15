'use strict';

describe('Votes E2E Tests:', function () {
  describe('Test Votes page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/votes');
      expect(element.all(by.repeater('vote in votes')).count()).toEqual(0);
    });
  });
});
