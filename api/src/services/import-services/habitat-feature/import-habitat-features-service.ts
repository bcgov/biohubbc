import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CodeRepository } from '../../../repositories/code-repository';
import { InsertSurveyHabitatFeature } from '../../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getArrayCellValidator,
  getDateCellValidator,
  getDateRangeCellValidator,
  getLatitudeCellValidator,
  getLongitudeCellValidator,
  getNonEmptyStringCellValidator,
  getPositiveNumberCellValidator,
  getTaxonCellValidator,
  getTimeCellSetter,
  getTimeCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { SurveyHabitatFeatureService } from '../../habitat-feature-services/survey-habitat-feature-service';
import { PlatformService } from '../../platform-service';
import { SamplePeriodService } from '../../sample-period-service';
import { SampleSiteService } from '../../sample-site-service';
import { TechniqueService } from '../../technique-service';
import { getSamplePeriodIdFromRowState } from '../utils/row-state';
import { getTaxonMap, TaxonMap } from '../utils/taxon';
import { getHabitatFeatureTypeCellValidator } from './utils/habitat-feature-header-configs';
import { getHabitatFeatureSamplingInformationRowValidator } from './utils/habitat-feature-sampling-row-validator';

const defaultLog = getLogger('services/import-services/import-habitat-features-service');

export type HabitatFeatureCSVStaticHeader =
  | 'HABITAT_FEATURE_TYPE'
  | 'COUNT'
  | 'LATITUDE'
  | 'LONGITUDE'
  | 'OBSERVED_DATE'
  | 'OBSERVED_TIME'
  | 'SAMPLE_PERIOD'
  | 'SAMPLE_SITE'
  | 'METHOD_TECHNIQUE'
  | 'SPECIES';

/**
 * ImportHabitatFeaturesService - A service for importing Habitat Features from a CSV into SIMS.
 *
 * @class ImportHabitatFeaturesService
 * @extends DBService
 */
export class ImportHabitatFeaturesService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;
  samplePeriodId?: number;

  utils: CSVConfigUtils<HabitatFeatureCSVStaticHeader>;

  /**
   * Construct an instance of ImportHabitatFeaturesService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number, samplePeriodId?: number) {
    super(connection);

    const initialConfig: CSVConfig<HabitatFeatureCSVStaticHeader> = {
      staticHeadersConfig: {
        HABITAT_FEATURE_TYPE: {
          aliases: ['HABITAT FEATURE TYPE', 'FEATURE_TYPE', 'FEATURE TYPE', 'TYPE']
        },
        COUNT: { aliases: [] },
        LATITUDE: { aliases: ['LAT'], optional: true },
        LONGITUDE: { aliases: ['LON', 'LONG', 'LNG'], optional: true },
        OBSERVED_DATE: { aliases: ['OBSERVED DATE', 'DATE'], optional: true },
        OBSERVED_TIME: { aliases: ['OBSERVED TIME', 'TIME'], optional: true },
        SAMPLE_PERIOD: {
          aliases: ['SAMPLE PERIOD', 'SAMPLING PERIOD', 'SAMPLING_PERIOD', 'PERIOD', 'TIME PERIOD', 'SESSION'],
          optional: true
        },
        SAMPLE_SITE: {
          aliases: ['SAMPLE SITE', 'SAMPLING_SITE', 'SAMPLING SITE', 'SITE', 'LOCATION', 'STATION'],
          optional: true
        },
        METHOD_TECHNIQUE: { aliases: ['METHOD TECHNIQUE', 'METHOD', 'TECHNIQUE'], optional: true },
        SPECIES: { aliases: ['ITIS_TSN', 'ITIS TSN', 'TSN', 'TAXON'], optional: true }
      },
      ignoreDynamicHeaders: false
    };

    this.worksheet = worksheet;
    this.surveyId = surveyId;
    this.samplePeriodId = samplePeriodId;

    this.utils = new CSVConfigUtils(worksheet, initialConfig);
  }

  /**
   * Import a Habitat Feature CSV worksheet into SIMS.
   *
   * @async
   * @throws {ApiGeneralError} - If unable to fully insert records into Critterbase
   * @returns {*} {Promise<CSVError[]>} List of CSV errors encountered during import
   */
  async importCSVWorksheet(): Promise<CSVError[]> {
    const config = await this.getCSVConfig();

    const { errors, rows } = validateCSVWorksheet(this.worksheet, config);

    if (errors.length) {
      return errors;
    }

    const surveyHabitatFeatures: InsertSurveyHabitatFeature[] = [];

    for (const row of rows) {
      surveyHabitatFeatures.push({
        habitat_feature_type_id: row.HABITAT_FEATURE_TYPE,
        count: row.COUNT,
        latitude: row.LATITUDE,
        longitude: row.LONGITUDE,
        observed_date: row.OBSERVED_DATE,
        observed_time: row.OBSERVED_TIME,
        survey_sample_period_id: this.samplePeriodId ?? getSamplePeriodIdFromRowState(row).sample_period_id ?? null,
        // TODO: Populate taxons from CSV
        survey_habitat_feature_taxons: []
        // TODO: Add quantitative/qualitative values
      });
    }

    defaultLog.debug({ label: 'importCSVWorksheet', surveyHabitatFeatures });

    const surveyHabitatFeatureService = new SurveyHabitatFeatureService(this.connection);

    await surveyHabitatFeatureService.insertSurveyHabitatFeatures(this.surveyId, surveyHabitatFeatures);

    return [];
  }

  /**
   * Get the CSV configuration for habitat features.
   *
   * @returns {Promise<CSVConfig<HabitatFeatureCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<HabitatFeatureCSVStaticHeader>> {
    // Initialize the required services
    const platformService = new PlatformService(this.connection);
    const codeRepository = new CodeRepository(this.connection);
    const samplePeriodService = new SamplePeriodService(this.connection);
    const sampleSiteService = new SampleSiteService(this.connection);
    const methodTechniqueSerice = new TechniqueService(this.connection);

    // Generate shared dependencies
    const taxonIdentifiers = this.utils.getUniqueArrayCellValues('SPECIES').filter(Boolean) as string[];
    const taxonMap = await getTaxonMap(taxonIdentifiers, platformService);

    // Inject the dependencies and set the static headers, row validators, and dynamic headers
    await Promise.all([
      this._setHabitatFeatureStaticHeaderConfigs(taxonMap, codeRepository),
      this._setHabitatFeatureRowValidators(samplePeriodService, sampleSiteService, methodTechniqueSerice)
    ]);

    // Return the final CSV config
    return this.utils.getConfig();
  }

  /**
   * Set the static headers for the Habitat Feature CSV.
   *
   * @param {TaxonMap} taxonMap - The taxon map
   * @param {CodeRepository} codeRepository - The code repository
   * @returns {*} {Promise<void>}
   */
  async _setHabitatFeatureStaticHeaderConfigs(taxonMap: TaxonMap, codeRepository: CodeRepository) {
    const habitatFeatureTypes = await codeRepository.getHabitatFeatureTypes();

    this.utils.setAllStaticHeaderConfigs({
      HABITAT_FEATURE_TYPE: { validateCell: getHabitatFeatureTypeCellValidator(habitatFeatureTypes) },
      COUNT: { validateCell: getPositiveNumberCellValidator() },
      LATITUDE: { validateCell: getLatitudeCellValidator() },
      LONGITUDE: { validateCell: getLongitudeCellValidator() },
      OBSERVED_DATE: { validateCell: getDateCellValidator() },
      OBSERVED_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      // Sampling period is pre-validated by the sampling information row validator
      SAMPLE_PERIOD: { validateCell: getDateRangeCellValidator({ optional: true }) },
      // Sampling site is pre-validated by the sampling information row validator
      SAMPLE_SITE: { validateCell: getNonEmptyStringCellValidator({ optional: true }) },
      // Method technique is pre-validated by the sampling information row validator
      METHOD_TECHNIQUE: { validateCell: getNonEmptyStringCellValidator({ optional: true }) },
      SPECIES: {
        validateCell: getArrayCellValidator(
          { validator: getTaxonCellValidator(taxonMap), options: { optional: true } },
          { delimiter: ';' }
        )
      }
    });
  }

  /**
   * Sets the taxon row validator for the Habitat Feature CSV.
   *
   * Note: Row validators run before static and dynamic header validators.
   *
   * @param {SamplePeriodService} samplePeriodService - The sample period service
   * @param {SampleSiteService} sampleSiteService - The sample site service
   * @param {TechniqueService} methodTechniqueService - The method technique service
   * @returns {*} {Promise<void>}
   */
  async _setHabitatFeatureRowValidators(
    samplePeriodService: SamplePeriodService,
    sampleSiteService: SampleSiteService,
    methodTechniqueService: TechniqueService
  ) {
    // Generate the sample periods, sites, and method techniques
    const samplePeriods = await samplePeriodService.getSamplePeriodsForSurvey(this.surveyId);
    const sampleSites = await sampleSiteService.getSampleSitesForSurveyId(this.surveyId);
    const methodTechniques = await methodTechniqueService.getTechniquesForSurveyId(this.surveyId);

    // Inject the row validators - handles taxon, sampling information and location validation
    this.utils.config.rowValidators = [
      getHabitatFeatureSamplingInformationRowValidator({
        samplePeriods: samplePeriods,
        sampleSites: sampleSites,
        methodTechniques: methodTechniques,
        utils: this.utils,
        samplePeriodId: this.samplePeriodId
      })
    ];
  }
}
