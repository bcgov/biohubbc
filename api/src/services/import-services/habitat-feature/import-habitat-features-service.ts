import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CodeRepository } from '../../../repositories/code-repository';
import { InsertSurveyHabitatFeature } from '../../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getLatitudeCellValidator,
  getLongitudeCellValidator,
  getPositiveNumberCellValidator,
  getTimeCellSetter,
  getTimeCellValidator,
  validateZodCell
} from '../../../utils/csv-utils/csv-header-configs';
import { getTaxonRowValidator } from '../../../utils/csv-utils/row-validators/taxon-row-validator';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { SurveyHabitatFeatureService } from '../../habitat-feature-services/survey-habitat-feature-service';
import { PlatformService } from '../../platform-service';
import { getTaxonMap, TaxonMap } from '../utils/taxon';
import { getHabitatFeatureTypeCellValidator } from './utils/habitat-feature-header-configs';

const defaultLog = getLogger('services/import-services/import-habitat-features-service');

export type HabitatFeatureCSVStaticHeader =
  | 'HABITAT_FEATURE_TYPE'
  | 'COUNT'
  | 'LATITUDE'
  | 'LONGITUDE'
  | 'OBSERVED_DATE'
  | 'OBSERVED_TIME'
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
        HABITAT_FEATURE_TYPE: { aliases: ['HABITAT_FEATURE_TYPE', 'TYPE'] },
        COUNT: { aliases: [] },
        LATITUDE: { aliases: ['LAT'] },
        LONGITUDE: { aliases: ['LON', 'LONG', 'LNG'] },
        OBSERVED_DATE: { aliases: [] },
        OBSERVED_TIME: { aliases: [] },
        SPECIES: { aliases: ['ITIS_TSN', 'ITIS TSN', 'TSN', 'TAXON'] }
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
        survey_habitat_feature_taxons: []
        // TODO: Add taxon
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

    // Generate shared dependencies
    const taxonIdentifiers = this.utils.getUniqueCellValues('SPECIES').filter(Boolean) as string[];
    const taxonMap = await getTaxonMap(taxonIdentifiers, platformService);

    // Inject the dependencies and set the static headers, row validators, and dynamic headers
    await Promise.all([
      this._setHabitatFeatureStaticHeaderConfigs(codeRepository),
      this._setHabitatFeatureRowValidators(taxonMap)
    ]);

    // Return the final CSV config
    return this.utils.getConfig();
  }

  /**
   * Set the static headers for the Habitat Feature CSV.
   *
   * @param {CodeRepository} codeRepository - The code repository
   * @returns {*} {Promise<void>}
   */
  async _setHabitatFeatureStaticHeaderConfigs(codeRepository: CodeRepository) {
    const habitatFeatureTypes = await codeRepository.getHabitatFeatureTypes();

    this.utils.setAllStaticHeaderConfigs({
      HABITAT_FEATURE_TYPE: { validateCell: getHabitatFeatureTypeCellValidator(habitatFeatureTypes) },
      COUNT: { validateCell: getPositiveNumberCellValidator() },
      LATITUDE: { validateCell: getLatitudeCellValidator({ optional: true }) },
      LONGITUDE: { validateCell: getLongitudeCellValidator({ optional: true }) },
      OBSERVED_DATE: { validateCell: getDateCellValidator({ optional: true }) },
      OBSERVED_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      // Species is pre-validated by the taxon row validator
      SPECIES: { validateCell: (params) => validateZodCell(params.cell, z.string().or(z.number())) }
    });
  }

  /**
   * Sets the taxon row validator for the Habitat Feature CSV.
   *
   * Note: Row validators run before static and dynamic header validators.
   *
   * @param {TaxonMap} taxonMap - The taxon map
   * @returns {*} {Promise<void>}
   */
  async _setHabitatFeatureRowValidators(taxonMap: TaxonMap) {
    // Inject the row validators - handles taxon, sampling information and location validation
    this.utils.config.rowValidators = [getTaxonRowValidator(taxonMap, this.utils, 'SPECIES')];
  }
}
