import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { FindSurveysResponse } from '../../models/survey-view';
import { SurveyService } from '../../services/survey-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { findSurveys } from './index';

chai.use(sinonChai);

describe('findSurveys', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns surveys', async () => {
    const mockFindSurveysResponse: FindSurveysResponse[] = [
      {
        project_id: 1,
        survey_id: 2,
        name: 'survey name',
        progress_id: 3,
        regions: ['region1'],
        start_date: '2021-01-01',
        end_date: '2021-01-31',
        focal_species: [123, 456],
        types: [1, 2]
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findSurveysStub = sinon.stub(SurveyService.prototype, 'findSurveys').resolves(mockFindSurveysResponse);

    const findSurveysCountStub = sinon.stub(SurveyService.prototype, 'findSurveysCount').resolves(50);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      start_date: '2021-01-01',
      end_date: '2021-01-31',
      system_user_id: '11',
      survey_name: 'survey name',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockreq.keycloak_token = {};
    mockreq.system_user = {
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    };

    const requestHandler = findSurveys();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findSurveysStub).to.have.been.calledOnceWith(true, 20, sinon.match.object, sinon.match.object);
    expect(findSurveysCountStub).to.have.been.calledOnceWith(true, 20, sinon.match.object);

    expect(mockRes.jsonValue.surveys).to.eql(mockFindSurveysResponse);
    expect(mockRes.jsonValue.pagination).not.to.be.null;

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockFindSurveysResponse: FindSurveysResponse[] = [
      {
        project_id: 1,
        survey_id: 2,
        name: 'survey name',
        progress_id: 3,
        regions: ['region1'],
        start_date: '2021-01-01',
        end_date: '2021-01-31',
        focal_species: [123, 456],
        types: [1, 2]
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findSurveysStub = sinon.stub(SurveyService.prototype, 'findSurveys').resolves(mockFindSurveysResponse);

    const findSurveysCountStub = sinon
      .stub(SurveyService.prototype, 'findSurveysCount')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      start_date: '2021-01-01',
      end_date: '2021-01-31',
      survey_name: 'survey name',
      system_user_id: '11',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockreq.keycloak_token = {};
    mockreq.system_user = {
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    };

    const requestHandler = findSurveys();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findSurveysStub).to.have.been.calledOnceWith(false, 20, sinon.match.object, sinon.match.object);
      expect(findSurveysCountStub).to.have.been.calledOnceWith(false, 20, sinon.match.object);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
