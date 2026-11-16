import { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import { getMockDBConnection } from '../../__mocks__/db';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { IAllTelemetryAdvancedFilters } from '../../models/telemetry-view';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
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

    it('should not insert a duplicate credential record for a survey device', async () => {
      const mockDbConnection = getMockDBConnection({
        sql: sinon.stub().resolves({ rowCount: 1, rows: [{ survey_telemetry_vendor_credential_id: 1 }] })
      });
      const telemetryVendorRepository = new TelemetryVendorRepository(mockDbConnection);

      await telemetryVendorRepository.insertTelemetryCredentialAttachmentVendor(1, 'lotek:11111', 1);

      const sqlText = (mockDbConnection.sql as sinon.SinonStub).getCall(0).args[0].text;
      expect(sqlText).to.contain('ON CONFLICT (survey_id, device_key) DO NOTHING');
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

  describe('telemetry query clauses', () => {
    const getSql = (modify: (queryBuilder: any) => void): string => {
      const queryBuilder = getKnex().queryBuilder().select('*').from('telemetry_lotek');
      modify(queryBuilder);
      return queryBuilder.toString();
    };

    it('should filter Lotek and Vectronic telemetry by credential without joining the credential table', () => {
      const telemetryVendorRepository = new TelemetryVendorRepository(getMockDBConnection());

      const lotekSql = getSql((qb) => telemetryVendorRepository.getLotekTelemetryByCredentialClause(qb, 1));
      const vectronicSql = getSql((qb) => telemetryVendorRepository.getVectronicTelemetryByCredentialClause(qb, 1));

      for (const sql of [lotekSql, vectronicSql]) {
        expect(sql).not.to.contain('join "survey_telemetry_vendor_credential"');
        expect(sql).to.contain('exists (select 1 from "survey_telemetry_vendor_credential"');
      }
      expect(lotekSql).to.contain('survey_telemetry_vendor_credential.device_key = telemetry_lotek.device_key');
      expect(vectronicSql).to.contain('survey_telemetry_vendor_credential.device_key = telemetry_vectronic.device_key');
    });

    it('should filter found telemetry by a credential for the same device and survey', () => {
      const sql = getSql((qb) =>
        TelemetryVendorRepository.getLotekOrVectronicTelemetryByCredentialsClause(qb, 'telemetry_lotek')
      );

      expect(sql).not.to.contain('join "survey_telemetry_vendor_credential"');
      expect(sql).to.contain('survey_telemetry_vendor_credential.survey_id = survey.survey_id');
      expect(sql).to.contain('survey_telemetry_vendor_credential.device_key = telemetry_lotek.device_key');
    });

    it('should exclude the deployment end timestamp from the attachment date range', () => {
      const telemetryVendorRepository = new TelemetryVendorRepository(getMockDBConnection());

      expect(getSql((qb) => telemetryVendorRepository.getLotekTelemetryByAttachmentDateRangeClause(qb))).to.contain(
        'telemetry_lotek.recdatetime < deployment.attachment_end_timestamp'
      );
      expect(getSql((qb) => telemetryVendorRepository.getVectronicTelemetryByAttachmentDateRangeClause(qb))).to.contain(
        'telemetry_vectronic.acquisitiontime < deployment.attachment_end_timestamp'
      );
      expect(getSql((qb) => telemetryVendorRepository.getATSTelemetryByAttachmentDateRangeClause(qb))).to.contain(
        'telemetry_ats.date < deployment.attachment_end_timestamp'
      );
    });
  });
});
