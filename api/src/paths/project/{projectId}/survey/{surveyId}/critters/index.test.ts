import { expect } from 'chai';
import sinon from 'sinon';
import { addCritterToSurvey, getCrittersFromSurvey } from '.';
import * as db from '../../../../../../database/db';
import { CritterbaseService, ICritter } from '../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

describe('getCrittersFromSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns critters from survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

    const mockSurveyCritter = {
      critter_id: 123,
      survey_id: 123,
      critterbase_critter_id: 'critterbase1'
    };
    const mockCBCritter = {
      critter_id: 'critterbase1',
      wlh_id: 'wlh1',
      animal_id: 'animal1',
      sex: 'unknown',
      itis_tsn: 12345,
      itis_scientific_name: 'species1',
      critter_comment: 'comment1'
    };

    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockGetCrittersInSurvey = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .resolves([mockSurveyCritter]);
    const mockGetMultipleCrittersByIds = sinon
      .stub(CritterbaseService.prototype, 'getMultipleCrittersByIds')
      .resolves([mockCBCritter] as unknown as ICritter[]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getCrittersFromSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection).to.have.been.calledOnce;
    expect(mockGetCrittersInSurvey).to.have.been.calledOnce;
    expect(mockGetMultipleCrittersByIds).to.be.calledOnceWith([mockSurveyCritter.critterbase_critter_id]);
    expect(mockRes.json).to.have.been.calledWith([
      {
        ...mockCBCritter,
        critter_id: mockSurveyCritter.critter_id,
        critterbase_critter_id: mockSurveyCritter.critter_id
      }
    ]);
  });

  it('returns empty array if no critters in survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockGetCrittersInSurvey = sinon.stub(SurveyCritterService.prototype, 'getCrittersInSurvey').resolves([]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getCrittersFromSurvey();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection).to.have.been.calledOnce;
    expect(mockGetCrittersInSurvey).to.have.been.calledOnce;
    expect(mockRes.json).to.have.been.calledWith([]);
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

    const mockError = new Error('a test error');
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockGetCrittersInSurvey = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getCrittersFromSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetCrittersInSurvey).to.have.been.calledOnce;
      expect(mockGetDBConnection).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});

describe('addCritterToSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('does not create a new critter', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

    const mockSurveyCritter = { critter_id: 123, critterbase_critter_id: 'critterbase1' };
    const mockCBCritter = { critter_id: 'critterbase1' };

    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockAddCritterToSurvey = sinon
      .stub(SurveyCritterService.prototype, 'addCritterToSurvey')
      .resolves(mockSurveyCritter.critter_id);
    const mockCreateCritter = sinon.stub(CritterbaseService.prototype, 'createCritter').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.body = mockCBCritter;

    const requestHandler = addCritterToSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection).to.have.been.calledOnce;
    expect(mockAddCritterToSurvey).to.have.been.calledOnce;
    expect(mockCreateCritter).not.to.have.been.called;
    expect(mockRes.status).to.have.been.calledWith(201);
    expect(mockRes.json).to.have.been.calledWith(mockSurveyCritter);
  });

  it('returns critters from survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

    const mockSurveyCritter = { critter_id: 123, critterbase_critter_id: 'critterbase1' };
    const mockCBCritter = { critter_id: 'critterbase1' };

    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockAddCritterToSurvey = sinon
      .stub(SurveyCritterService.prototype, 'addCritterToSurvey')
      .resolves(mockSurveyCritter.critter_id);
    const mockCreateCritter = sinon.stub(CritterbaseService.prototype, 'createCritter').resolves(mockCBCritter);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = addCritterToSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection).to.have.been.calledOnce;
    expect(mockAddCritterToSurvey).to.have.been.calledOnce;
    expect(mockCreateCritter).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(201);
    expect(mockRes.json).to.have.been.calledWith(mockSurveyCritter);
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

    const mockCBCritter = { critter_id: 'critterbase1' };

    const mockError = new Error('a test error');
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockAddCritterToSurvey = sinon.stub(SurveyCritterService.prototype, 'addCritterToSurvey').rejects(mockError);
    const mockCreateCritter = sinon.stub(CritterbaseService.prototype, 'createCritter').resolves(mockCBCritter);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = addCritterToSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockAddCritterToSurvey).to.have.been.calledOnce;
      expect(mockCreateCritter).to.have.been.calledOnce;
      expect(mockGetDBConnection).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});
