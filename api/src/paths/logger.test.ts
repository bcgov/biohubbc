import { expect } from 'chai';
import { describe } from 'mocha';
import { HTTPError } from '../errors/http-error';
import { getRequestHandlerMocks } from '../__mocks__/db';
import * as logger from './logger';

describe('logger', () => {
  describe('updateLoggerLevel', () => {
    it('should throw a 400 error when `level` query param is missing', async () => {
      const requestHandler = logger.updateLoggerLevel();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.query = {};

      try {
        await requestHandler(mockReq, mockRes, mockNext);

        expect.fail();
      } catch (error) {
        expect((error as HTTPError).status).to.equal(400);
        expect((error as HTTPError).message).to.equal('Missing required query param `level`');
      }
    });

    it('should return 200 on success', async () => {
      const requestHandler = logger.updateLoggerLevel();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.query = { level: 'info' };

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.eql(200);
      expect(mockRes.sendValue).to.eql(undefined);
    });
  });
});
