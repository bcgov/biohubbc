import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as version from './version';

chai.use(sinonChai);

describe('version', () => {
  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  describe('getVersionInformation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return versionInfo on success', async () => {
      const result = version.getVersionInformation();

      await result((null as unknown) as any, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.eql({
        version: process.env.VERSION,
        environment: process.env.NODE_ENV,
        timezone: process.env.TZ
      });
    });
  });
});
