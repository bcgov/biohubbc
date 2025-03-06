import { expect } from 'chai';
import { describe } from 'mocha';
import { getLogger } from './logger';

describe('logger', () => {
  describe('getLogger', () => {
    it('returns a winston logger', () => {
      const logger = getLogger('myLogger');

      expect(logger).not.to.be.undefined;
    });
  });
});
