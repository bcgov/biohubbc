import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTPError } from '../../../../errors/http-error';
import * as listAttachments from './list';

chai.use(sinonChai);

describe('getAttachments', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when projectId is missing in Path', async () => {
    try {
      const sampleReq = {
        keycloak_token: {},
        body: {},
        params: {
          projectId: null
        }
      } as any;

      const result = listAttachments.getAttachments();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });
});
