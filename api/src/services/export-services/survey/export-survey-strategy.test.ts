import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { Readable } from 'stream';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ExportObservationStrategy } from '../observation/export-observation-strategy';
import { ExportTelemetryStrategy } from '../telemetry/export-telemetry-strategy';
import { ExportSurveyMetadataStrategy } from './export-survey-metadata-strategy';
import { ExportSurveyConfig, ExportSurveyStrategy, ExportSurveyStrategyConfig } from './export-survey-strategy';

chai.use(sinonChai);

describe('ExportSurveyStrategy', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should initialize with correct properties', () => {
    const dbConnection = getMockDBConnection();

    const exportSurveyConfig: ExportSurveyConfig = {
      metadata: true,
      sampling_data: false,
      observation_data: true,
      telemetry_data: true,
      animal_data: false,
      artifacts: false
    };

    const exportSurveyStrategyConfig: ExportSurveyStrategyConfig = {
      surveyId: 1,
      config: exportSurveyConfig,
      connection: dbConnection,
      isUserAdmin: true
    };

    const exportSurveyStrategy = new ExportSurveyStrategy(exportSurveyStrategyConfig);

    expect(exportSurveyStrategy.surveyId).to.equal(exportSurveyStrategyConfig.surveyId);
    expect(exportSurveyStrategy.config).to.deep.equal(exportSurveyStrategyConfig.config);
    expect(exportSurveyStrategy.isUserAdmin).to.equal(exportSurveyStrategyConfig.isUserAdmin);
  });

  it('should call getExportStrategyConfig for each enabled strategy', async () => {
    const dbConnection = getMockDBConnection();

    const exportSurveyConfig: ExportSurveyConfig = {
      metadata: true,
      sampling_data: false,
      observation_data: true,
      telemetry_data: true,
      animal_data: false,
      artifacts: false
    };

    const exportSurveyStrategyConfig: ExportSurveyStrategyConfig = {
      surveyId: 1,
      config: exportSurveyConfig,
      connection: dbConnection,
      isUserAdmin: true
    };

    const exportSurveyStrategy = new ExportSurveyStrategy(exportSurveyStrategyConfig);

    const metadataGetExportStrategyConfig = sinon
      .stub(ExportSurveyMetadataStrategy.prototype, 'getExportStrategyConfig')
      .resolves({
        queries: [
          {
            sql: SQL`metadata_query`,
            fileName: 'metadata.json'
          }
        ]
      });

    const observationGetExportStrategyConfig = sinon
      .stub(ExportObservationStrategy.prototype, 'getExportStrategyConfig')
      .resolves({
        queries: [
          {
            sql: SQL`observation_query`,
            fileName: 'observation.json'
          }
        ]
      });

    const telemetryGetExportStrategyConfig = sinon
      .stub(ExportTelemetryStrategy.prototype, 'getExportStrategyConfig')
      .resolves({
        streams: [
          {
            stream: () => {
              return new Readable({
                read() {}
              });
            },
            fileName: 'telemetry.json'
          }
        ]
      });

    const result = await exportSurveyStrategy.getExportStrategyConfig();

    expect(metadataGetExportStrategyConfig).to.have.been.calledOnce;
    expect(observationGetExportStrategyConfig).to.have.been.calledOnce;
    expect(telemetryGetExportStrategyConfig).to.have.been.calledOnce;

    expect(result.queries?.length).to.equal(2);
    expect(result.queries?.[0].fileName).to.equal('metadata.json');
    expect(result.queries?.[1].fileName).to.equal('observation.json');

    expect(result.streams?.length).to.equal(1);
    expect(result.streams?.[0].fileName).to.equal('telemetry.json');
  });

  it('should catch and re-throw errors', async () => {
    const dbConnection = getMockDBConnection();

    const exportSurveyConfig: ExportSurveyConfig = {
      metadata: true,
      sampling_data: false,
      observation_data: true,
      telemetry_data: true,
      animal_data: false,
      artifacts: false
    };

    const exportSurveyStrategyConfig: ExportSurveyStrategyConfig = {
      surveyId: 1,
      config: exportSurveyConfig,
      connection: dbConnection,
      isUserAdmin: true
    };

    const exportSurveyStrategy = new ExportSurveyStrategy(exportSurveyStrategyConfig);

    sinon.stub(ExportSurveyMetadataStrategy.prototype, 'getExportStrategyConfig').rejects(new Error('test error'));

    try {
      await exportSurveyStrategy.getExportStrategyConfig();
    } catch (error) {
      expect((error as Error).message).to.equal('test error');
    }
  });
});
