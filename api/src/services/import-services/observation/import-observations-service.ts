import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CodeRepository } from '../../../repositories/code-repository';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError, CSVRow, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getDateRangeCellValidator,
  getDescriptionCellValidator,
  getLatitudeCellValidator,
  getLongitudeCellValidator,
  getNonEmptyStringCellValidator,
  getPositiveNumberCellValidator,
  getTimeCellSetter,
  getTimeCellValidator,
  validateZodCell
} from '../../../utils/csv-utils/csv-header-configs';
import { getTaxonRowValidator } from '../../../utils/csv-utils/row-validators/taxon-row-validator';
import { getLogger } from '../../../utils/logger';
import { CritterbaseService, getCritterbaseUserFromConnection } from '../../critterbase-service';
import { DBService } from '../../db-service';
import {
  InsertSubCount,
  InsertUpdateObservations,
  ObservationService
} from '../../observation-services/observation-service';
import { ObservationSubCountEnvironmentService } from '../../observation-subcount-environment-service';
import { PlatformService } from '../../platform-service';
import { SamplePeriodService } from '../../sample-period-service';
import {
  getEnvironmentNameTypeDefinitionMap,
  isQualitativeEnvironmentStub,
  isQuantitativeEnvironmentStub
} from '../utils/environment';
import {
  getTsnMeasurementDictionary,
  isCBQualitativeMeasurementStub,
  isCBQuantitativeMeasurementStub
} from '../utils/measurement';
import {
  getQualitativeEnvironmentFromRowState,
  getQualitativeMeasurementFromRowState,
  getQuantitativeEnvironmentFromRowState,
  getQuantitativeMeasurementFromRowState,
  getSamplePeriodIdFromRowState,
  getTaxonFromRowState
} from '../utils/row-state';
import { getTaxonMap, getTsnsFromTaxonMap, TaxonMap } from '../utils/taxon';
import { getObservationDynamicHeaderCellValidator } from './utils/observation-dynamic-header-config';
import { getObservationSubcountSignCellValidator } from './utils/observation-header-configs';
import { getObservationSamplingInformationRowValidator } from './utils/observation-sampling-row-validator';

const defaultLog = getLogger('services/import/import-observations-service');

const SUBCOUNT_SIGN_ALIASES: Uppercase<string>[] = ['OBSERVATION_SUBCOUNT_SIGN', 'OBSERVATION SUBCOUNT SIGN', 'SIGN'];

export type ObservationCSVStaticHeader =
  | 'SPECIES'
  | 'COUNT'
  | 'SUBCOUNT_SIGN'
  | 'DATE'
  | 'TIME'
  | 'LATITUDE'
  | 'LONGITUDE'
  | 'SAMPLING_SITE'
  | 'SAMPLING_PERIOD'
  | 'METHOD_TECHNIQUE'
  | 'COMMENT';

/**
 * ImportObservationsService - A service for importing Observations from a CSV into SIMS.
 *
 * @class ImportObservationsService
 * @extends DBService
 */
export class ImportObservationsService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;
  samplePeriodId?: number;

  utils: CSVConfigUtils<ObservationCSVStaticHeader>;

  /**
   * Construct an instance of ImportObservationsService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number, samplePeriodId?: number) {
    super(connection);

    const initialConfig: CSVConfig<ObservationCSVStaticHeader> = {
      staticHeadersConfig: {
        SPECIES: { aliases: ['ITIS_TSN', 'ITIS TSN', 'TSN', 'TAXON'] },
        COUNT: { aliases: [] },
        SUBCOUNT_SIGN: { aliases: SUBCOUNT_SIGN_ALIASES, optional: true },
        DATE: { aliases: [], optional: true },
        TIME: { aliases: [], optional: true },
        LATITUDE: { aliases: ['LAT'], optional: true },
        LONGITUDE: { aliases: ['LON', 'LONG', 'LNG'], optional: true },
        SAMPLING_PERIOD: { aliases: ['PERIOD', 'TIME PERIOD', 'SESSION'], optional: true },
        SAMPLING_SITE: { aliases: ['SITE', 'SITE ID', 'LOCATION', 'SAMPLING SITE', 'STATION'], optional: true },
        METHOD_TECHNIQUE: { aliases: ['METHOD', 'TECHNIQUE'], optional: true },
        COMMENT: { aliases: ['COMMENTS', 'NOTE', 'NOTES'], optional: true }
      },
      ignoreDynamicHeaders: false
    };

    this.worksheet = worksheet;
    this.surveyId = surveyId;
    this.samplePeriodId = samplePeriodId;

    this.utils = new CSVConfigUtils(worksheet, initialConfig);
  }

  /**
   * Import a Observation CSV worksheet into SIMS.
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

    const observations: InsertUpdateObservations[] = [];

    for (const row of rows) {
      observations.push({
        standardColumns: {
          survey_id: this.surveyId,
          itis_tsn: getTaxonFromRowState(row).itis_tsn,
          itis_scientific_name: getTaxonFromRowState(row).itis_scientific_name,
          survey_sample_period_id: getSamplePeriodIdFromRowState(row).sample_period_id ?? null,
          latitude: row.LATITUDE,
          longitude: row.LONGITUDE,
          count: row.COUNT, // deprecated - each subcount will eventually have its own count
          observation_date: row.DATE,
          observation_time: row.TIME
        },
        subcounts: this._getRowSubcounts(row)
      });
    }

    defaultLog.debug({ label: 'importCSVWorksheet', observations });

    const observationService = new ObservationService(this.connection);

    await observationService.insertUpdateManualSurveyObservations(this.surveyId, observations);

    return [];
  }

  /**
   * Get the CSV configuration for Observations.
   *
   * @returns {Promise<CSVConfig<ObservationCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<ObservationCSVStaticHeader>> {
    // Initialize the required services
    const platformService = new PlatformService(this.connection);
    const samplePeriodService = new SamplePeriodService(this.connection);
    const critterbaseService = new CritterbaseService(getCritterbaseUserFromConnection(this.connection));
    const environmentService = new ObservationSubCountEnvironmentService(this.connection);
    const codeRepository = new CodeRepository(this.connection);

    // Generate shared dependencies
    const taxonIdentifiers = this.utils.getUniqueCellValues('SPECIES').filter(Boolean) as string[];
    const taxonMap = await getTaxonMap(taxonIdentifiers, platformService);

    // Inject the dependencies and set the static headers, row validators, and dynamic headers
    await Promise.all([
      this._setObservationStaticHeaderConfigs(codeRepository),
      this._setObservationRowValidators(taxonMap, samplePeriodService),
      this._setObservationDynamicHeadersConfig(taxonMap, critterbaseService, environmentService)
    ]);

    // Return the final CSV config
    return this.utils.getConfig();
  }

  /**
   * Set the static headers for the Observation CSV.
   *
   * @param {CodeRepository} codeRepository - The code repository
   * @returns {*} {Promise<void>}
   */
  async _setObservationStaticHeaderConfigs(codeRepository: CodeRepository) {
    const subcountSignCodes = await codeRepository.getObservationSubcountSigns();

    this.utils.setAllStaticHeaderConfigs({
      // Species is pre-validated by the taxon row validator
      SPECIES: { validateCell: (params) => validateZodCell(params.cell, z.string().or(z.number())) },
      COUNT: { validateCell: getPositiveNumberCellValidator() },
      // Subcount sign must be a valid code value
      SUBCOUNT_SIGN: { validateCell: getObservationSubcountSignCellValidator(subcountSignCodes) },
      DATE: { validateCell: getDateCellValidator({ optional: true }) },
      TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      LATITUDE: { validateCell: getLatitudeCellValidator({ optional: true }) },
      LONGITUDE: { validateCell: getLongitudeCellValidator({ optional: true }) },
      // Sampling period is pre-validated by the sampling information row validator
      SAMPLING_PERIOD: { validateCell: getDateRangeCellValidator({ optional: true }) },
      // Sampling site is pre-validated by the sampling information row validator
      SAMPLING_SITE: { validateCell: getNonEmptyStringCellValidator({ optional: true }) },
      // Method technique is pre-validated by the sampling information row validator
      METHOD_TECHNIQUE: { validateCell: getNonEmptyStringCellValidator({ optional: true }) },
      COMMENT: { validateCell: getDescriptionCellValidator() }
    });
  }

  /**
   * Sets the taxon row validator, sampling information and location row validators for the Observation CSV.
   *
   * Note: Row validators run before static and dynamic header validators.
   *
   * @param {TaxonMap} taxonMap - The taxon map
   * @param {SamplePeriodService} samplePeriodService - The sample period service
   * @returns {*} {Promise<void>}
   */
  async _setObservationRowValidators(taxonMap: TaxonMap, samplePeriodService: SamplePeriodService) {
    const samplePeriods = await samplePeriodService.getSamplePeriodsForSurvey(this.surveyId);

    // Inject the row validators - handles taxon, sampling information and location validation
    this.utils.config.rowValidators = [
      getTaxonRowValidator(taxonMap, this.utils, 'SPECIES'),
      getObservationSamplingInformationRowValidator(samplePeriods, this.utils)
    ];
  }

  /**
   * Sets the environment and measurement dynamic header validator for the Observation CSV.
   *
   * @param {TaxonMap} taxonMap - The taxon map
   * @param {CritterbaseService} critterbaseService - The critterbase service
   * @param {ObservationSubCountEnvironmentService} environmentService - The environment service
   * @returns {*} {Promise<void>}
   */
  async _setObservationDynamicHeadersConfig(
    taxonMap: TaxonMap,
    critterbaseService: CritterbaseService,
    environmentService: ObservationSubCountEnvironmentService
  ) {
    // Generate the measurement dictionary and environment map
    const measurementDictionary = await getTsnMeasurementDictionary(getTsnsFromTaxonMap(taxonMap), critterbaseService);
    const environmentMap = await getEnvironmentNameTypeDefinitionMap(
      // Note: Passing ALL dynamic headers intentionally to detect conflicts
      // with measurement and environment headers in the dynamic header cell validator
      this.utils.worksheetDynamicHeaders,
      environmentService
    );

    // Inject dynamic header config - handles measurement and environment validation
    this.utils.config.dynamicHeadersConfig = {
      validateCell: getObservationDynamicHeaderCellValidator(measurementDictionary, environmentMap)
    };
  }

  /**
   * Get the subcounts from a row.
   *
   * @param {CSVRow} row - The row to extract subcounts from
   * @returns {*} {InsertSubCount[]} The subcounts
   */
  _getRowSubcounts(row: CSVRow): InsertSubCount[] {
    const newSubcount: InsertSubCount = {
      observation_subcount_id: null,
      subcount: row.COUNT ?? null,
      observation_subcount_sign_id: row.SUBCOUNT_SIGN ?? null,
      comment: row.COMMENT ?? null,
      qualitative_measurements: [],
      quantitative_measurements: [],
      qualitative_environments: [],
      quantitative_environments: []
    };

    // Loop through the dynamic headers to extract measurements and environments
    for (const dynamicHeader of this.utils.worksheetDynamicHeaders) {
      // Nested state used to prevent conflicts with other CSV headers
      const nestedState = row[CSVRowState]?.[dynamicHeader];

      // Grab the qualitative measurement from the row
      if (isCBQualitativeMeasurementStub(nestedState)) {
        const qualitativeMeasurement = getQualitativeMeasurementFromRowState(nestedState);

        newSubcount.qualitative_measurements.push({
          measurement_id: qualitativeMeasurement.taxon_measurement_id,
          measurement_option_id: qualitativeMeasurement.qualitative_option_id
        });
      }
      // Grab the quantitative measurement from the row
      else if (isCBQuantitativeMeasurementStub(nestedState)) {
        const quantitativeMeasurement = getQuantitativeMeasurementFromRowState(nestedState);

        newSubcount.quantitative_measurements.push({
          measurement_id: quantitativeMeasurement.taxon_measurement_id,
          measurement_value: quantitativeMeasurement.value
        });
      }
      // Grab the qualitative environment from the row
      else if (isQualitativeEnvironmentStub(nestedState)) {
        const qualitativeEnvironment = getQualitativeEnvironmentFromRowState(nestedState);

        newSubcount.qualitative_environments.push({
          environment_qualitative_id: qualitativeEnvironment.environment_qualitative_id,
          environment_qualitative_option_id: qualitativeEnvironment.environment_qualitative_option_id
        });
      }
      // Grab the quantitative environment from the row
      else if (isQuantitativeEnvironmentStub(nestedState)) {
        const quantitativeEnvironment = getQuantitativeEnvironmentFromRowState(nestedState);

        newSubcount.quantitative_environments.push({
          environment_quantitative_id: quantitativeEnvironment.environment_quantitative_id,
          value: quantitativeEnvironment.value
        });
      } else {
        // NOTE: Should this else path throw an error?
      }
    }

    return [newSubcount];
  }
}
