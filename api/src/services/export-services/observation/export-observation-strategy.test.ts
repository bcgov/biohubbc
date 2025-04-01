import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL, { SQLStatement } from 'sql-template-strings';
import { ObservationRepository } from '../../../repositories/observation-repository/observation-repository';
import { getMockDBConnection } from '../../../__mocks__/db';
import { SubCountService } from '../../subcount-service';
import { ExportStrategyConfig } from '../export-strategy';
import { defaultLog, ExportObservationStrategy } from './export-observation-strategy';

chai.use(sinonChai);

describe('ExportObservationStrategy', () => {
  describe('getExportStrategyConfig', () => {
    it('should return the correct export strategy configuration', async () => {
      const connection = getMockDBConnection();
      const config = {
        surveyId: 1,
        isUserAdmin: true
      };
      const surveyObservationStrategy = new ExportObservationStrategy(config, connection);

      // Create a SQLStatement instance using sql-template-strings
      const sqlQuery: SQLStatement = SQL`SELECT * FROM observations`;
      const measurementsMap = new Map<string, string>();
      measurementsMap.set('key', 'value'); // Mock the measurements map

      // Stub the dependent methods (_getSql and _getMeasurementsMap)
      const _getSqlStub = sinon.stub(surveyObservationStrategy, '_getSql').returns(sqlQuery);
      const _getMeasurementsMapStub = sinon
        .stub(surveyObservationStrategy, '_getMeasurementsMap')
        .resolves(measurementsMap);

      // Call the method
      const result: ExportStrategyConfig = await surveyObservationStrategy.getExportStrategyConfig();

      // Expected result
      const expectedCsvHeader = [
        'Observation ID',
        'Subcount ID',
        'ITIS TSN',
        'Species',
        'Site',
        'Technique',
        'Period',
        'Sign',
        'Count',
        'Date',
        'Time',
        'Latitude',
        'Longitude',
        'Comment'
      ].join(',');

      const expectedConfig: ExportStrategyConfig = {
        queries: [
          {
            sql: sqlQuery,
            measurementsMap: measurementsMap,
            fileName: 'observations.csv',
            csvHeader: expectedCsvHeader,
            transformFunction: ExportObservationStrategy.observationCsvTransformation
          }
        ]
      };

      // Assert that the _getSql and _getMeasurementsMap methods were called
      expect(_getSqlStub.calledOnce).to.be.true;
      expect(_getMeasurementsMapStub.calledOnce).to.be.true;

      // Assert that the result matches the expected export strategy config
      expect(result).to.deep.equal(expectedConfig);

      // Restore stubs
      sinon.restore();
    });

    it('should return exception for export observation strategy config and log the error', async () => {
      const connection = getMockDBConnection(); // Mocked DB connection
      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      // Create an instance of ExportObservationStrategy
      const exportObservationStrategy = new ExportObservationStrategy(config, connection);

      // Stub the method to throw an error
      const getMeasurementsMap = sinon
        .stub(exportObservationStrategy, '_getMeasurementsMap')
        .throws(new Error('Test observation strategy error'));

      // Spy on the logger to ensure the error is logged
      const logErrorSpy = sinon.spy(defaultLog, 'error');

      try {
        await exportObservationStrategy.getExportStrategyConfig();
        expect.fail('Expected error was not thrown');
      } catch (error) {
        // Check if _getMeasurementsMap was called
        expect(getMeasurementsMap).to.have.been.calledOnce;

        // Ensure the error is thrown and the message matches
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Test observation strategy error');

        // Check if the error was logged correctly
        expect(logErrorSpy.calledOnce).to.be.true;

        // The structure of the log parameters
        const logArgs = logErrorSpy.getCall(0).args[0];

        // Check for 'label', 'message', and error details in the log args
        expect(logArgs).to.have.property('label', 'getExportStrategyConfig');
        expect(logArgs).to.have.property('message', 'Error generating export strategy config.');
        expect(logArgs.error.message).to.equal('Test observation strategy error');
      } finally {
        // Restore the stub and the spy
        getMeasurementsMap.restore();
        logErrorSpy.restore();
      }
    });

    it('should call ObservationRepository.buildObservationQuery with the correct surveyId and return the SQL query', async () => {
      // Mock the connection and config for the test
      const connection = getMockDBConnection(); // Adjust this if necessary
      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      // Create an instance of ExportObservationStrategy
      const exportObservationStrategy = new ExportObservationStrategy(config, connection);

      // Stub the ObservationRepository.buildObservationQuery method to return a mock SQLStatement
      const mockSqlStatement: SQLStatement = SQL`SELECT * FROM observations WHERE survey_id = ${config.surveyId}`;
      const buildObservationQueryStub = sinon
        .stub(ObservationRepository, 'buildObservationQuery')
        .returns(mockSqlStatement);

      // Call the _getSql method
      const result = exportObservationStrategy._getSql();

      // Assert that the buildObservationQuery method was called with the correct surveyId
      expect(buildObservationQueryStub.calledOnceWithExactly(config.surveyId)).to.be.true;

      // Assert that the result matches the expected SQLStatement (mockSqlStatement)
      expect(result).to.deep.equal(mockSqlStatement);

      // Restore the stub to avoid side effects
      buildObservationQueryStub.restore();
    });

    it('should return the correct measurements map with all pertinent uuids for the survey', async () => {
      // Mock the connection and config for the test
      const connection = getMockDBConnection(); // Adjust if necessary
      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      // Create an instance of ExportObservationStrategy
      const exportObservationStrategy = new ExportObservationStrategy(config, connection);

      // Stub the SubCountService to return a mocked response
      const mockedResponse = {
        qualitative_measurements: [
          {
            taxon_measurement_id: 'q1',
            itis_tsn: 1,
            measurement_name: 'Qualitative Measurement 1',
            measurement_desc: null,
            options: [
              { qualitative_option_id: 'q1o1', option_label: 'Option 1', option_value: 2, option_desc: null },
              { qualitative_option_id: 'q1o2', option_label: 'Option 2', option_value: 3, option_desc: null }
            ]
          },
          {
            taxon_measurement_id: 'q2',
            itis_tsn: 2,
            measurement_name: 'Qualitative Measurement 2',
            measurement_desc: 'description',
            options: [{ qualitative_option_id: 'q2o1', option_label: 'Option 1', option_value: 4, option_desc: null }]
          }
        ],
        quantitative_measurements: [
          {
            taxon_measurement_id: 'quant1',
            itis_tsn: 4,
            measurement_name: 'Quantitative Measurement 1',
            min_value: 0,
            max_value: null,
            measurement_desc: null,
            unit: null
          }
        ]
      };

      // Stub the SubCountService's getMeasurementTypeDefinitionsForSurvey method to return the mocked response
      const subCountServiceStub = sinon
        .stub(SubCountService.prototype, 'getMeasurementTypeDefinitionsForSurvey')
        .resolves(mockedResponse);

      const result = await exportObservationStrategy._getMeasurementsMap();

      // Expected map structure
      const expectedMap = new Map<string, string>([
        ['q1', 'Qualitative Measurement 1'],
        ['q1o1', 'Option 1'],
        ['q1o2', 'Option 2'],
        ['q2', 'Qualitative Measurement 2'],
        ['q2o1', 'Option 1'],
        ['quant1', 'Quantitative Measurement 1']
      ]);

      // Assert that the result matches the expected map
      expect(result).to.deep.equal(expectedMap);

      // Restore the stub to avoid side effects
      subCountServiceStub.restore();
    });

    it('should transform query result record into CSV correctly with measurements map', () => {
      const item = {
        observation_id: '123',
        subcount_id: 'subcount1',
        tsn: '101',
        species: 'Lion',
        site: 'Site A',
        technique: 'Method 1',
        start_date: '2025-03-25',
        end_date: '2025-03-26',
        sign: 'Positive',
        count: 10,
        observation_date: '2025-03-25',
        observation_time: '12:00:00',
        latitude: 34.0522,
        longitude: -118.2437,
        comment: 'Some comment',
        env_data: [{ ev: 'Environment Data 1' }, { ev: 'Environment Data 2' }],
        meas_data: [{ mv: 'q1' }, { mv: 'quant1' }]
      };

      // Define the measurements map with the ids and their corresponding labels
      const measurementsMap = new Map<string, string>([
        ['q1', 'Qualitative Measurement 1'],
        ['quant1', 'Quantitative Measurement 1']
      ]);

      // Call the observationCsvTransformation method
      const result = ExportObservationStrategy.observationCsvTransformation(item, measurementsMap);

      // The expected CSV string
      const expectedCsv = [
        '123', // observation_id
        'subcount1', // subcount_id
        '101', // tsn
        '"Lion"', // species
        '"Site A"', // site
        '"Method 1"', // technique
        '2025-03-25 - 2025-03-26', // start_date - end_date
        '"Positive"', // sign
        '10', // count
        '2025-03-25', // observation_date
        '12:00:00', // observation_time
        '34.0522', // latitude
        '-118.2437', // longitude
        '"Some comment"', // comment
        'Environment Data 1', // env_data[0].ev
        'Environment Data 2', // env_data[1].ev
        'Qualitative Measurement 1', // meas_data[0].mv -> mapped using measurementsMap
        'Quantitative Measurement 1' // meas_data[1].mv -> mapped using measurementsMap
      ].join(',');

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });

    it('should transform query result record into CSV correctly without measurements map', () => {
      const item = {
        observation_id: '123',
        subcount_id: 'subcount1',
        tsn: '101',
        species: 'Lion',
        site: 'Site A',
        technique: 'Method 1',
        start_date: '2025-03-25',
        end_date: '2025-03-26',
        sign: 'Positive',
        count: 10,
        observation_date: '2025-03-25',
        observation_time: '12:00:00',
        latitude: 34.0522,
        longitude: -118.2437,
        comment: 'Some comment',
        env_data: [{ ev: 'Environment Data 1' }, { ev: 'Environment Data 2' }],
        meas_data: [{ mv: 'q1' }, { mv: 'quant1' }]
      };

      // Call the observationCsvTransformation method without a measurements map
      const result = ExportObservationStrategy.observationCsvTransformation(item);

      // The expected CSV string without measurements map (using ids instead of mapped names)
      const expectedCsv = [
        '123', // observation_id
        'subcount1', // subcount_id
        '101', // tsn
        '"Lion"', // species
        '"Site A"', // site
        '"Method 1"', // technique
        '2025-03-25 - 2025-03-26', // start_date - end_date
        '"Positive"', // sign
        '10', // count
        '2025-03-25', // observation_date
        '12:00:00', // observation_time
        '34.0522', // latitude
        '-118.2437', // longitude
        '"Some comment"', // comment
        'Environment Data 1', // env_data[0].ev
        'Environment Data 2', // env_data[1].ev
        'q1', // meas_data[0].mv -> raw id as no map is provided
        'quant1' // meas_data[1].mv -> raw id as no map is provided
      ].join(',');

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });
  });
});
