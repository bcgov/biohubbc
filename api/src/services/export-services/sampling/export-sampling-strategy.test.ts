import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL, { SQLStatement } from 'sql-template-strings';
import { SurveyRepository } from '../../../repositories/survey-repository';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ExportSamplingStrategy } from './export-sampling-strategy';

chai.use(sinonChai);

describe('ExportObservationStrategy', () => {
  describe('getExportStrategyConfig', () => {
    it('should return the export strategy config', async () => {
      const connection = getMockDBConnection();

      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      const exportSamplingStrategy = new ExportSamplingStrategy(config, connection);

      const result = await exportSamplingStrategy.getExportStrategyConfig();

      expect(result.queries?.length).to.equal(3);
      expect(result.queries?.[0].fileName).to.equal('periods.csv');
      expect(result.queries?.[1].fileName).to.equal('sites.csv');
      expect(result.queries?.[2].fileName).to.equal('techniques.csv');
    });

    it('should call SurveyRepository.getSampleSitesBySurveyId with the correct surveyId and return a valid SQLStatement', () => {
      const connection = getMockDBConnection();

      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      // Create a new instance of ExportSamplingStrategy and mock the config
      const surveySamplingStrategy = new ExportSamplingStrategy(config, connection);

      // Stub the method SurveyRepository.getSampleSitesBySurveyId to return a mocked SQLStatement
      const getSampleSitesBySurveyIdStub = sinon
        .stub(SurveyRepository, 'getSampleSitesBySurveyId')
        .returns(SQL`SELECT * FROM sample_sites WHERE survey_id = ${config.surveyId}`);

      // Call the method _getSitesSql
      const result = surveySamplingStrategy._getSitesSql();

      // Assert that getSampleSitesBySurveyId was called with the correct surveyId
      expect(getSampleSitesBySurveyIdStub.calledOnceWithExactly(config.surveyId)).to.be.true;

      // Assert that the result matches the expected SQLStatement structure
      const expectedSQL: SQLStatement = SQL`SELECT * FROM sample_sites WHERE survey_id = ${config.surveyId}`;

      // Compare the query and values part of the result
      expect(result.sql).to.equal(expectedSQL.sql);
      expect(result.values).to.deep.equal(expectedSQL.values);

      // Restore the original method to avoid side effects
      sinon.restore();
    });

    it('should call SurveyRepository.getSampleTechniquesBySurveyId with the correct surveyId and return a valid SQLStatement', () => {
      const connection = getMockDBConnection();

      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      // Create a new instance of ExportSamplingStrategy and mock the config
      const surveySamplingStrategy = new ExportSamplingStrategy(config, connection);

      // Stub the method SurveyRepository.getSampleTechniquesBySurveyId to return a mocked SQLStatement
      const getSampleTechniquesBySurveyIdStub = sinon
        .stub(SurveyRepository, 'getSampleTechniquesBySurveyId')
        .returns(SQL`SELECT * FROM sample_techniques WHERE survey_id = ${config.surveyId}`);

      // Call the method _getTechniquesSql
      const result = surveySamplingStrategy._getTechniquesSql();

      // Assert that getSampleTechniquesBySurveyId was called with the correct surveyId
      expect(getSampleTechniquesBySurveyIdStub.calledOnceWithExactly(config.surveyId)).to.be.true;

      // Assert that the result matches the expected SQLStatement structure
      const expectedSQL: SQLStatement = SQL`SELECT * FROM sample_techniques WHERE survey_id = ${config.surveyId}`;

      // Compare the query and values part of the result
      expect(result.sql).to.equal(expectedSQL.sql);
      expect(result.values).to.deep.equal(expectedSQL.values);

      // Restore the original method to avoid side effects
      sinon.restore();
    });

    it('should call SurveyRepository.getSamplePeriodsBySurveyId with the correct surveyId and return a valid SQLStatement', () => {
      const connection = getMockDBConnection();

      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      // Create a new instance of ExportSamplingStrategy and mock the config
      const surveySamplingStrategy = new ExportSamplingStrategy(config, connection);

      // Stub the method SurveyRepository.getSamplePeriodsBySurveyId to return a mocked SQLStatement
      const getSamplePeriodsBySurveyIdStub = sinon
        .stub(SurveyRepository, 'getSamplePeriodsBySurveyId')
        .returns(SQL`SELECT * FROM survey_sample_period WHERE survey_id = ${config.surveyId}`);

      // Call the method _getPeriodsSql
      const result = surveySamplingStrategy._getPeriodsSql();

      // Assert that getSamplePeriodsBySurveyId was called with the correct surveyId
      expect(getSamplePeriodsBySurveyIdStub.calledOnceWithExactly(config.surveyId)).to.be.true;

      // Assert that the result matches the expected SQLStatement structure
      const expectedSQL: SQLStatement = SQL`SELECT * FROM survey_sample_period WHERE survey_id = ${config.surveyId}`;

      // Compare the query and values part of the result
      expect(result.sql).to.equal(expectedSQL.sql);
      expect(result.values).to.deep.equal(expectedSQL.values);

      // Restore the original method to avoid side effects
      sinon.restore();
    });

    it('should return exception for export sampling strategy config', async () => {
      const connection = getMockDBConnection(); // Mocked DB connection
      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      // Create an instance of ExportSamplingStrategy
      const exportSamplingStrategy = new ExportSamplingStrategy(config, connection);

      // Stub the method to throw an error
      const getPeriodsSql = sinon
        .stub(exportSamplingStrategy, '_getPeriodsSql')
        .throws(new Error('Test sampling strategy error'));

      try {
        await exportSamplingStrategy.getExportStrategyConfig();
        expect.fail('Expected error was not thrown');
      } catch (error) {
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Test sampling strategy error');
      } finally {
        getPeriodsSql.restore();
      }

      // Check if _getPeriodsSql was called
      expect(getPeriodsSql).to.have.been.calledOnce;
    });

    it('should transform the sampling periods item into a CSV string correctly', () => {
      // Example input item
      const item = {
        survey_sample_period_id: '1',
        method_technique_id: '2',
        survey_sample_site_id: '3',
        start_date: '2025-03-25',
        end_date: '2025-03-26',
        start_time: '12:00:00',
        end_time: '14:00:00'
      };

      // Call the method
      const result = ExportSamplingStrategy.samplingPeriodsCsvTransformation(item);

      // The expected CSV string
      const expectedCsv = '1,"2","3","2025-03-25","2025-03-26","12:00:00","14:00:00"';

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });

    it('should transform the sampling technique item into a CSV string correctly', () => {
      // Example input item with attributes and vantage data
      const item = {
        method_technique_id: 1,
        method_name: 'Technique Name',
        description: 'Technique description',
        method_lookup_name: 'Method Lookup Name',
        attractants: 'Attractant X;Attractant Y',
        attrib_data: [{ av: 'attribute_1_value' }, { av: 'attribute_2_value' }],
        vantage_data: [{ vv: 'vantage_1_value' }, { vv: 'vantage_2_value' }]
      };

      // Call the method
      const result = ExportSamplingStrategy.samplingTechniquesCsvTransformation(item);

      // The expected CSV string, combining all fields with attributes and vantage values
      const expectedCsv =
        '1,"Technique Name","Technique description","Method Lookup Name","Attractant X;Attractant Y",attribute_1_value,attribute_2_value,vantage_1_value,vantage_2_value';

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });

    it('should transform the sampling site item into a CSV string correctly', () => {
      // Example input item
      const item = {
        survey_sample_site_id: 1,
        name: 'Test Site 1',
        description: 'A sample site for testing',
        geometry_wkt: 'POINT(30 10)'
      };

      // Call the method
      const result = ExportSamplingStrategy.samplingSitesCsvTransformation(item);

      // The expected CSV string
      const expectedCsv = '1,"Test Site 1","A sample site for testing","POINT(30 10)"';

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });
  });
});
