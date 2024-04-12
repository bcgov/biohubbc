import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { CritterbaseService } from '../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { DELETE, PATCH, removeCritterFromSurvey, updateSurveyCritter } from './{critterId}';

describe('critterId openapi schema', () => {
  const ajv = new Ajv();

  it('PATCH is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(PATCH.apiDoc as unknown as object)).to.be.true;
  });

  it('DELETE is valid openapi v3 schema', () => {
    expect(ajv.validateSchema(DELETE.apiDoc as unknown as object)).to.be.true;
  });
});

describe('removeCritterFromSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

  it('removes critter from survey', async () => {
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(SurveyCritterService.prototype, 'removeCritterFromSurvey').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = removeCritterFromSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });

  it('catches and re-throws errors', async () => {
    const mockError = new Error('a test error');

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(SurveyCritterService.prototype, 'removeCritterFromSurvey').rejects(mockError);

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

describe('updateSurveyCritter', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
  const mockCBCritter = { critter_id: 'critterbase1' };

  it('returns critters from survey', async () => {
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
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
      expect(mockSurveyUpdateCritter.calledOnce).to.be.true;
      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });

  it('catches and re-throws errors', async () => {
    const errMsg = 'No external critter ID was found.';
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
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
      expect(mockSurveyUpdateCritter.calledOnce).to.be.false;
      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});
