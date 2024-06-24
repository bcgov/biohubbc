import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../database/db';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { POST, removeCrittersFromSurvey } from './delete';

describe('critterId openapi schema', () => {
  const ajv = new Ajv();

  it('DELETE is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(POST.apiDoc as unknown as object)).to.be.true;
  });
});

describe('removeCrittersFromSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

  it('removes critter from survey', async () => {
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const removeCrittersFromSurveyStub = sinon
      .stub(SurveyCritterService.prototype, 'removeCrittersFromSurvey')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = {
      critterIds: [2, 3]
    };
    mockReq.params = {
      surveyId: '1'
    };

    const requestHandler = removeCrittersFromSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(removeCrittersFromSurveyStub).to.have.been.calledOnceWith(1, [2, 3]);
  });

  it('catches and re-throws errors', async () => {
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');

    sinon.stub(SurveyCritterService.prototype, 'removeCrittersFromSurvey').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = {
      critterIds: [2, 3]
    };
    mockReq.params = {
      surveyId: '1'
    };

    const requestHandler = removeCrittersFromSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
    }
  });
});
