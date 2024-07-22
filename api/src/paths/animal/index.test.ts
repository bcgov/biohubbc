import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { SystemUser } from '../../repositories/user-repository';
import { FindCrittersResponse, SurveyCritterService } from '../../services/survey-critter-service';
import { KeycloakUserInformation } from '../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { findAnimals } from './index';

chai.use(sinonChai);

describe('findAnimals', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns animals', async () => {
    const mockFindAnimalsResponse: FindCrittersResponse[] = [
      {
        wlh_id: null,
        animal_id: '456-456-456',
        sex: 'unknown',
        itis_tsn: 123456,
        itis_scientific_name: 'scientific name',
        critter_comment: '',
        critter_id: 2,
        survey_id: 1,
        critterbase_critter_id: '123-123-123'
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findCrittersStub = sinon
      .stub(SurveyCritterService.prototype, 'findCritters')
      .resolves(mockFindAnimalsResponse);

    const findCrittersCountStub = sinon.stub(SurveyCritterService.prototype, 'findCrittersCount').resolves(50);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      start_date: '2021-01-01',
      end_date: '2021-01-31',
      system_user_id: '11',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    } as SystemUser;

    const requestHandler = findAnimals();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findCrittersStub).to.have.been.calledOnceWith(true, 20, sinon.match.any, sinon.match.object);
    expect(findCrittersCountStub).to.have.been.calledOnceWith(true, 20, sinon.match.object);

    expect(mockRes.jsonValue.animals).to.eql(mockFindAnimalsResponse);
    expect(mockRes.jsonValue.pagination).not.to.be.null;

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockFindAnimalsResponse: FindCrittersResponse[] = [
      {
        wlh_id: null,
        animal_id: '456-456-456',
        sex: 'unknown',
        itis_tsn: 123456,
        itis_scientific_name: 'scientific name',
        critter_comment: '',
        critter_id: 2,
        survey_id: 1,
        critterbase_critter_id: '123-123-123'
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

    const findCrittersStub = sinon
      .stub(SurveyCritterService.prototype, 'findCritters')
      .resolves(mockFindAnimalsResponse);

    const findCrittersCountStub = sinon
      .stub(SurveyCritterService.prototype, 'findCrittersCount')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      start_date: '2021-01-01',
      end_date: '2021-01-31',
      system_user_id: '11',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    } as SystemUser;

    const requestHandler = findAnimals();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findCrittersStub).to.have.been.calledOnceWith(false, 20, sinon.match.object, sinon.match.object);
      expect(findCrittersCountStub).to.have.been.calledOnceWith(false, 20, sinon.match.object);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
