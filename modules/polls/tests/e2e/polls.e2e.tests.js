'use strict';

describe('Polls E2E Tests:', function () {
  describe('Test Polls page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/polls');
      expect(element.all(by.repeater('poll in polls')).count()).toEqual(0);
    });
  });
});
