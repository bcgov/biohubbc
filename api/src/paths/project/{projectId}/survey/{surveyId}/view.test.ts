import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { SurveyObject } from '../../../../../models/survey-view';
import { SurveyService } from '../../../../../services/survey-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import { getSurvey } from './view';

chai.use(sinonChai);

describe('survey/{surveyId}/view', () => {
  describe('getSurvey', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches a survey', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(SurveyService.prototype, 'getSurveyById').resolves({ id: 2 } as unknown as SurveyObject);

      sinon.stub(SurveyService.prototype, 'getSurveySupplementaryDataById').resolves({
        survey_metadata_publish: {
          survey_metadata_publish_id: 1,
          survey_id: 1,
          event_timestamp: '2020-04-04',
          submission_uuid: '123-456-789',
          create_date: '2020-04-04',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 1
        }
      });

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: '1',
        surveyId: '2'
      };

      mockReq.body = {};

      try {
        const requestHandler = getSurvey();

        await requestHandler(mockReq, mockRes, mockNext);
      } catch (actualError) {
        expect.fail();
      }

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql({
        surveyData: {
          id: 2
        },
        surveySupplementaryData: {
          survey_metadata_publish: {
            survey_metadata_publish_id: 1,
            survey_id: 1,
            event_timestamp: '2020-04-04',
            submission_uuid: '123-456-789',
            create_date: '2020-04-04',
            create_user: 1,
            update_date: null,
            update_user: null,
            revision_count: 1
          }
        }
      });
    });

    it('catches and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(SurveyService.prototype, 'getSurveyById').rejects(new Error('a test error'));
      sinon.stub(SurveyService.prototype, 'getSurveySupplementaryDataById').resolves();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getSurvey();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.release).to.have.been.called;

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
