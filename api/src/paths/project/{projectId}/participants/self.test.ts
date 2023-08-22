import chai, { expect } from 'chai';
import { describe } from 'mocha';
import OpenAPIRequestValidator, { OpenAPIRequestValidatorArgs } from 'openapi-request-validator';
import OpenAPIResponseValidator, { OpenAPIResponseValidatorArgs } from 'openapi-response-validator';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { ProjectUser } from '../../../../repositories/project-participation-repository';
import { ProjectParticipationService } from '../../../../services/project-participation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { GET, getSelf } from './self';

chai.use(sinonChai);

describe('getSelf', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('openApiSchema', () => {
    describe('request validation', () => {
      const requestValidator = new OpenAPIRequestValidator((GET.apiDoc as unknown) as OpenAPIRequestValidatorArgs);

      describe('should throw an error when', () => {
        describe('projectId', () => {
          it('is invalid type', async () => {
            const request = {
              params: { projectId: 'one' }
            };

            const response = requestValidator.validateRequest(request);

            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].message).to.equal('must be integer');
          });

          it('is missing', async () => {
            const request = {
              params: {}
            };

            const response = requestValidator.validateRequest(request);

            expect(response.status).to.equal(400);
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].message).to.equal("must have required property 'projectId'");
          });
        });
      });

      describe('should succeed when', () => {
        it('required values are valid', async () => {
          const request = {
            params: { projectId: 1 }
          };

          const response = requestValidator.validateRequest(request);

          expect(response).to.be.undefined;
        });
      });
    });

    describe('response validation', () => {
      const responseValidator = new OpenAPIResponseValidator((GET.apiDoc as unknown) as OpenAPIResponseValidatorArgs);
      const mockParticipantRecord: ProjectUser = {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 20,
        project_role_ids: [1, 2],
        project_role_names: ['RoleA', 'RoleB'],
        project_role_permissions: []
      };

      describe('should throw an error when', () => {
        describe('project_id', () => {
          it('is undefined', async () => {
            const apiResponse = {
              ...mockParticipantRecord,
              project_id: undefined
            };
            const response = responseValidator.validateResponse(200, apiResponse);

            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].message).to.equal("must have required property 'project_id'");
          });

          it('is null', async () => {
            const apiResponse = {
              ...mockParticipantRecord,
              project_id: null
            };
            const response = responseValidator.validateResponse(200, apiResponse);

            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].message).to.equal('must be integer');
          });

          it('is wrong type', async () => {
            const apiResponse = {
              ...mockParticipantRecord,
              project_id: '1'
            };
            const response = responseValidator.validateResponse(200, apiResponse);

            expect(response.message).to.equal('The response was not valid.');
            expect(response.errors.length).to.equal(1);
            expect(response.errors[0].message).to.equal('must be integer');
          });
        });
      });

      describe('should succeed when', () => {
        it('required values are valid', async () => {
          const apiResponse = mockParticipantRecord;

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response).to.equal(undefined);
        });

        it('returns a null participant', async () => {
          const apiResponse = null;

          const response = responseValidator.validateResponse(200, apiResponse);
          expect(response).to.equal(undefined);
        });
      });
    });
  });

  it('should throw an error if projectId is missing', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {};

    try {
      const requestHandler = getSelf();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal("Missing required param 'projectId'");
    }
  });

  it('should throw an error if connection fails to get systemUserId', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => (null as unknown) as number
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    try {
      const requestHandler = getSelf();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal("Failed to get the user's system user ID");
    }
  });

  it('should return a null participant record', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => 20
    });

    const projectParticipationServiceStub = sinon
      .stub(ProjectParticipationService.prototype, 'getProjectParticipant')
      .resolves(null);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    const requestHandler = getSelf();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(projectParticipationServiceStub).to.be.calledWith(1, 20);
    expect(mockRes.jsonValue).to.eql(null);
  });

  it('should return a participant record with a single role', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => 20
    });

    const projectParticipationServiceStub = sinon
      .stub(ProjectParticipationService.prototype, 'getProjectParticipant')
      .resolves({
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 20,
        project_role_ids: [1],
        project_role_names: ['Test-Role-A'],
        project_role_permissions: ['Test Permission']
      });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    const requestHandler = getSelf();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(projectParticipationServiceStub).to.be.calledWith(1, 20);
    expect(mockRes.jsonValue).to.eql({
      project_participation_id: 1,
      project_id: 1,
      system_user_id: 20,
      project_role_ids: [1],
      project_role_names: ['Test-Role-A'],
      project_role_permissions: ['Test Permission']
    });
  });

  it('should return a participant record with more than one role', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => 20
    });

    const projectParticipationServiceStub = sinon
      .stub(ProjectParticipationService.prototype, 'getProjectParticipant')
      .resolves({
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 20,
        project_role_ids: [1, 2],
        project_role_names: ['Test-Role-A', 'Test-Role-B'],
        project_role_permissions: ['Test Permission']
      });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    const requestHandler = getSelf();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(projectParticipationServiceStub).to.be.calledWith(1, 20);
    expect(mockRes.jsonValue).to.eql({
      project_participation_id: 1,
      project_id: 1,
      system_user_id: 20,
      project_role_ids: [1, 2],
      project_role_names: ['Test-Role-A', 'Test-Role-B'],
      project_role_permissions: ['Test Permission']
    });
  });

  it('catches and re-throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => 20
    });

    sinon.stub(ProjectParticipationService.prototype, 'getProjectParticipant').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    try {
      const requestHandler = getSelf();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
