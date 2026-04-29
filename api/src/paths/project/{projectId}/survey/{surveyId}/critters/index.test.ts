import { expect } from 'chai';
import sinon from 'sinon';
import { addCritterToSurvey, getCrittersFromSurvey } from '.';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { dbDependencies as db } from '../../../../../../database/db';
import { CritterbaseService, ICritter } from '../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';

describe('getCrittersFromSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns critters from survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

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

    const mockGetCrittersInSurvey = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .resolves([mockSurveyCritter]);
    const mockGetMultipleCrittersByIds = sinon
      .stub(CritterbaseService.prototype, 'getMultipleCrittersByIds')
      .resolves([mockCBCritter] as unknown as ICritter[]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getCrittersFromSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockGetCrittersInSurvey).to.have.been.calledOnce;
    expect(mockGetMultipleCrittersByIds).to.be.calledOnceWith([mockSurveyCritter.critterbase_critter_id]);
    expect(mockRes.json).to.have.been.calledWith([
      {
        // SIMS properties
        critter_id: mockSurveyCritter.critter_id,
        critterbase_critter_id: mockSurveyCritter.critterbase_critter_id,
        // Critterbase properties
        wlh_id: mockCBCritter.wlh_id,
        animal_id: mockCBCritter.animal_id,
        sex: mockCBCritter.sex,
        itis_tsn: mockCBCritter.itis_tsn,
        itis_scientific_name: mockCBCritter.itis_scientific_name,
        critter_comment: mockCBCritter.critter_comment
      }
    ]);
  });

  it('returns empty array if no critters in survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockGetCrittersInSurvey = sinon.stub(SurveyCritterService.prototype, 'getCrittersInSurvey').resolves([]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getCrittersFromSurvey();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockGetCrittersInSurvey).to.have.been.calledOnce;
    expect(mockRes.json).to.have.been.calledWith([]);
  });

  it('returns empty array if SIMS critter has no matching Critterbase critter record', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

    const mockSurveyCritter = {
      critter_id: 123,
      survey_id: 123,
      critterbase_critter_id: 'critterbase1'
    };
    const mockCBCritter = {
      critter_id: 'critterbase_no_match',
      wlh_id: 'wlh1',
      animal_id: 'animal1',
      sex: 'unknown',
      itis_tsn: 12345,
      itis_scientific_name: 'species1',
      critter_comment: 'comment1'
    };

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockGetCrittersInSurvey = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .resolves([mockSurveyCritter]);
    const mockGetMultipleCrittersByIds = sinon
      .stub(CritterbaseService.prototype, 'getMultipleCrittersByIds')
      .resolves([mockCBCritter] as unknown as ICritter[]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getCrittersFromSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetCrittersInSurvey).to.have.been.calledOnce;
    expect(mockGetMultipleCrittersByIds).to.be.calledOnceWith([mockSurveyCritter.critterbase_critter_id]);
    expect(mockRes.json).to.have.been.calledWith([]);
  });

  it('returns empty array if SIMS critter has no matching Critterbase critter record (Critterbase response empty)', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSurveyCritter = {
      critter_id: 123,
      survey_id: 123,
      critterbase_critter_id: 'critterbase1'
    };

    const mockGetCrittersInSurvey = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .resolves([mockSurveyCritter]);
    const mockGetMultipleCrittersByIds = sinon
      .stub(CritterbaseService.prototype, 'getMultipleCrittersByIds')
      .resolves([]); // Empty response

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getCrittersFromSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetCrittersInSurvey).to.have.been.calledOnce;
    expect(mockGetMultipleCrittersByIds).to.be.calledOnceWith([mockSurveyCritter.critterbase_critter_id]);
    expect(mockRes.json).to.have.been.calledWith([]);
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');

    const mockGetCrittersInSurvey = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getCrittersFromSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetCrittersInSurvey).to.have.been.calledOnce;
      expect(getDBConnectionStub).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});

describe('addCritterToSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('calls addCrittersToSurvey when critter_id included and returns critters from survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSurveyCritter = { critter_id: 123, critterbase_critter_id: 'critterbase1' };
    const mockCBCritter = { critter_id: 'critterbase1' };

    const mockAddCritterToSurvey = sinon
      .stub(SurveyCritterService.prototype, 'addCrittersToSurvey')
      .resolves([mockSurveyCritter.critter_id]);
    const mockCreateCritter = sinon.stub(CritterbaseService.prototype, 'createCritter').resolves(mockCBCritter);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      critter_id: 'critterbase1'
    };

    const requestHandler = addCritterToSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockAddCritterToSurvey).to.have.been.calledOnce;
    expect(mockCreateCritter).to.not.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(201);
    expect(mockRes.json).to.have.been.calledWith(mockSurveyCritter);
  });

  it('calls createCritterAndAddToSurvey when critter_id not included and returns critters from survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSurveyCritter = { critter_id: 123, critterbase_critter_id: 'critterbase1' };
    const mockCBCritter = { critter_id: undefined };

    const mockAddCritterToSurvey = sinon
      .stub(SurveyCritterService.prototype, 'createCritterAndAddToSurvey')
      .resolves({ critterbaseCritterId: 'critterbase1', surveyCritterId: 123 });
    const mockCreateCritter = sinon.stub(CritterbaseService.prototype, 'createCritter').resolves(mockCBCritter);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      critter_id: undefined
    };

    const requestHandler = addCritterToSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockAddCritterToSurvey).to.have.been.calledOnce;
    expect(mockCreateCritter).to.not.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(201);
    expect(mockRes.json).to.have.been.calledWith(mockSurveyCritter);
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');
    const mockAddCritterToSurvey = sinon.stub(SurveyCritterService.prototype, 'addCrittersToSurvey').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      critter_id: 'critterbase1'
    };

    const requestHandler = addCritterToSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockAddCritterToSurvey).to.have.been.calledOnce;
      expect(getDBConnectionStub).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});
