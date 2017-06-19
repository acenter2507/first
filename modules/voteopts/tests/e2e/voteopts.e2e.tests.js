'use strict';

describe('Voteopts E2E Tests:', function () {
  describe('Test Voteopts page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/voteopts');
      expect(element.all(by.repeater('voteopt in voteopts')).count()).toEqual(0);
    });
  });
});
