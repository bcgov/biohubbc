import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../database/db';
import { SurveyService } from '../../../../../../services/survey-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { removeCritterFromSurvey } from './{critterId}';

describe('removeCritterFromSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
  const mockSurveyCritter = 123;

  it('removes critter from survey', async () => {
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(SurveyService.prototype, 'removeCritterFromSurvey').resolves(mockSurveyCritter);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = removeCritterFromSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.equal(mockSurveyCritter);
  });

  it('catches and re-throws errors', async () => {
    const mockError = new Error('a test error');

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(SurveyService.prototype, 'removeCritterFromSurvey').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = removeCritterFromSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
    }
  });
});
