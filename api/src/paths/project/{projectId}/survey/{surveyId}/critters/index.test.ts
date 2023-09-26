import { expect } from 'chai';
import sinon from 'sinon';
import { addCritterToSurvey, getCrittersFromSurvey, updateSurveyCritter } from '.';
import * as db from '../../../../../../database/db';
import { CritterbaseService } from '../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

describe('getCrittersFromSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
  const mockSurveyCritter = { critter_id: 123, survey_id: 123, critterbase_critter_id: 'critterbase1' };
  const mockCBCritter = { critter_id: 'critterbase1' };

  it('returns critters from survey', async () => {
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockGetCrittersInSurvey = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .resolves([mockSurveyCritter]);
    const mockFilterCritters = sinon.stub(CritterbaseService.prototype, 'filterCritters').resolves([mockCBCritter]);
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getCrittersFromSurvey();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockGetCrittersInSurvey.calledOnce).to.be.true;
    expect(mockFilterCritters.calledOnce).to.be.true;
    expect(mockRes.json).to.have.been.calledWith([
      { ...mockCBCritter, survey_critter_id: mockSurveyCritter.critter_id }
    ]);
  });

  it('returns empty array if no critters in survey', async () => {
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockGetCrittersInSurvey = sinon.stub(SurveyCritterService.prototype, 'getCrittersInSurvey').resolves([]);
    const mockFilterCritters = sinon.stub(CritterbaseService.prototype, 'filterCritters').resolves([]);
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getCrittersFromSurvey();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockGetCrittersInSurvey.calledOnce).to.be.true;
    expect(mockFilterCritters.calledOnce).to.be.false;
    expect(mockRes.json).to.have.been.calledWith([]);
  });

  it('catches and re-throws errors', async () => {
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
      expect(mockGetCrittersInSurvey.calledOnce).to.be.true;
      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});

describe('addCritterToSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
  const mockSurveyCritter = 123;
  const mockCBCritter = { critter_id: 'critterbase1' };

  it('returns critters from survey', async () => {
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockAddCritterToSurvey = sinon
      .stub(SurveyCritterService.prototype, 'addCritterToSurvey')
      .resolves(mockSurveyCritter);
    const mockCreateCritter = sinon.stub(CritterbaseService.prototype, 'createCritter').resolves(mockCBCritter);
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = addCritterToSurvey();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockAddCritterToSurvey.calledOnce).to.be.true;
    expect(mockCreateCritter.calledOnce).to.be.true;
    expect(mockRes.status).to.have.been.calledWith(201);
    expect(mockRes.json).to.have.been.calledWith(mockCBCritter);
  });

  it('catches and re-throws errors', async () => {
    const mockError = new Error('a test error');
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockAddCritterToSurvey = sinon.stub(SurveyCritterService.prototype, 'addCritterToSurvey').rejects(mockError);
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = addCritterToSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockAddCritterToSurvey.calledOnce).to.be.true;
      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});

describe('updateSurveyCritter', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
  const mockCBCritter = { critter_id: 'critterbase1' };

  it('returns critters from survey', async () => {
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockSurveyUpdateCritter = sinon.stub(SurveyCritterService.prototype, 'updateCritter').resolves(1);
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

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockSurveyUpdateCritter.calledOnce).to.be.true;
    expect(mockCritterbaseUpdateCritter.calledOnce).to.be.true;
    expect(mockCritterbaseCreateCritter.calledOnce).to.be.true;
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith(mockCBCritter);
  });

  it('catches and re-throws errors', async () => {
    const mockError = new Error('a test error');
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockAddCritterToSurvey = sinon.stub(SurveyCritterService.prototype, 'updateCritter').rejects(mockError);
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
      expect(mockAddCritterToSurvey.calledOnce).to.be.true;
      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});
