import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { PlatformService } from '../../../../../../services/platform-service';
import { SurveyService } from '../../../../../../services/survey-service';
import { getSurveyPublishableFeatures } from './features';

chai.use(sinonChai);

describe('survey/{surveyId}/publish/features', () => {
  describe('getSurveyPublishableFeatures', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns publishable feature types', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(SurveyService.prototype, 'getSurveyData').resolves({ project_id: 1 } as any);
      sinon.stub(PlatformService.prototype, 'getSurveyPublishableFeatures').resolves({
        featureTypes: ['animal', 'sample_site'] as any
      });

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        projectId: '1',
        surveyId: '2'
      };

      try {
        const requestHandler = getSurveyPublishableFeatures();
        await requestHandler(mockReq, mockRes, mockNext);
      } catch (_error) {
        expect.fail();
      }

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql({ featureTypes: ['animal', 'sample_site'] });
      expect(dbConnectionObj.release).to.have.been.calledOnce;
    });

    it('catches and rethrows errors while releasing connection', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(SurveyService.prototype, 'getSurveyData').resolves({ project_id: 1 } as any);
      sinon.stub(PlatformService.prototype, 'getSurveyPublishableFeatures').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        projectId: '1',
        surveyId: '2'
      };

      try {
        const requestHandler = getSurveyPublishableFeatures();
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (error) {
        expect(dbConnectionObj.release).to.have.been.calledOnce;
        expect((error as HTTPError).message).to.equal('a test error');
      }
    });

    it('throws bad request when survey does not belong to project', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(SurveyService.prototype, 'getSurveyData').resolves({ project_id: 99 } as any);
      const getSurveyPublishableFeaturesStub = sinon.stub(PlatformService.prototype, 'getSurveyPublishableFeatures');

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = {
        projectId: '1',
        surveyId: '2'
      };

      try {
        const requestHandler = getSurveyPublishableFeatures();
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (error) {
        expect((error as HTTPError).message).to.equal('Invalid project or survey identifier.');
        expect(dbConnectionObj.release).to.have.been.calledOnce;
        expect(getSurveyPublishableFeaturesStub).to.not.have.been.called;
      }
    });
  });
});
