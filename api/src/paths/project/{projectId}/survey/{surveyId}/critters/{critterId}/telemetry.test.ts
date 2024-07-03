import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../../database/db';
import { SurveyCritterService } from '../../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';
import { GET, getCritterTelemetry } from './telemetry';
import { BctwTelemetryService } from '../../../../../../../services/bctw-service/bctw-telemetry-service';

describe('critter telemetry', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(GET.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('getCritterTelemetry', () => {
    it('fetches telemetry object', async () => {
      const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const mockGetCrittersInSurvey = sinon
        .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
        .resolves([{ critter_id: 1, survey_id: 1, critterbase_critter_id: 'asdf' }]);
      const mockGetCritterPoints = sinon.stub(BctwTelemetryService.prototype, 'getCritterTelemetryPoints').resolves();
      const mockGetCritterTracks = sinon.stub(BctwTelemetryService.prototype, 'getCritterTelemetryTracks').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = getCritterTelemetry();

      mockReq.params.critterId = '1';

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockGetCrittersInSurvey.calledOnce).to.be.true;
      expect(mockGetCritterPoints.calledOnce).to.be.true;
      expect(mockGetCritterTracks.calledOnce).to.be.true;
    });

    it('catches and re-throws error', async () => {
      const mockError = new Error('a test error');
      const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const mockGetCrittersInSurvey = sinon
        .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
        .rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = getCritterTelemetry();
      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(actualError).to.eql(mockError);
        expect(mockGetDBConnection.calledOnce).to.be.true;
        expect(mockGetCrittersInSurvey.calledOnce).to.be.true;
      }
    });
  });
});
