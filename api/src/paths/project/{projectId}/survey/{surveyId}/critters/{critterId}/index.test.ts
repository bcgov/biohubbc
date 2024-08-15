import { expect } from 'chai';
import sinon from 'sinon';
import { updateSurveyCritter } from '.';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { CritterbaseService } from '../../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

describe('updateSurveyCritter', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns critters from survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockCBCritter = { critter_id: 'critterbase1' };

    const mockSurveyUpdateCritter = sinon.stub(SurveyCritterService.prototype, 'updateCritter').resolves();
    const mockCritterbaseUpdateCritter = sinon
      .stub(CritterbaseService.prototype, 'updateCritter')
      .resolves(mockCBCritter);
    const mockCritterbaseCreateCritter = sinon
      .stub(CritterbaseService.prototype, 'createCritter')
      .resolves(mockCBCritter);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = {
      create: {},
      update: { critter_id: 'critterbase1' }
    };

    const requestHandler = updateSurveyCritter();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection).to.have.been.calledOnce;
    expect(mockSurveyUpdateCritter).to.have.been.calledOnce;
    expect(mockCritterbaseUpdateCritter).to.have.been.calledOnce;
    expect(mockCritterbaseCreateCritter).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith(mockCBCritter);
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');
    const mockSurveyUpdateCritter = sinon.stub(SurveyCritterService.prototype, 'updateCritter').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = {
      create: {},
      update: { critter_id: 'critterbase1' }
    };

    const requestHandler = updateSurveyCritter();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockSurveyUpdateCritter).to.have.been.calledOnce;
      expect(mockGetDBConnection).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const errMsg = 'No external critter ID was found.';
    const mockSurveyUpdateCritter = sinon.stub(SurveyCritterService.prototype, 'updateCritter').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = {
      update: {}
    };

    const requestHandler = updateSurveyCritter();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(errMsg);
      expect((actualError as HTTPError).status).to.equal(400);
      expect(mockSurveyUpdateCritter).not.to.have.been.called;
      expect(mockGetDBConnection).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});
