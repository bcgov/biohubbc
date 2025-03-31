import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Readable } from 'stream';
import { getMockDBConnection } from '../../../__mocks__/db';
import {
  CritterbaseService,
  ICritterDetailed,
  IMortalityLocationsData,
  IMortalityMarkingsData
} from '../../critterbase-service';
import { FindCrittersResponse, SurveyCritterService } from '../../survey-critter-service';
import { ExportDataStreamOptions } from '../export-strategy';
import { defaultLog, ExportAnimalStrategy } from './export-animal-strategy';

chai.use(sinonChai);

describe('ExportObservationStrategy', () => {
  describe('getExportStrategyConfig', () => {
    it('should return the export strategy configuration for the animal data and handle errors', async () => {
      // Set up mock configuration and DB connection
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection();

      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);

      // Mock _getCollectionCategoriesList method
      const collectionCategoriesList = ['category1', 'category2'];
      const getCollectionCategoriesListStub = sinon
        .stub(surveyAnimalStrategy, '_getCollectionCategoriesList')
        .resolves(collectionCategoriesList);

      // Call the method and assert the expected result
      const result = await surveyAnimalStrategy.getExportStrategyConfig();

      expect(result).to.deep.equal({
        streams: [
          {
            stream: surveyAnimalStrategy._getAnimalStream,
            fileName: 'animal.csv',
            csvHeader: 'Animal ID,ITIS TSN,Species,Comment',
            collectionCategories: collectionCategoriesList
          },
          {
            stream: surveyAnimalStrategy._getCapturesStream,
            fileName: 'captures.csv',
            csvHeader: 'Animal ID,Date,Time,Latitude,Longitude'
          },
          {
            stream: surveyAnimalStrategy._getMortalitiesStream,
            fileName: 'mortalities.csv',
            csvHeader: 'Animal ID,Date,Time,Latitude,Longitude'
          },
          {
            stream: surveyAnimalStrategy._getMarkingsStream,
            fileName: 'markings.csv',
            csvHeader: 'Animal ID,Capture ID,Mortality ID,Body position,Primary colour,Secondary colour,Marking type'
          }
        ]
      });

      expect(getCollectionCategoriesListStub.calledOnce).to.be.true;

      sinon.restore();
    });

    it('should return exception for export animal strategy config and log the error', async () => {
      const connection = getMockDBConnection(); // Mocked DB connection
      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      // Create an instance of ExportAnimalStrategy
      const exportAnimalStrategy = new ExportAnimalStrategy(config, connection);

      // Stub the method to throw an error
      const getCollectionCategoriesList = sinon
        .stub(exportAnimalStrategy, '_getCollectionCategoriesList')
        .throws(new Error('Test animal strategy error'));

      // Spy on the logger to ensure the error is logged
      const logErrorSpy = sinon.spy(defaultLog, 'error');

      try {
        await exportAnimalStrategy.getExportStrategyConfig();
        expect.fail('Expected error was not thrown');
      } catch (error) {
        // Check if _getCollectionCategoriesList was called
        expect(getCollectionCategoriesList).to.have.been.calledOnce;

        // Ensure the error is thrown and the message matches
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Test animal strategy error');

        // Check if the error was logged correctly
        expect(logErrorSpy.calledOnce).to.be.true;

        // The structure of the log parameters
        const logArgs = logErrorSpy.getCall(0).args[0];

        // Check for 'label', 'message', and error details in the log args
        expect(logArgs).to.have.property('label', 'getExportStrategyConfig');
        expect(logArgs).to.have.property('message', 'Error generating export strategy config.');
        expect(logArgs.error.message).to.equal('Test animal strategy error');
      } finally {
        // Restore the stub and the spy
        getCollectionCategoriesList.restore();
        logErrorSpy.restore();
      }
    });

    it('should transform stream result record into animal CSV correctly', () => {
      const item = {
        animal_id: 'nickname123',
        itis_tsn: '123456',
        itis_scientific_name: 'Panthera leo',
        critter_comment: 'Lion in the wild',
        collection_units: [{ unit_name: 'Unit 1' }, { unit_name: 'Unit 2' }, { unit_name: 'Unit 3' }]
      };

      // Call the animalCsvTransformation method
      const result = ExportAnimalStrategy.animalCsvTransformation(item);

      // Expected CSV string
      const expectedCsv = [
        'nickname123', // animal_id (Nickname)
        '123456', // itis_tsn
        '"Panthera leo"', // itis_scientific_name (quoted)
        '"Lion in the wild"', // critter_comment (quoted)
        '"Unit 1"', // collection_units[0].unit_name
        '"Unit 2"', // collection_units[1].unit_name
        '"Unit 3"' // collection_units[2].unit_name
      ].join(',');

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });

    it('should transform stream captures result record into captures CSV correctly', () => {
      const item = {
        animal_id: 'nickname123',
        captures: [
          {
            capture_date: '2025-03-25',
            capture_time: '14:30:00',
            capture_location: { latitude: 34.0522, longitude: -118.2437 }
          },
          {
            capture_date: '2025-03-26',
            capture_time: '15:45:00',
            capture_location: { latitude: 35.0522, longitude: -119.2437 }
          }
        ]
      };

      // Call the capturesCsvTransformation method
      const result = ExportAnimalStrategy.capturesCsvTransformation(item);

      // Expected CSV string
      const expectedCsv = [
        'nickname123,2025-03-25,14:30:00,34.0522,-118.2437', // First capture
        'nickname123,2025-03-26,15:45:00,35.0522,-119.2437' // Second capture
      ].join('\r\n');

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });

    it('should return empty string if no captures are provided', () => {
      const item = {
        animal_id: 'nickname123',
        captures: [] // No captures
      };

      // Call the capturesCsvTransformation method
      const result = ExportAnimalStrategy.capturesCsvTransformation(item);

      // Assert that the result is an empty string
      expect(result).to.equal('');
    });

    it('should transform stream mortalities result record into mortalities CSV correctly', () => {
      const item = {
        animal_id: 'nickname123',
        mortality: [
          {
            mortality_id: 'mortality123',
            mortality_timestamp: '2025-03-14T23:59:02.000Z'
          }
        ]
      };

      // Create a mock mortalityLocationsMap to be used in the transformation
      const mortalityLocationsMap = new Map<string, IMortalityLocationsData>([
        ['mortality123', { latitude: 34.0522, longitude: -118.2437 }]
      ]);

      // Call the mortalitiesCsvTransformation method
      const result = ExportAnimalStrategy.mortalitiesCsvTransformation(item, mortalityLocationsMap);

      // Expected CSV string
      const expectedCsv = ['nickname123,2025-03-14,16:59:02 PDT,34.0522,-118.2437'].join('\r\n');

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });

    it('should return empty string if no mortalities are provided', () => {
      const item = {
        animal_id: 'nickname123',
        mortality: [] // No mortalities
      };

      // Call the mortalitiesCsvTransformation method
      const result = ExportAnimalStrategy.mortalitiesCsvTransformation(item);

      // Assert that the result is an empty string
      expect(result).to.equal('');
    });

    it('should transform stream markings result record into markings CSV correctly for captures and mortalities', () => {
      const item = {
        animal_id: 'nickname123',
        captures: [
          {
            capture_id: 'capture123',
            markings: [
              { taxon_marking_body_location: 'left leg', primary_colour: 'red', marking_type: 'tag2' },
              { taxon_marking_body_location: 'right leg', secondary_colour: 'blue', marking_type: 'tag1' }
            ]
          }
        ],
        mortality: [{ mortality_id: 'mortality123' }]
      };

      // Create a mock mortalityMarkingsMap to be used in the transformation
      const mortalityMarkingsMap = new Map<string, IMortalityMarkingsData[]>([
        [
          'mortality123',
          [
            { body_location: 'neck', primary_colour: 'green', secondary_colour: null, marking_type: 'tag1' },
            { body_location: 'tail', primary_colour: null, secondary_colour: 'yellow', marking_type: 'tag2' }
          ]
        ]
      ]);

      // Call the markingsCsvTransformation method
      const result = ExportAnimalStrategy.markingsCsvTransformation(item, mortalityMarkingsMap);

      // Expected CSV string
      const expectedCsv = [
        'nickname123,capture123,,left leg,red,,tag2', // Capture marking 1
        'nickname123,capture123,,right leg,,blue,tag1', // Capture marking 2
        'nickname123,,mortality123,neck,green,,tag1', // Mortality marking 1
        'nickname123,,mortality123,tail,,yellow,tag2' // Mortality marking 2
      ].join('\r\n');

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });

    it('should return empty string if no captures and no mortalities', () => {
      const item = {
        animal_id: 'nickname123',
        captures: [], // No captures
        mortality: [] // No mortalities
      };

      // Call the markingsCsvTransformation method
      const result = ExportAnimalStrategy.markingsCsvTransformation(item);

      // Assert that the result is an empty string
      expect(result).to.equal('');
    });

    it('should return CSV with empty mortality data when no markings are available', () => {
      const item = {
        animal_id: 'nickname123',
        captures: [],
        mortality: [
          { mortality_id: 'mortality123' } // No markings for mortality
        ]
      };

      // Create a mock mortalityMarkingsMap with no markings for the given mortality_id
      const mortalityMarkingsMap = new Map<string, IMortalityMarkingsData[]>([
        ['mortality123', []] // No markings
      ]);

      // Call the markingsCsvTransformation method
      const result = ExportAnimalStrategy.markingsCsvTransformation(item, mortalityMarkingsMap);

      // Expected CSV string for mortality with no markings
      const expectedCsv = 'nickname123,,mortality123,,,,';

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);
    });

    it('should return collection categories list for the survey and handle errors', async () => {
      // Set up mock configuration and DB connection
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection();

      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);

      // Mock SurveyCritterService.findCritters method to resolve with FindCrittersResponse
      const findCrittersResponse: FindCrittersResponse[] = [
        {
          itis_tsn: 1,
          animal_id: '1',
          wlh_id: '1',
          sex: {
            qualitative_option_id: 'A1',
            label: 'M'
          },
          itis_scientific_name: 'Species 1',
          critter_comment: 'Comment 1',
          critter_id: 1,
          survey_id: 1,
          critterbase_critter_id: 'C1'
        },
        {
          itis_tsn: 2,
          animal_id: '2',
          wlh_id: '1',
          sex: {
            qualitative_option_id: 'A2',
            label: 'F'
          },
          itis_scientific_name: 'Species 2',
          critter_comment: 'Comment 2',
          critter_id: 2,
          survey_id: 1,
          critterbase_critter_id: 'C2'
        },
        {
          itis_tsn: 3,
          animal_id: '3',
          wlh_id: '1',
          sex: {
            qualitative_option_id: 'A1',
            label: 'M'
          },
          itis_scientific_name: 'Species 1',
          critter_comment: 'Comment 3',
          critter_id: 3,
          survey_id: 1,
          critterbase_critter_id: 'C3'
        }
      ];

      const findCrittersStub = sinon
        .stub(SurveyCritterService.prototype, 'findCritters')
        .resolves(findCrittersResponse);

      // Mock CritterbaseService.getUniqueCategoryNamesForTsnList method to resolve
      const getUniqueCategoryNamesForTsnListStub = sinon
        .stub(CritterbaseService.prototype, 'getUniqueCategoryNamesForTsnList')
        .resolves(['category1', 'category2']);

      // Call the method and assert the expected result
      const result = await surveyAnimalStrategy._getCollectionCategoriesList();
      expect(result).to.deep.equal(['category1', 'category2']);
      expect(findCrittersStub.calledOnce).to.be.true;
      expect(getUniqueCategoryNamesForTsnListStub.calledOnce).to.be.true;

      // Restore all stubs after the test
      sinon.restore();
    });

    it('should handle error when SurveyCritterService.findCritters fails', async () => {
      // Set up mock configuration and DB connection
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection();

      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);

      // Simulate error for findCritters
      const errorFindCrittersStub = sinon
        .stub(SurveyCritterService.prototype, 'findCritters')
        .rejects(new Error('Critters not found'));

      try {
        await surveyAnimalStrategy._getCollectionCategoriesList();
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Critters not found');
      } finally {
        expect(errorFindCrittersStub.calledOnce).to.be.true;
        sinon.restore();
      }
    });

    it('should handle error when CritterbaseService.getUniqueCategoryNamesForTsnList fails', async () => {
      // Set up mock configuration and DB connection
      const connection = getMockDBConnection();

      const critterbaseService = new CritterbaseService({
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      });

      // Simulate error for getUniqueCategoryNamesForTsnList
      const errorGetCategoryNamesStub = sinon
        .stub(CritterbaseService.prototype, 'getUniqueCategoryNamesForTsnList')
        .rejects(new Error('Category names not found'));

      try {
        await critterbaseService.getUniqueCategoryNamesForTsnList([]);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Category names not found');
      } finally {
        expect(errorGetCategoryNamesStub.calledOnce).to.be.true;
        sinon.restore();
      }
    });

    it('should return mortality locations map for the survey and handle errors', async () => {
      // Set up mock configuration and DB connection
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection();

      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);

      // Simulate mock response for SurveyCritterService.findCritters
      const findCrittersResponse: FindCrittersResponse[] = [
        {
          itis_tsn: 1,
          animal_id: '1',
          wlh_id: '1',
          sex: {
            qualitative_option_id: 'A1',
            label: 'M'
          },
          itis_scientific_name: 'Species 1',
          critter_comment: 'Comment 1',
          critter_id: 1,
          survey_id: 1,
          critterbase_critter_id: 'C1'
        },
        {
          itis_tsn: 2,
          animal_id: '2',
          wlh_id: '1',
          sex: {
            qualitative_option_id: 'A2',
            label: 'F'
          },
          itis_scientific_name: 'Species 2',
          critter_comment: 'Comment 2',
          critter_id: 2,
          survey_id: 1,
          critterbase_critter_id: 'C2'
        }
      ];

      // Mock SurveyCritterService.findCritters method to return mock data
      const findCrittersStub = sinon
        .stub(SurveyCritterService.prototype, 'findCritters')
        .resolves(findCrittersResponse);

      // Simulate mock response for CritterbaseService.getMortalityLocationsByMultipleCritterIds
      const mortalityLocationsMap = new Map<string, IMortalityLocationsData>([
        ['mortality123', { latitude: 34.0522, longitude: -118.2437 }]
      ]);

      // Mock CritterbaseService.getMortalityLocationsByMultipleCritterIds method to return mock data
      const getMortalityLocationsStub = sinon
        .stub(CritterbaseService.prototype, 'getMortalityLocationsByMultipleCritterIds')
        .resolves(mortalityLocationsMap);

      // Call the method and assert the expected result
      const result = await surveyAnimalStrategy._getMortalitiesLocationMap();
      expect(result).to.deep.equal(mortalityLocationsMap);
      expect(findCrittersStub.calledOnce).to.be.true;
      expect(getMortalityLocationsStub.calledOnce).to.be.true;
      sinon.restore();
    });

    it('should handle error when CritterbaseService.getMortalityLocationsByMultipleCritterIds fails', async () => {
      // Set up mock configuration and DB connection
      const connection = getMockDBConnection();

      const critterbaseService = new CritterbaseService({
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      });

      // Simulate error for getMortalityLocationsByMultipleCritterIds
      const errorGetMortalityLocationsByMultipleCritterIdsStub = sinon
        .stub(CritterbaseService.prototype, 'getMortalityLocationsByMultipleCritterIds')
        .rejects(new Error('Mortality by multiple location Ids not found'));

      try {
        await critterbaseService.getMortalityLocationsByMultipleCritterIds([]);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Mortality by multiple location Ids not found');
      } finally {
        expect(errorGetMortalityLocationsByMultipleCritterIdsStub.calledOnce).to.be.true;
        sinon.restore();
      }
    });

    it('should handle error when CritterbaseService.getMortalityMarkingsByMultipleCritterIds fails', async () => {
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection();

      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);
      // Simulate mock response for SurveyCritterService.findCritters
      const findCrittersResponse: FindCrittersResponse[] = [
        {
          itis_tsn: 1,
          animal_id: '1',
          wlh_id: '1',
          sex: {
            qualitative_option_id: 'A1',
            label: 'M'
          },
          itis_scientific_name: 'Species 1',
          critter_comment: 'Comment 1',
          critter_id: 1,
          survey_id: 1,
          critterbase_critter_id: 'C1'
        },
        {
          itis_tsn: 2,
          animal_id: '2',
          wlh_id: '1',
          sex: {
            qualitative_option_id: 'A2',
            label: 'F'
          },
          itis_scientific_name: 'Species 2',
          critter_comment: 'Comment 2',
          critter_id: 2,
          survey_id: 1,
          critterbase_critter_id: 'C2'
        }
      ];

      // Stub the methods
      const findCrittersStub = sinon
        .stub(SurveyCritterService.prototype, 'findCritters')
        .resolves(findCrittersResponse);

      const getMortalityMarkingsByMultipleCritterIdsStub = sinon
        .stub(CritterbaseService.prototype, 'getMortalityMarkingsByMultipleCritterIds')
        .rejects(new Error('Mortality markings by multiple Ids not found'));

      try {
        await surveyAnimalStrategy._getMortalityMarkingsMap();
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Mortality markings by multiple Ids not found');
      } finally {
        expect(findCrittersStub.calledOnce).to.be.true;
        expect(getMortalityMarkingsByMultipleCritterIdsStub.calledOnce).to.be.true;
        sinon.restore();
      }
    });

    it('should return a readable stream for the animal data and handle errors', async function () {
      this.timeout(5000); // Increase timeout to 5 seconds

      // Set up mock configuration and DB connection
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection();

      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);

      // Mock data to match ICritterDetailed and ICaptureDetailed, with IMortality as a single object
      const mockCritterData: ICritterDetailed[] = [
        {
          animal_id: '1',
          critter_id: '1',
          itis_tsn: 1,
          wlh_id: '1',
          sex: { qualitative_option_id: 'A1', label: 'M' },
          itis_scientific_name: 'Species 1',
          critter_comment: 'Comment 1',
          captures: [
            {
              capture_id: 'capture_1',
              critter_id: '1',
              capture_date: '2025-03-27',
              capture_time: '12:00',
              capture_location: { latitude: 45.0, longitude: -75.0 },
              release_location: { latitude: 46.0, longitude: -76.0 },
              markings: [
                {
                  marking_id: 'marking_1',
                  critter_id: '1',
                  capture_id: 'capture_1',
                  mortality_id: 'mortality_1',
                  taxon_marking_body_location_id: 'location_1',
                  marking_type_id: 'type_1',
                  marking_material_id: 'material_1',
                  primary_colour_id: 'color_1',
                  secondary_colour_id: 'color_2',
                  text_colour_id: 'text_color_1',
                  identifier: 'marking_1',
                  frequency: 1,
                  frequency_unit: 'per day',
                  order: 1,
                  comment: 'Marking comment',
                  attached_timestamp: '2025-03-27T14:00:00Z',
                  removed_timestamp: '2025-03-28T14:00:00Z',
                  body_location: 'Left Arm',
                  marking_type: 'Stripe',
                  primary_colour: 'Red',
                  secondary_colour: 'Blue'
                }
              ],
              quantitative_measurements: [],
              qualitative_measurements: []
            }
          ],
          mortality: {
            critter_id: '1',
            location_id: 'location_1',
            mortality_timestamp: '2025-03-27T14:00:00Z',
            proximate_cause_of_death_id: 'cause_1',
            proximate_cause_of_death_confidence: 'High',
            proximate_predated_by_itis_tsn: '2',
            ultimate_cause_of_death_id: 'cause_2',
            ultimate_cause_of_death_confidence: 'Medium',
            ultimate_predated_by_itis_tsn: '3',
            mortality_comment: 'Death due to illness',
            mortality_location: { latitude: 45.5, longitude: -75.5 }
          }
        }
      ];

      // Mock SurveyCritterService.findCrittersDetails method to resolve with the mock data
      const findCrittersDetailsStub = sinon
        .stub(SurveyCritterService.prototype, 'findCrittersDetails')
        .resolves(mockCritterData);

      // Create a mock stream
      const animalStream = surveyAnimalStrategy._getAnimalStream({} as ExportDataStreamOptions);

      // A helper function to wrap the event-based stream handling into a promise
      const collectStreamData = (stream: Readable): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          const collectedData: string[] = [];

          stream.on('data', (data: any) => {
            collectedData.push(data);
          });

          stream.on('end', () => {
            resolve(collectedData);
          });

          stream.on('error', (error: any) => {
            reject(error);
          });
        });
      };

      // Wait for the stream to collect the data and assert the results
      const collectedData = await collectStreamData(animalStream);

      // Assert the collected data matches the expected output
      expect(collectedData).to.deep.equal(['1,1,"Species 1","Comment 1"']);

      // Ensure the mock method was called
      expect(findCrittersDetailsStub.calledOnce).to.be.true;

      // Simulate error in findCrittersDetails and test error handling
      sinon.restore();
      const errorFindCrittersDetailsStub = sinon
        .stub(SurveyCritterService.prototype, 'findCrittersDetails')
        .rejects(new Error('Failed to fetch critters'));

      try {
        const errorStream = surveyAnimalStrategy._getAnimalStream({} as ExportDataStreamOptions);
        await collectStreamData(errorStream);
      } catch (error) {
        // Expect the error to be thrown and handle it
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Failed to fetch critters');
      } finally {
        expect(errorFindCrittersDetailsStub.calledOnce).to.be.true;
        sinon.restore();
      }
    });

    it('should return a readable stream for captures data and handle errors', async function () {
      this.timeout(5000); // Increase timeout to 5 seconds

      // Set up mock configuration and DB connection
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection();

      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);

      // Mock data to match ICaptureExport and expected format in capturesCsvTransformation
      const mockCritterData: ICritterDetailed[] = [
        {
          animal_id: '1',
          critter_id: '1',
          itis_tsn: 1,
          wlh_id: '1',
          sex: { qualitative_option_id: 'A1', label: 'M' },
          itis_scientific_name: 'Species 1',
          critter_comment: 'Comment 1',
          captures: [
            {
              capture_id: 'capture_1',
              critter_id: '1',
              capture_date: '2025-03-27',
              capture_time: '12:00',
              capture_location: { latitude: 45.0, longitude: -75.0 },
              release_location: { latitude: 46.0, longitude: -76.0 },
              markings: [
                {
                  marking_id: 'marking_1',
                  critter_id: '1',
                  capture_id: 'capture_1',
                  mortality_id: 'mortality_1',
                  taxon_marking_body_location_id: 'location_1',
                  marking_type_id: 'type_1',
                  marking_material_id: 'material_1',
                  primary_colour_id: 'color_1',
                  secondary_colour_id: 'color_2',
                  text_colour_id: 'text_color_1',
                  identifier: 'marking_1',
                  frequency: 1,
                  frequency_unit: 'per day',
                  order: 1,
                  comment: 'Marking comment',
                  attached_timestamp: '2025-03-27T14:00:00Z',
                  removed_timestamp: '2025-03-28T14:00:00Z',
                  body_location: 'Left Arm',
                  marking_type: 'Stripe',
                  primary_colour: 'Red',
                  secondary_colour: 'Blue'
                }
              ],
              quantitative_measurements: [],
              qualitative_measurements: []
            }
          ],
          mortality: {
            critter_id: '1',
            location_id: 'location_1',
            mortality_timestamp: '2025-03-27T14:00:00Z',
            proximate_cause_of_death_id: 'cause_1',
            proximate_cause_of_death_confidence: 'High',
            proximate_predated_by_itis_tsn: '2',
            ultimate_cause_of_death_id: 'cause_2',
            ultimate_cause_of_death_confidence: 'Medium',
            ultimate_predated_by_itis_tsn: '3',
            mortality_comment: 'Death due to illness',
            mortality_location: { latitude: 45.5, longitude: -75.5 }
          }
        }
      ];

      // Mock SurveyCritterService.findCrittersDetails method to resolve with the mock data
      const findCrittersDetailsStub = sinon
        .stub(SurveyCritterService.prototype, 'findCrittersDetails')
        .resolves(mockCritterData);

      // Create a mock stream
      const capturesStream = surveyAnimalStrategy._getCapturesStream({} as ExportDataStreamOptions);

      // A helper function to wrap the event-based stream handling into a promise
      const collectStreamData = (stream: Readable): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          const collectedData: string[] = [];

          stream.on('data', (data: any) => {
            collectedData.push(data);
          });

          stream.on('end', () => {
            resolve(collectedData);
          });

          stream.on('error', (error: any) => {
            reject(error);
          });
        });
      };

      // Wait for the stream to collect the data and assert the results
      const collectedData = await collectStreamData(capturesStream);

      // Assert the collected data matches the expected output
      expect(collectedData).to.deep.equal(['1,2025-03-27,12:00,45,-75']);

      // Ensure the mock method was called
      expect(findCrittersDetailsStub.calledOnce).to.be.true;

      // Simulate error in findCrittersDetails and test error handling
      sinon.restore();
      const errorFindCrittersDetailsStub = sinon
        .stub(SurveyCritterService.prototype, 'findCrittersDetails')
        .rejects(new Error('Failed to fetch critters'));

      try {
        const errorStream = surveyAnimalStrategy._getCapturesStream({} as ExportDataStreamOptions);
        await collectStreamData(errorStream);
      } catch (error) {
        // Expect the error to be thrown and handle it
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Failed to fetch critters');
      } finally {
        expect(errorFindCrittersDetailsStub.calledOnce).to.be.true;
        sinon.restore();
      }
    });

    it('should return a readable stream for mortalities data', async function () {
      this.timeout(5000); // Increase timeout to 5 seconds

      // Set up mock configuration and DB connection
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection();

      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);

      // Mock data to match ICritterDetailed and IMortality, with mortality location map
      const mockCritterData: any[] = [
        {
          animal_id: '1',
          critter_id: '1',
          mortality: [
            {
              mortality_id: 'mortality_1',
              mortality_timestamp: '2025-03-27T14:00:00Z',
              mortality_comment: 'Death due to illness',
              mortality_location: { latitude: 45.5, longitude: -75.5 }
            }
          ]
        }
      ];

      const mockMortalityLocationsMap: Map<string, IMortalityLocationsData> = new Map();
      mockMortalityLocationsMap.set('mortality_1', {
        latitude: 45.5,
        longitude: -75.5
      });

      // Mock _getMortalitiesLocationMap to return the mock data
      const getMortalitiesLocationMapStub = sinon
        .stub(surveyAnimalStrategy, '_getMortalitiesLocationMap')
        .resolves(mockMortalityLocationsMap);

      // Mock SurveyCritterService.findCrittersDetails method to resolve with the mock data
      const findCrittersDetailsStub = sinon
        .stub(SurveyCritterService.prototype, 'findCrittersDetails')
        .resolves(mockCritterData);

      // Create a mock stream
      const mortalitiesStream = surveyAnimalStrategy._getMortalitiesStream({} as ExportDataStreamOptions);

      // A helper function to wrap the event-based stream handling into a promise
      const collectStreamData = (stream: Readable): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          const collectedData: string[] = [];

          stream.on('data', (data: any) => {
            collectedData.push(data);
          });

          stream.on('end', () => {
            resolve(collectedData);
          });

          stream.on('error', (error: any) => {
            reject(error);
          });
        });
      };

      // Wait for the stream to collect the data and assert the results
      const collectedData = await collectStreamData(mortalitiesStream);

      // Assert the collected data matches the expected output
      expect(collectedData).to.deep.equal([
        '1,2025-03-27,07:00:00 PDT,45.5,-75.5' // Assuming the mortalitiesCsvTransformation works as expected
      ]);

      // Ensure the mock methods were called
      expect(getMortalitiesLocationMapStub.calledOnce).to.be.true;
      expect(findCrittersDetailsStub.calledOnce).to.be.true;

      sinon.restore(); // Restore all stubs after the test is complete
    });

    it('should handle errors in the mortalities stream gracefully', async function () {
      this.timeout(5000); // Increase timeout to 10 seconds

      // Set up mock configuration and DB connection
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection(); // Assuming this is how you get the mock connection

      // Create the ExportAnimalStrategy instance
      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);

      // Mock _getMortalitiesLocationMap to return a mock mortality location map
      const mockMortalityLocationsMap: Map<string, any> = new Map();
      mockMortalityLocationsMap.set('mortality_1', { latitude: 45.5, longitude: -75.5 });
      const getMortalitiesLocationMapStub = sinon
        .stub(surveyAnimalStrategy, '_getMortalitiesLocationMap')
        .resolves(mockMortalityLocationsMap);

      // Simulate error in findCrittersDetails and test error handling
      const errorFindCrittersDetailsStub = sinon
        .stub(SurveyCritterService.prototype, 'findCrittersDetails')
        .rejects(new Error('Failed to fetch critters details')); // Simulate an error

      // A helper function to collect stream data and handle errors
      const collectStreamData = (stream: Readable): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          const collectedData: string[] = [];

          stream.on('data', (data: any) => {
            collectedData.push(data); // Collect data from the stream
          });

          stream.on('end', () => {
            resolve(collectedData); // Resolve when the stream ends
          });

          stream.on('error', (error: any) => {
            reject(error); // Reject when an error is emitted
          });
        });
      };

      // Create a new stream that will fail due to the simulated error
      const errorStream = surveyAnimalStrategy._getMortalitiesStream({} as ExportDataStreamOptions);

      let streamError: any;

      // Collect the stream data and expect an error
      try {
        await collectStreamData(errorStream); // This will reject due to the simulated error
      } catch (error) {
        streamError = error; // Capture the error
      }

      // Assert that the error is the one we expect
      expect(streamError).to.exist;
      expect((streamError as Error).message).to.equal('Failed to fetch critters details'); // Check if the error is correct

      // Ensure that the mock methods were called
      expect(getMortalitiesLocationMapStub.calledOnce).to.be.true;
      expect(errorFindCrittersDetailsStub.calledOnce).to.be.true;

      // Clean up stubs
      sinon.restore();
    });

    it('should handle errors in the markings stream gracefully', async function () {
      this.timeout(5000); // Increase timeout to 10 seconds

      // Set up mock configuration and DB connection
      const mockConfig = { surveyId: 1, isUserAdmin: true };
      const mockConnection = getMockDBConnection(); // Assuming this is how you get the mock connection

      // Create the ExportAnimalStrategy instance
      const surveyAnimalStrategy = new ExportAnimalStrategy(mockConfig, mockConnection);

      // Mock _getMortalityMarkingsMap to return a mock mortality markings map
      const mockMortalityMarkingsMap: Map<string, any> = new Map();
      mockMortalityMarkingsMap.set('marking_1', { latitude: 45.5, longitude: -75.5 });
      const getMortalityMarkingsMapStub = sinon
        .stub(surveyAnimalStrategy, '_getMortalityMarkingsMap')
        .resolves(mockMortalityMarkingsMap);

      // Simulate error in findCrittersDetails and test error handling
      const errorFindCrittersDetailsStub = sinon
        .stub(SurveyCritterService.prototype, 'findCrittersDetails')
        .rejects(new Error('Failed to fetch critters details')); // Simulate an error

      // A helper function to collect stream data and handle errors
      const collectStreamData = (stream: Readable): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          const collectedData: string[] = [];

          stream.on('data', (data: any) => {
            collectedData.push(data); // Collect data from the stream
          });

          stream.on('end', () => {
            resolve(collectedData); // Resolve when the stream ends
          });

          stream.on('error', (error: any) => {
            reject(error); // Reject when an error is emitted
          });
        });
      };

      // Create a new stream that will fail due to the simulated error
      const errorStream = surveyAnimalStrategy._getMarkingsStream({} as ExportDataStreamOptions);

      let streamError: any;

      // Collect the stream data and expect an error
      try {
        await collectStreamData(errorStream); // This will reject due to the simulated error
      } catch (error) {
        streamError = error; // Capture the error
      }

      // Assert that the error is the one we expect
      expect(streamError).to.exist;
      expect((streamError as Error).message).to.equal('Failed to fetch critters details'); // Check if the error is correct

      // Ensure that the mock methods were called
      expect(getMortalityMarkingsMapStub.calledOnce).to.be.true;
      expect(errorFindCrittersDetailsStub.calledOnce).to.be.true;

      // Clean up stubs
      sinon.restore();
    });
  });
});
