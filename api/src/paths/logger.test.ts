import { expect } from 'chai';
import { describe } from 'mocha';
import { HTTPError } from '../errors/custom-error';
import * as logger from './logger';

describe('logger', () => {
  let actualStatus: any = null;
  let actualResult: any = null;

  const sampleRes = {
    status: (status: any) => {
      actualStatus = status;

      return {
        send: (response: any) => {
          actualResult = response;
        }
      };
    }
  } as any;

  const sampleNext = () => {
    // do nothing
  };

  describe('updateLoggerLevel', () => {
    it('should throw a 400 error when `level` query param is missing', async () => {
      const operation = logger.updateLoggerLevel();

      const sampleReq = {
        query: {}
      } as any;

      try {
        await operation(sampleReq, sampleRes, sampleNext);

        expect.fail();
      } catch (error) {
        expect((error as HTTPError).status).to.equal(400);
        expect((error as HTTPError).message).to.equal('Missing required query param `level`');
      }
    });

    it('should return 200 on success', async () => {
      const operation = logger.updateLoggerLevel();

      const sampleReq = {
        query: {
          level: 'info'
        }
      } as any;

      await operation(sampleReq, sampleRes, sampleNext);

      expect(actualStatus).to.eql(200);
      expect(actualResult).to.eql(undefined);
    });
  });
});
