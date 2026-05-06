import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { SYSTEM_ROLE } from '../../constants/roles';
import { dbDependencies as db } from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { FindTechniqueRecord } from '../../repositories/technique-repository';
import { TechniqueService } from '../../services/technique-service';
import { KeycloakUserInformation } from '../../utils/keycloak-utils';
import { findTechniques } from './index';

chai.use(sinonChai);

describe('findTechniques', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns records', async () => {
    const mockFindResponse: FindTechniqueRecord[] = [
      {
        method_technique_id: 1,
        survey_id: 2,
        name: 'technique name',
        description: 'technique description',
        distance_threshold: 3,
        method_lookup_id: 4,
        method_response_metric_id: 5,
        method_response_metric_name: 'method response metric name',
        method_lookup_name: 'method lookup name'
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findTechniquesStub = sinon.stub(TechniqueService.prototype, 'findTechniques').resolves(mockFindResponse);

    const findTechniquesCountStub = sinon.stub(TechniqueService.prototype, 'findTechniquesCount').resolves(1);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      survey_id: '2',
      keyword: 'term',
      sample_site_id: '3',
      sample_period_id: '4',
      system_user_id: '5',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      system_user_id: 20,
      user_guid: '123-456-789',
      user_identifier: 'test-identifier',
      identity_source: 'IDIR',
      display_name: 'test-user',
      given_name: 'test-given',
      family_name: 'test-family',
      email: 'test-email',
      agency: 'test-agency',
      record_end_date: null,
      role_ids: [1],
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    };

    const requestHandler = findTechniques();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findTechniquesStub).to.have.been.calledOnceWith(
      true,
      20,
      sinon.match({
        survey_id: 2,
        keyword: 'term',
        sample_site_id: 3,
        sample_period_id: 4,
        system_user_id: 5
      }),
      sinon.match({
        limit: 10,
        page: 2,
        sort: undefined,
        order: undefined
      })
    );
    expect(findTechniquesCountStub).to.have.been.calledOnceWith(
      true,
      20,
      sinon.match({
        survey_id: 2,
        keyword: 'term',
        sample_site_id: 3,
        sample_period_id: 4,
        system_user_id: 5
      })
    );

    expect(mockRes.jsonValue.techniques).to.eql(mockFindResponse);
    expect(mockRes.jsonValue.pagination).not.to.be.null;

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockFindResponse: FindTechniqueRecord[] = [
      {
        method_technique_id: 1,
        survey_id: 2,
        name: 'technique name',
        description: 'technique description',
        distance_threshold: 3,
        method_lookup_id: 4,
        method_response_metric_id: 5,
        method_response_metric_name: 'method response metric name',
        method_lookup_name: 'method lookup name'
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

    const findTechniquesStub = sinon.stub(TechniqueService.prototype, 'findTechniques').resolves(mockFindResponse);

    const findTechniquesCountStub = sinon
      .stub(TechniqueService.prototype, 'findTechniquesCount')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      survey_id: '2',
      keyword: 'term',
      sample_site_id: '3',
      sample_period_id: '4',
      system_user_id: '5',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      system_user_id: 20,
      user_guid: '123-456-789',
      user_identifier: 'test-identifier',
      identity_source: 'IDIR',
      display_name: 'test-user',
      given_name: 'test-given',
      family_name: 'test-family',
      email: 'test-email',
      agency: 'test-agency',
      record_end_date: null,
      role_ids: [3],
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    };

    const requestHandler = findTechniques();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findTechniquesStub).to.have.been.calledOnceWith(
        false,
        20,
        sinon.match({
          survey_id: 2,
          keyword: 'term',
          sample_site_id: 3,
          sample_period_id: 4,
          system_user_id: 5
        }),
        sinon.match({
          limit: 10,
          page: 2,
          sort: undefined,
          order: undefined
        })
      );
      expect(findTechniquesCountStub).to.have.been.calledOnceWith(
        false,
        20,
        sinon.match({
          survey_id: 2,
          keyword: 'term',
          sample_site_id: 3,
          sample_period_id: 4,
          system_user_id: 5
        })
      );

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
