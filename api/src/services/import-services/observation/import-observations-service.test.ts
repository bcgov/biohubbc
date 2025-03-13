import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { v4 } from 'uuid';
import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import * as validate from '../../../utils/csv-utils/csv-config-validation';
import { CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import * as taxonRowValidator from '../../../utils/csv-utils/row-validators/taxon-row-validator';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ObservationService } from '../../observation-services/observation-service';
import { IItisSearchResult, PlatformService } from '../../platform-service';
import * as taxonMap from '../utils/taxon';
import { ImportObservationsService } from './import-observations-service';
import * as observationSamplingRowValidator from './utils/observation-sampling-row-validator';

chai.use(sinonChai);

describe('import-observations-service', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('_setObservationStaticHeaderConfigs', () => {
    it('should set the static headers', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      const mockCodeRepository = {
        getObservationSubcountSigns: sinon.stub().resolves([{ id: 'CODE', name: 'NAME' }])
      };

      await service._setObservationStaticHeaderConfigs(mockCodeRepository as any);

      expect(mockCodeRepository.getObservationSubcountSigns).to.have.been.calledOnce;

      expect(service.utils.config.staticHeadersConfig).to.have.keys([
        'SPECIES',
        'COUNT',
        'SUBCOUNT_SIGN',
        'DATE',
        'TIME',
        'LATITUDE',
        'LONGITUDE',
        'SAMPLE_PERIOD',
        'SAMPLE_SITE',
        'METHOD_TECHNIQUE',
        'COMMENT'
      ]);
    });
  });

  describe('importCSVWorksheet', () => {
    it('should return errors early', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      const getCSVConfigStub = sinon.stub(service, 'getCSVConfig').resolves({} as any);
      const validateCSVWorksheetStub = sinon.stub(validate, 'validateCSVWorksheet').returns({
        errors: [
          {
            row: 1,
            header: 'header',
            error: 'error',
            solution: 'solution',
            values: null,
            cell: 'cell'
          }
        ],
        rows: []
      });

      const result = await service.importCSVWorksheet();

      expect(getCSVConfigStub).to.have.been.calledOnce;
      expect(validateCSVWorksheetStub).to.have.been.calledOnce;

      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(1);
    });

    it('should grab the observations from the row', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      const getCSVConfigStub = sinon.stub(service, 'getCSVConfig').resolves({} as any);
      const insertObservationStub = sinon.stub(ObservationService.prototype, 'insertUpdateManualSurveyObservations');
      const getRowSubcountsStub = sinon.stub(service, '_getRowSubcounts').returns([]);
      const validateCSVWorksheetStub = sinon.stub(validate, 'validateCSVWorksheet').returns({
        errors: [],
        rows: [
          {
            LATITUDE: 1,
            LONGITUDE: 2,
            DATE: '2021-01-01',
            TIME: '12:00:00',
            COUNT: 3,
            [CSVRowState]: {
              taxon: {
                itis_tsn: 4,
                itis_scientific_name: 'alces'
              },
              sample_period_id: 5
            }
          }
        ]
      });

      const result = await service.importCSVWorksheet();

      expect(getCSVConfigStub).to.have.been.calledOnce;
      expect(validateCSVWorksheetStub).to.have.been.calledOnce;
      expect(getRowSubcountsStub).to.have.been.calledOnce;

      expect(insertObservationStub).to.have.been.calledOnceWithExactly(1, [
        {
          standardColumns: {
            survey_id: 1,
            itis_tsn: 4,
            itis_scientific_name: 'alces',
            survey_sample_period_id: 5,
            latitude: 1,
            longitude: 2,
            count: 3,
            observation_date: '2021-01-01',
            observation_time: '12:00:00'
          },
          subcounts: []
        }
      ]);

      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(0);
    });
  });

  describe('getCSVConfig', () => {
    it('should return the CSV config', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      const getUniqueCellValues = sinon.stub(service.utils, 'getUniqueCellValues');
      const getConfigStub = sinon.stub(service.utils, 'getConfig');
      const setObservationStaticHeaderConfigsStub = sinon.stub(service, '_setObservationStaticHeaderConfigs');
      const setObservationRowValidatorsStub = sinon.stub(service, '_setObservationRowValidators');
      const setObservationDynamicHeadersConfigStub = sinon.stub(service, '_setObservationDynamicHeadersConfig');
      const getTaxonMapStub = sinon.stub(taxonMap, 'getTaxonMap');

      const taxonMapMock = new CaseInsensitiveMap<string, IItisSearchResult>();

      setObservationStaticHeaderConfigsStub.resolves();
      setObservationRowValidatorsStub.resolves();
      setObservationDynamicHeadersConfigStub.resolves();

      getUniqueCellValues.returns([1, 'alces']);
      getTaxonMapStub.resolves(taxonMapMock);

      getConfigStub.returns({} as any);

      const result = await service.getCSVConfig();

      expect(getUniqueCellValues).to.have.been.calledOnce;
      expect(getTaxonMapStub.getCall(0).args[0]).to.be.deep.equal([1, 'alces']);
      expect(getTaxonMapStub.getCall(0).args[1]).to.be.an.instanceof(PlatformService);

      expect(setObservationStaticHeaderConfigsStub).to.have.been.calledOnce;
      expect(setObservationRowValidatorsStub).to.have.been.calledOnce;
      expect(setObservationDynamicHeadersConfigStub).to.have.been.calledOnce;

      expect(result).to.be.deep.equal({});
    });
  });

  describe('_setObservationRowValidators', () => {
    it('should set the row validators', async () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      const taxonRowValidatorStub = sinon.stub(taxonRowValidator, 'getTaxonRowValidator').returns(() => []);
      const observationSamplingRowValidatorStub = sinon
        .stub(observationSamplingRowValidator, 'getObservationSamplingInformationRowValidator')
        .returns(() => []);
      const taxonMap = new CaseInsensitiveMap<string, IItisSearchResult>();
      const samplePeriodServiceStub: any = {
        getSamplePeriodsForSurvey: sinon.stub().resolves([])
      };
      const sampleSiteServiceStub: any = {
        getSampleSitesForSurveyId: sinon.stub().resolves([])
      };

      const methodTechniqueServiceStub: any = {
        getTechniquesForSurveyId: sinon.stub().resolves([])
      };

      await service._setObservationRowValidators(
        taxonMap,
        samplePeriodServiceStub,
        sampleSiteServiceStub,
        methodTechniqueServiceStub
      );

      expect(samplePeriodServiceStub.getSamplePeriodsForSurvey).to.have.been.calledOnceWithExactly(1);
      expect(taxonRowValidatorStub).to.have.been.calledOnceWithExactly(taxonMap, service.utils, 'SPECIES');
      expect(observationSamplingRowValidatorStub).to.have.been.calledOnce;
      expect(sampleSiteServiceStub.getSampleSitesForSurveyId).to.have.been.calledOnceWithExactly(1);
      expect(methodTechniqueServiceStub.getTechniquesForSurveyId).to.have.been.calledOnceWithExactly(1);

      expect(service.utils.config.rowValidators).to.be.an('array').and.to.have.length(2);
    });
  });

  describe('_getRowSubcounts', () => {
    it('should return an array of subcounts', () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      const row = {};

      const result = service._getRowSubcounts(row);

      expect(result).to.be.an('array').and.to.have.length(1);
    });

    it('should handle qualitative measurements', () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      sinon.stub(service.utils, 'worksheetHeaders').get(() => ['QUALITATIVE_MEASUREMENT']);

      const row = {
        [CSVRowState]: {
          QUALITATIVE_MEASUREMENT: {
            taxon_measurement_id: v4(),
            qualitative_option_id: v4()
          }
        }
      };

      const result = service._getRowSubcounts(row);

      expect(result).to.be.an('array').and.to.have.length(1);
      expect(result[0].qualitative_measurements[0]).to.deep.equal({
        measurement_id: row[CSVRowState].QUALITATIVE_MEASUREMENT.taxon_measurement_id,
        measurement_option_id: row[CSVRowState].QUALITATIVE_MEASUREMENT.qualitative_option_id
      });
    });

    it('should handle quantitative measurements', () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      sinon.stub(service.utils, 'worksheetHeaders').get(() => ['QUANTITATIVE_MEASUREMENT']);

      const row = {
        [CSVRowState]: {
          QUANTITATIVE_MEASUREMENT: {
            taxon_measurement_id: v4(),
            value: 10
          }
        }
      };

      const result = service._getRowSubcounts(row);

      expect(result).to.be.an('array').and.to.have.length(1);
      expect(result[0].quantitative_measurements[0]).to.deep.equal({
        measurement_id: row[CSVRowState].QUANTITATIVE_MEASUREMENT.taxon_measurement_id,
        measurement_value: row[CSVRowState].QUANTITATIVE_MEASUREMENT.value
      });
    });

    it('should handle qualitative environments', () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      sinon.stub(service.utils, 'worksheetHeaders').get(() => ['QUALITATIVE_ENVIRONMENT']);

      const row = {
        [CSVRowState]: {
          QUALITATIVE_ENVIRONMENT: {
            environment_qualitative_id: v4(),
            environment_qualitative_option_id: v4()
          }
        }
      };

      const result = service._getRowSubcounts(row);

      expect(result).to.be.an('array').and.to.have.length(1);
      expect(result[0].qualitative_environments[0]).to.deep.equal({
        environment_qualitative_id: row[CSVRowState].QUALITATIVE_ENVIRONMENT.environment_qualitative_id,
        environment_qualitative_option_id: row[CSVRowState].QUALITATIVE_ENVIRONMENT.environment_qualitative_option_id
      });
    });

    it('should handle quantitative environments', () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      sinon.stub(service.utils, 'worksheetHeaders').get(() => ['QUANTITATIVE_ENVIRONMENT']);

      const row = {
        [CSVRowState]: {
          QUANTITATIVE_ENVIRONMENT: {
            environment_quantitative_id: v4(),
            value: 10
          }
        }
      };

      const result = service._getRowSubcounts(row);

      expect(result).to.be.an('array').and.to.have.length(1);
      expect(result[0].quantitative_environments[0]).to.deep.equal({
        environment_quantitative_id: row[CSVRowState].QUANTITATIVE_ENVIRONMENT.environment_quantitative_id,
        value: row[CSVRowState].QUANTITATIVE_ENVIRONMENT.value
      });
    });

    it('should handle the other row properties', () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      const row = {
        COUNT: 10,
        SUBCOUNT_SIGN: 1,
        COMMENT: 'test'
      };

      const result = service._getRowSubcounts(row);

      expect(result).to.be.an('array').and.to.have.length(1);
      expect(result[0].subcount).to.equal(row.COUNT);
      expect(result[0].observation_subcount_sign_id).to.equal(row.SUBCOUNT_SIGN);
      expect(result[0].comment).to.equal(row.COMMENT);
    });

    it('should handle undefined values -> null', () => {
      const mockConnection = getMockDBConnection();
      const service = new ImportObservationsService(mockConnection, {}, 1);

      const row = {};

      const result = service._getRowSubcounts(row);

      expect(result).to.be.an('array').and.to.have.length(1);
      expect(result[0].subcount).to.equal(null);
      expect(result[0].observation_subcount_sign_id).to.equal(null);
      expect(result[0].comment).to.equal(null);
    });
  });
});
