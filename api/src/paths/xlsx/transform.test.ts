import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import * as transform from './transform';
import * as validate from './validate';
import * as db from '../../database/db';

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

describe('getTransformationSchema', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      occurrence_submission_id: 1
    }
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

  const dbConnectionObj = getMockDBConnection();

  afterEach(() => {
    sinon.restore();
  });

  it('should return with a failed status if no transformationSchema', async () => {
    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, systemUserId: () => 20 });
    sinon.stub(validate, 'getTemplateMethodologySpecies').resolves({
      transform: null
    });

    const result = transform.getTransformationSchema();
    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      status: 'failed',
      reason: 'Unable to fetch an appropriate transformation schema for your submission'
    });
  });

  it('should set the transformationSchema in the request and call next on success', async () => {
    const nextSpy = sinon.spy();

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, systemUserId: () => 20 });
    sinon.stub(validate, 'getTemplateMethodologySpecies').resolves({
      transform: 'transform'
    });

    const result = transform.getTransformationSchema();
    await result(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(sampleReq.transformationSchema).to.eql('transform');
    expect(nextSpy).to.have.been.called;
  });
});
