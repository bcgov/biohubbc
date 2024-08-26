import { expect } from 'chai';
import { describe } from 'mocha';
import { getRequestHandlerMocks } from '../__mocks__/db';
import * as logger from './logger';

describe('logger', () => {
  describe('updateLoggerLevel', () => {
    it('should return 200 on success', async () => {
      const requestHandler = logger.updateLoggerLevel();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.query = {
        logLevel: 'info',
        logLevelFile: 'debug'
      };

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.eql(200);
      expect(mockRes.sendValue).to.eql(undefined);
    });
  });
});
