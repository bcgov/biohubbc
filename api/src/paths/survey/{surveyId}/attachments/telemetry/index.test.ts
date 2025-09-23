import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getSurveyTelemetryCredentialAttachments, postSurveyTelemetryCredentialAttachment } from '.';
import { TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING } from '../../../../../constants/attachments';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { SurveyTelemetryCredentialAttachment } from '../../../../../repositories/attachment-repository';
import { AttachmentService } from '../../../../../services/attachment-service';
import { TelemetryVectronicService } from '../../../../../services/telemetry-services/telemetry-vectronic-service';
import * as file_utils from '../../../../../utils/file-utils';
import { KeycloakUserInformation } from '../../../../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';

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
        TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_ZIP_CONTENT
      );
    }
  });

  it('successfully imports a .cfg credential file', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const upsertSurveyTelemetryCredentialAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'upsertSurveyTelemetryCredentialAttachment')
      .resolves({
        survey_telemetry_vendor_credential_id: [94],
        telemetry_credential_lotek_id: [1],
        telemetry_credential_vectronic_id: [],
        survey_telemetry_credential_attachment_id: 44,
        key: 'path/to/file/test.cfg'
      });

    const uploadFileToS3Stub = sinon.stub(file_utils, 'uploadFileToS3').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      surveyId: '2'
    };

    const testFile = Buffer.from(
      '[888888]\nKey=d`qwertydisosososososohehuuuuuuuuuuuuuuuuc~[]hhhhhhhhhhhh^gg@frE\nIridium IMEI=111111111111111',
      'utf-8'
    );

    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.cfg',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: testFile,
        size: testFile.length
      }
    ] as Express.Multer.File[];

    const requestHandler = postSurveyTelemetryCredentialAttachment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledOnceWith(201);
    expect(mockRes.jsonValue).to.eql({ survey_telemetry_credential_attachment_id: 44 });
    expect(upsertSurveyTelemetryCredentialAttachmentStub).to.be.calledOnce;
    expect(uploadFileToS3Stub).to.be.calledOnce;
  });

  it('successfully imports a .keyx credential file', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const axiosStub = sinon.stub(TelemetryVectronicService.prototype, 'fetchTelemetrySepCountFromVectronic').resolves();

    const upsertSurveyTelemetryCredentialAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'upsertSurveyTelemetryCredentialAttachment')
      .resolves({
        survey_telemetry_vendor_credential_id: [94],
        telemetry_credential_lotek_id: [],
        telemetry_credential_vectronic_id: [1],
        survey_telemetry_credential_attachment_id: 44,
        key: 'path/to/file/test.keyx'
      });

    const uploadFileToS3Stub = sinon.stub(file_utils, 'uploadFileToS3').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      surveyId: '2'
    };

    const testKeyxFile = Buffer.from(
      '<?xml version="1.0" encoding="utf-8"?><collarKey><collar ID="12345"><comIDList><comID comType="Paladium">888888888888888</comID></comIDList><key>ABCDEF1234567890ABCDEF1234567890</key><collarType>333</collarType></collar></collarKey>',
      'utf-8'
    );
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.keyx',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: testKeyxFile,
        size: testKeyxFile.length
      }
    ] as Express.Multer.File[];

    const requestHandler = postSurveyTelemetryCredentialAttachment();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledOnceWith(201);
    expect(mockRes.jsonValue).to.eql({ survey_telemetry_credential_attachment_id: 44 });
    expect(upsertSurveyTelemetryCredentialAttachmentStub).to.be.calledOnce;
    expect(uploadFileToS3Stub).to.be.calledOnce;
    expect(axiosStub).to.have.been.calledOnceWith('12345', 'ABCDEF1234567890ABCDEF1234567890');
    axiosStub.restore();
  });

  it('Should return error the vectronic API reports wrong collar key or internal server error', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const axiosStub = sinon
      .stub(TelemetryVectronicService.prototype, 'fetchTelemetrySepCountFromVectronic')
      .rejects(new Error());
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      surveyId: '2'
    };

    const testKeyxFile = Buffer.from(
      '<?xml version="1.0" encoding="utf-8"?><collarKey><collar ID="12345"><comIDList><comID comType="Paladium">888888888888888</comID></comIDList><key>ABCDEF1234567890ABCDEF1234567890</key><collarType>333</collarType></collar></collarKey>',
      'utf-8'
    );
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.keyx',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: testKeyxFile,
        size: testKeyxFile.length
      }
    ] as Express.Multer.File[];

    const requestHandler = postSurveyTelemetryCredentialAttachment();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected error not thrown');
    } catch (actualError) {
      const error = actualError as HTTPError;
      expect(error.message).to.equal(
        `${TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE}: ${TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.KEYX_NOT_FOUND}`
      );
      expect(error.status).to.equal(400);
    }
    expect(axiosStub).to.have.been.calledOnceWith('12345', 'ABCDEF1234567890ABCDEF1234567890');
    axiosStub.restore();
  });

  it('should catch and re-throw an error', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockError = new Error('A test error');

    const upsertSurveyTelemetryCredentialAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'upsertSurveyTelemetryCredentialAttachment')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      surveyId: '2'
    };

    const testFile = Buffer.from(
      '[888888]\nKey=d`qwertydisosososososohehuuuuuuuuuuuuuuuuc~[]hhhhhhhhhhhh^gg@frE\nIridium IMEI=111111111111111',
      'utf-8'
    );

    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.cfg',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: testFile,
        size: testFile.length
      }
    ] as Express.Multer.File[];

    const requestHandler = postSurveyTelemetryCredentialAttachment();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(mockError.message);

      expect(upsertSurveyTelemetryCredentialAttachmentStub).to.have.been.calledOnce;
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
