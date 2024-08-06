import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { CBMeasurementUnit } from './critterbase-service';
import { StandardsService } from './standards-service';

chai.use(sinonChai);

describe('StandardsService', () => {
  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();
    const standardsService = new StandardsService(mockDBConnection);
    expect(standardsService).to.be.instanceof(StandardsService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getSpeciesStandards', () => {
    it('should get species standards', async () => {
      const mockTsn = 123456;
      const mockDbConnection = getMockDBConnection();

      const standardsService = new StandardsService(mockDbConnection);

      const getTaxonomyByTsnsStub = sinon
        .stub(standardsService.platformService, 'getTaxonomyByTsns')
        .resolves([{ tsn: String(mockTsn), scientificName: 'caribou' }]);

      const getTaxonBodyLocationsStub = sinon
        .stub(standardsService.critterbaseService, 'getTaxonBodyLocations')
        .resolves({ markingBodyLocations: [{ id: '', key: '', value: 'left ear' }] });

      const getTaxonMeasurementsStub = sinon
        .stub(standardsService.critterbaseService, 'getTaxonMeasurements')
        .resolves({
          quantitative: [
            {
              taxon_measurement_id: '',
              itis_tsn: 0,
              measurement_name: 'body mass',
              min_value: 0,
              max_value: 1,
              measurement_desc: '',
              unit: 'kilogram' as CBMeasurementUnit
            }
          ],
          qualitative: [
            {
              taxon_measurement_id: '',
              itis_tsn: 0,
              measurement_name: '',
              measurement_desc: 'description',
              options: []
            }
          ]
        });

      const response = await standardsService.getSpeciesStandards(mockTsn);

      expect(getTaxonomyByTsnsStub).to.be.calledOnceWith([mockTsn]);
      expect(getTaxonBodyLocationsStub).to.be.calledOnceWith(String(mockTsn));
      expect(getTaxonMeasurementsStub).to.be.calledOnceWith(String(mockTsn));

      expect(response.measurements.quantitative[0].measurement_name).to.eql('body mass');
      expect(response.measurements.qualitative[0].measurement_desc).to.eql('description');
    });
  });

  describe('getEnvironmentStandards', async () => {
    const mockData = {
      qualitative: [{ name: 'name', description: 'name', options: [{ name: 'name', description: 'description' }] }],
      quantitative: [
        { name: 'name', description: 'description', unit: 'unit' },
        { name: 'name', description: 'description', unit: 'unit' }
      ]
    };
    const mockDbConnection = getMockDBConnection();

    const standardsService = new StandardsService(mockDbConnection);

    const getEnvironmentStandardsStub = sinon
      .stub(standardsService.standardsRepository, 'getEnvironmentStandards')
      .resolves(mockData);

    const response = await standardsService.getEnvironmentStandards();

    expect(getEnvironmentStandardsStub).to.be.calledOnce;
    expect(response).to.eql(mockData);
  });

  describe('getMethodStandards', async () => {
    const mockData = [
      {
        method_lookup_id: 1,
        name: 'Method 1',
        description: ' Description 1',
        attributes: {
          quantitative: [
            { name: 'Method Standard 1', description: 'Description 1', unit: 'Unit 1' },
            { name: 'Method Standard 2', description: 'Description 2', unit: 'Unit 2' }
          ],
          qualitative: [
            {
              name: 'Qualitative 1',
              description: 'Description 1',
              options: [
                { name: 'Option 1', description: 'Option 1 Description' },
                { name: 'Option 2', description: 'Option 2 Description' }
              ]
            },
            {
              name: 'Qualitative 2',
              description: 'Description 2',
              options: [
                { name: 'Option 3', description: 'Option 3 Description' },
                { name: 'Option 4', description: 'Option 4 Description' }
              ]
            }
          ]
        }
      }
    ];

    const mockDbConnection = getMockDBConnection();

    const standardsService = new StandardsService(mockDbConnection);

    const getMethodStandardsStub = sinon
      .stub(standardsService.standardsRepository, 'getMethodStandards')
      .resolves(mockData);

    const response = await standardsService.getMethodStandards();

    expect(getMethodStandardsStub).to.be.calledOnce;
    expect(response).to.eql(mockData);
  });
});
