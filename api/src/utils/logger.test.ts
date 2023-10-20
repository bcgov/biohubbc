import { expect } from 'chai';
import { describe } from 'mocha';
import { getLogger, setLogLevel } from './logger';

describe('logger', () => {
  describe('getLogger', () => {
    it('returns a winston logger', () => {
      const logger = getLogger('myLogger');

      expect(logger).not.to.be.undefined;
    });
  });

  describe('setLogLevel', () => {
    it('sets the log level for all loggers', () => {
      const myLogger1 = getLogger('myLogger');
      expect(myLogger1.transports[0].level).to.equal('info');

      setLogLevel('debug');

      const myLogger2 = getLogger('myLogger');
      expect(myLogger2.transports[0].level).to.equal('debug');

      const myNewLogger = getLogger('myNewLogger');

      expect(myNewLogger.transports[0].level).to.equal('debug');
    });
  });
});
