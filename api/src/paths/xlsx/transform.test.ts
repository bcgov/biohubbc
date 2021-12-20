import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as transform from './transform';

chai.use(sinonChai);

describe('persistParseErrors', () => {
  const sampleReq = {
    keycloak_token: {},
    parseError: null
  } as any;

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

  afterEach(() => {
    sinon.restore();
  });

  it('should skip to next step when no errors', async () => {
    const nextSpy = sinon.spy();

    const result = transform.persistParseErrors();
    await result(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(nextSpy).to.have.been.called;
  });

  it('should return with a failed status if errors exist', async () => {
    const result = transform.persistParseErrors();
    await result({ ...sampleReq, parseError: 'some error exists' }, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({ status: 'failed', reason: 'Unable to parse submission' });
  });
});
