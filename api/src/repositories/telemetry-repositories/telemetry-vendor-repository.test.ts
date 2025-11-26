import { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { IAllTelemetryAdvancedFilters } from '../../models/telemetry-view';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { getMockDBConnection } from '../../__mocks__/db';
import { TelemetryVendorRepository } from './telemetry-vendor-repository';
import { Telemetry, TelemetrySpatial, TelemetryVendorEnum } from './telemetry-vendor-repository.interface';

describe('TelemetryVendorRepository', () => {
  beforeEach(() => {});

  afterEach(() => {
    sinon.restore();
  });

  describe('getTelemetryByDeploymentIds', () => {
    it('should get telemetry data for a list of deployments IDs successfully', async () => {
      const mockTelemetryRecord: Telemetry = {
        telemetry_id: '123-456-789',
        deployment_id: 1,
        critter_id: 1,
        vendor: TelemetryVendorEnum.LOTEK,
        serial: '12345',
        acquisition_date: '2025-01-01T00:00:00.000Z',
        latitude: -44.4114,
        longitude: 120.2835,
        elevation: null,
        temperature: null,
        dop: null
      };

      const mockResponse = {
        rowCount: 1,
        rows: [mockTelemetryRecord]
      } as any as Promise<Telemetry>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const surveyId = 1;
      const deploymentIds = [1];

      const response = await telemetryVendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentIds);

      expect(response).to.be.an('array').with.lengthOf(1);
      expect(response).to.eql([mockTelemetryRecord]);
    });

    it('should throw an error if the deployment is not found', async () => {
      const mockResponse = {
        rowCount: 0,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const surveyId = 1;
      const deploymentId = [2];

      try {
        await telemetryVendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentId);
      } catch (error) {
        expect(error).to.be.instanceOf(ApiExecuteSQLError);
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to get deployment');
      }
    });
  });

  describe('getTelemetrySpatialByDeploymentIds', () => {
    it('should return telemetry spatial data for a survey successfully', async () => {
      const mockTelemetry: TelemetrySpatial[] = [
        {
          telemetry_id: '123-456-789',
          geometry: {
            type: 'Point',
            coordinates: [120.2835, -44.4114]
          }
        }
      ];

      const mockResponse = {
        rowCount: 1,
        rows: [mockTelemetry]
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const surveyId = 1;
      const deploymentIds = [1];

      const response = await telemetryVendorRepository.getTelemetrySpatialByDeploymentIds(surveyId, deploymentIds);

      expect(response).to.be.an('array').with.lengthOf(1);
      expect(response).to.eql([mockTelemetry]);
    });
  });

  describe('getTelemetryRecordById', () => {
    it('should return a telemetry record successfully', async () => {
      const mockTelemetry: Telemetry = {
        telemetry_id: '123-456-789',
        deployment_id: 1,
        critter_id: 1,
        vendor: TelemetryVendorEnum.VECTRONIC,
        serial: '12345',
        acquisition_date: '2025-01-01T00:00:00.000Z',
        latitude: -44.4114,
        longitude: 120.2835,
        elevation: null,
        temperature: null,
        dop: null
      };

      const mockQueryResponse = {
        rowCount: 1,
        rows: [mockTelemetry]
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockQueryResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const surveyId = 1;
      const telemetryId = '123-456-789';

      const response = await telemetryVendorRepository.getTelemetryRecordById(surveyId, telemetryId);

      expect(response).to.eql(mockTelemetry);
    });

    it('should return failed to get telemetry record', async () => {
      const mockQueryResponse = {
        rowCount: 0,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockQueryResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const surveyId = 1;
      const telemetryId = '123-456-789';

      try {
        await telemetryVendorRepository.getTelemetryRecordById(surveyId, telemetryId);
      } catch (error) {
        expect(error).to.be.instanceOf(ApiExecuteSQLError);
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to get telemetry record');
      }
    });
  });

  describe('getTelemetrySupplementaryByDeploymentIds', () => {
    it('should return telemetry data count for a survey', async () => {
      const mockQueryResponse = { rows: [{ count: 1, start_date: '2020-01-01', end_date: '2022-05-05' }] };
      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockQueryResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const surveyId = 1;
      const deploymentIds = [1];

      const response = await telemetryVendorRepository.getTelemetrySupplementaryByDeploymentIds(
        surveyId,
        deploymentIds
      );

      expect(response).to.eql(mockQueryResponse.rows[0]);
    });
  });

  describe('findTelemetryCount', () => {
    it('should return number of surveys user has access to successfully', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ count: 1 }]
      };

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockQueryResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const isUserAdmin = true;
      const systemUserId = 1;
      const filters: IAllTelemetryAdvancedFilters = { keyword: TelemetryVendorEnum.VECTRONIC };

      const response = await telemetryVendorRepository.findTelemetryCount(isUserAdmin, systemUserId, filters);

      expect(response).to.eql(mockQueryResponse.rows[0].count);
    });

    it('should return failed to get number of surveys user has access to', async () => {
      const mockQueryResponse = {
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockQueryResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const isUserAdmin = true;
      const systemUserId = null;
      const filters: IAllTelemetryAdvancedFilters = {};

      try {
        await telemetryVendorRepository.findTelemetryCount(isUserAdmin, systemUserId, filters);
      } catch (error) {
        expect(error).to.be.instanceOf(ApiExecuteSQLError);
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to get telemetry count');
      }
    });
  });

  describe('insertTelemetryCredentialAttachmentVendor', () => {
    it('should insert vendor device key data record successfully', async () => {
      const mockQueryResponse = {
        rowCount: 1,
        rows: [{ survey_telemetry_vendor_credential_id: 1 }]
      };

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockQueryResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const survey_id = 1;
      const deviceKey = 'lotek:11111';
      const survey_telemetry_credential_attachment_id = 1;

      const respVenorId = await telemetryVendorRepository.insertTelemetryCredentialAttachmentVendor(
        survey_id,
        deviceKey,
        survey_telemetry_credential_attachment_id
      );

      expect(respVenorId).to.be.a('number');
      expect(respVenorId).to.equal(mockQueryResponse.rows[0].survey_telemetry_vendor_credential_id);
      expect(mockDbConnection.sql).to.have.been.calledOnce;
    });

    it('should throw an error if the insert operation fails', async () => {
      const mockQueryResponse = {
        rowCount: 0,
        rows: []
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockQueryResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const survey_id = 1;
      const deviceKey = 'lotek:11111';
      const survey_telemetry_credential_attachment_id = 1;

      try {
        await telemetryVendorRepository.insertTelemetryCredentialAttachmentVendor(
          survey_id,
          deviceKey,
          survey_telemetry_credential_attachment_id
        );
      } catch (error) {
        expect(error).to.be.instanceOf(ApiExecuteSQLError);
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert vendor device key attachment data');
      }
    });
  });

  describe('findTelemetry', () => {
    it('should return paginated telemetry records successfully', async () => {
      const mockTelemetry: Telemetry = {
        telemetry_id: '123-456-789',
        deployment_id: 1,
        critter_id: 1,
        vendor: TelemetryVendorEnum.MANUAL,
        serial: '12345',
        acquisition_date: '2025-01-01T00:00:00.000Z',
        latitude: -44.4114,
        longitude: 120.2835,
        elevation: null,
        temperature: null,
        dop: null
      };

      const mockQueryResponse = {
        rows: [mockTelemetry]
      } as any as Promise<QueryResult<any>>;

      const mockDbConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockQueryResponse) });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);
      const isUserAdmin = true;
      const systemUserId = null;
      const filters: IAllTelemetryAdvancedFilters = { keyword: TelemetryVendorEnum.MANUAL };
      const pagination: ApiPaginationOptions = {
        limit: 10,
        page: 1,
        sort: undefined,
        order: undefined
      };

      const response = await telemetryVendorRepository.findTelemetry(isUserAdmin, systemUserId, filters, pagination);

      expect(response).to.be.an('array').with.lengthOf(1);
      expect(response).to.eql([mockTelemetry]);
    });
  });
});
