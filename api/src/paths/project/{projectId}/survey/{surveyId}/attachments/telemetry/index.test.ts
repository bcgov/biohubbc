import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getSurveyTelemetryCredentialAttachments, postSurveyTelemetryCredentialAttachment } from '.';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { SurveyTelemetryCredentialAttachment } from '../../../../../../../repositories/attachment-repository';
import { AttachmentService } from '../../../../../../../services/attachment-service';
import { BctwKeyxService } from '../../../../../../../services/bctw-service/bctw-keyx-service';
import * as file_utils from '../../../../../../../utils/file-utils';
import { KeycloakUserInformation } from '../../../../../../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('postSurveyTelemetryCredentialAttachment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when file type is invalid', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.notValid', // not a supported file type
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as Express.Multer.File[];

    const requestHandler = postSurveyTelemetryCredentialAttachment();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'The file is neither a .keyx or .cfg file, nor is it an archive containing only files of these types.'
      );
    }
  });

  it('succeeds and uploads a KeyX file to BCTW', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const upsertSurveyTelemetryCredentialAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'upsertSurveyTelemetryCredentialAttachment')
      .resolves({ survey_telemetry_credential_attachment_id: 44, key: 'path/to/file/test.keyx' });

    const uploadFileToS3Stub = sinon.stub(file_utils, 'uploadFileToS3').resolves();

    const uploadKeyXStub = sinon.stub(BctwKeyxService.prototype, 'uploadKeyX').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.keyx',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as Express.Multer.File[];

    const requestHandler = postSurveyTelemetryCredentialAttachment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({ survey_telemetry_credential_attachment_id: 44 });
    expect(upsertSurveyTelemetryCredentialAttachmentStub).to.be.calledOnce;
    expect(uploadKeyXStub).to.be.calledOnce;
    expect(uploadFileToS3Stub).to.be.calledOnce;
  });

  it('succeeds and does not upload a Cfg file to BCTW', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const upsertSurveyTelemetryCredentialAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'upsertSurveyTelemetryCredentialAttachment')
      .resolves({ survey_telemetry_credential_attachment_id: 44, key: 'path/to/file/test.keyx' });

    const uploadFileToS3Stub = sinon.stub(file_utils, 'uploadFileToS3').resolves();

    const uploadKeyXStub = sinon.stub(BctwKeyxService.prototype, 'uploadKeyX').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.cfg',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as Express.Multer.File[];

    const requestHandler = postSurveyTelemetryCredentialAttachment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({ survey_telemetry_credential_attachment_id: 44 });
    expect(upsertSurveyTelemetryCredentialAttachmentStub).to.be.calledOnce;
    expect(uploadKeyXStub).not.to.be.called; // not called
    expect(uploadFileToS3Stub).to.be.calledOnce;
  });

  it('should catch and re-throw an error', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const upsertSurveyTelemetryCredentialAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'upsertSurveyTelemetryCredentialAttachment')
      .resolves({ survey_telemetry_credential_attachment_id: 44, key: 'path/to/file/test.keyx' });

    const mockError = new Error('A test error');
    const uploadKeyXStub = sinon.stub(BctwKeyxService.prototype, 'uploadKeyX').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.keyx',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as Express.Multer.File[];

    const requestHandler = postSurveyTelemetryCredentialAttachment();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(mockError.message);

      expect(upsertSurveyTelemetryCredentialAttachmentStub).to.have.been.calledOnce;
      expect(uploadKeyXStub).to.have.been.calledOnce;
    }
  });
});

describe('getSurveyTelemetryCredentialAttachments', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns an array of telemetry credential file records', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockGetCredentialAttachmentsResponse: SurveyTelemetryCredentialAttachment[] = [
      {
        survey_telemetry_credential_attachment_id: 1,
        uuid: '123',
        file_name: 'test.keyx',
        file_type: 'keyx',
        file_size: 340,
        create_date: '2021-09-01T00:00:00Z',
        update_date: null,
        key: 'path/to/file/test.keyx',
        title: null,
        description: null
      },
      {
        survey_telemetry_credential_attachment_id: 2,
        uuid: '456',
        file_name: 'test.cfg',
        file_type: 'cfg',
        file_size: 340,
        create_date: '2021-09-01T00:00:00Z',
        update_date: null,
        key: 'path/to/file/test.cfg',
        title: null,
        description: null
      }
    ];

    const getSurveyTelemetryCredentialAttachmentsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyTelemetryCredentialAttachments')
      .resolves(mockGetCredentialAttachmentsResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getSurveyTelemetryCredentialAttachments();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({ telemetryAttachments: mockGetCredentialAttachmentsResponse });
    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(getSurveyTelemetryCredentialAttachmentsStub).to.have.been.calledOnceWith(2);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');

    const getSurveyTelemetryCredentialAttachmentsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyTelemetryCredentialAttachments')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getSurveyTelemetryCredentialAttachments();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('a test error');

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(getSurveyTelemetryCredentialAttachmentsStub).to.have.been.calledOnceWith(2);
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
