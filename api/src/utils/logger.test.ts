import { expect } from 'chai';
import { describe } from 'mocha';
import { getLogger, setLogLevel, setLogLevelFile } from './logger';

describe('logger', () => {
  describe('getLogger', () => {
    it('returns a winston logger', () => {
      const logger = getLogger('myLogger');

      expect(logger).not.to.be.undefined;
    });
  });

  describe.only('setLogLevel', () => {
    let currentLogLevel: string | undefined;

    beforeEach(() => {
      currentLogLevel = process.env.LOG_LEVEL;
      console.log({ initialLogLevel: currentLogLevel });

      // Set initial log level value
      process.env.LOG_LEVEL = 'info';
      console.log({ before: process.env.LOG_LEVEL });
    });

    afterEach(() => {
      // Restore the original log level
      process.env.LOG_LEVEL = currentLogLevel;
      console.log({ after: process.env.LOG_LEVEL });
    });

    it('sets the log level for the console transport', () => {
      console.log({ test: process.env.LOG_LEVEL });

      //const myLogger1 = require('./logger').getLogger('myLoggerA');
      const myLogger1 = getLogger('myLoggerA');

      console.log({ transport: myLogger1.transports[1].level });

      expect(myLogger1.transports[1].level).to.equal('info');

      setLogLevel('debug');

      const myLogger2 = getLogger('myLoggerA');
      expect(myLogger2.transports[1].level).to.equal('debug');

      const myNewLogger3 = getLogger('myNewLoggerA');

      expect(myNewLogger3.transports[1].level).to.equal('debug');
    });
  });

  describe('setLogLevelFile', () => {
    let currentLogLevelFile: string | undefined;

    beforeEach(() => {
      currentLogLevelFile = process.env.LOG_LEVEL_FILE;

      // Set initial log level file value
      process.env.LOG_LEVEL_FILE = 'warn';
    });

    afterEach(() => {
      // Restore the original log level
      process.env.LOG_LEVEL_FILE = currentLogLevelFile;
    });

    it('sets the log level for the file transport', () => {
      const myLogger4 = getLogger('myLoggerB');
      expect(myLogger4.transports[0].level).to.equal('warn');

      setLogLevelFile('error');

      const myLogger5 = getLogger('myLoggerB');
      expect(myLogger5.transports[0].level).to.equal('error');

      const myNewLogger6 = getLogger('myNewLoggerB');

      expect(myNewLogger6.transports[0].level).to.equal('error');
    });
  });
});
