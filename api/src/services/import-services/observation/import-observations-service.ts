import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CodeRepository } from '../../../repositories/code-repository';
import { InsertObservation } from '../../../repositories/observation-repository/observation-repository';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
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
import { CritterbaseService } from '../../critterbase-service';
import { DBService } from '../../db-service';
import {
  InsertSubCount,
  InsertUpdateObservations,
  ObservationService
} from '../../observation-services/observation-service';
import { PlatformService } from '../../platform-service';
import { SamplePeriodService } from '../../sample-period-service';
import { getTsnMeasurementDictionary, isCBQualitativeMeasurement } from '../utils/measurement';
import { getTaxonTsnFromRowState } from '../utils/row-state';
import { getTaxonMap } from '../utils/taxon';
import { getObservationDynamicHeaderConfig } from './utils/observation-dynamic-header-config';
import { getObservationSubcountSignCellValidator } from './utils/observation-header-configs';
import { getObservationSamplingInformationRowValidator } from './utils/observation-sampling-row-validator';

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
      const newObservation: InsertObservation = {
        survey_id: this.surveyId,
        itis_tsn: row[CSVRowState]?.itis_tsn,
        itis_scientific_name: row[CSVRowState]?.itis_scientific_name,
        survey_sample_period_id: row.SAMPLING_PERIOD ?? null,
        latitude: row.LATITUDE,
        longitude: row.LONGITUDE,
        count: row.COUNT, // deprecated - each subcount will eventually have its own count
        observation_date: row.DATE,
        observation_time: row.TIME
      };

      const newSubcount: InsertSubCount = {
        observation_subcount_id: null,
        subcount: row.COUNT,
        observation_subcount_sign_id: row.SUBCOUNT_SIGN ?? null,
        comment: row.COMMENT ?? null,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: []
      };

      for (const dynamicHeader of this.utils.worksheetDynamicHeaders) {
        const state = row[CSVRowState];
        const stateMeasurement = state?.[dynamicHeader];

        // Grab the qualitative measurement from the row
        if (isCBQualitativeMeasurement(stateMeasurement)) {
          newSubcount.qualitative_measurements.push(getQualitativeMeasurementFromRowState(row, dynamicHeader));
        }
        // Grab the quantitative measurement from the row
        else if (isCBQuantitativeMeasurement(stateMeasurement)) {
          quantitativeMeasurements.push(getQuantitativeMeasurementFromRowState(row, header));
        }

        dynamicHeader;
        // TODO: Inject the measurements and environments into the subcount
      }

      observations.push({ standardColumns: newObservation, subcounts: [newSubcount] });
    }

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
    const samplePeriodService = new SamplePeriodService(this.connection);
    const platformService = new PlatformService(this.connection);
    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });
    const codeRepository = new CodeRepository(this.connection);

    const samplingPeriods = await samplePeriodService.getSamplePeriodsForSurvey(this.surveyId);
    const subcountSignCodes = await codeRepository.getObservationSubcountSigns();
    const taxonIdentifiers = this.utils.getUniqueCellValues('SPECIES');
    const taxonMap = await getTaxonMap(taxonIdentifiers.filter(Boolean) as string[], platformService);
    const measurementDictionary = await getTsnMeasurementDictionary([], critterbaseService);

    this.utils.setAllStaticHeaderConfigs({
      // Species is validated by the taxon row validator
      SPECIES: { validateCell: (params) => validateZodCell(params.cell, z.string().or(z.number())) },
      COUNT: { validateCell: getPositiveNumberCellValidator() },
      // Subcount sign must be a valid code value
      SUBCOUNT_SIGN: { validateCell: getObservationSubcountSignCellValidator(subcountSignCodes) },
      DATE: { validateCell: getDateCellValidator({ optional: true }) },
      TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      LATITUDE: { validateCell: getLatitudeCellValidator({ optional: true }) },
      LONGITUDE: { validateCell: getLongitudeCellValidator({ optional: true }) },
      // Sampling period is validated by the sampling information row validator
      SAMPLING_PERIOD: { validateCell: getDateRangeCellValidator({ optional: true }) },
      // Sampling site is validated by the sampling information row validator
      SAMPLING_SITE: { validateCell: getNonEmptyStringCellValidator({ optional: true }) },
      // Method technique is validated by the sampling information row validator
      METHOD_TECHNIQUE: { validateCell: getNonEmptyStringCellValidator({ optional: true }) },
      COMMENT: { validateCell: getDescriptionCellValidator() }
    });

    const config = this.utils.getConfig();

    // Inject the row validators - handles taxon and sampling information validation
    // Note: Runs BEFORE the static header validation
    config.rowValidators = [
      getTaxonRowValidator(taxonMap, this.utils, 'SPECIES'),
      getObservationSamplingInformationRowValidator(samplingPeriods, this.utils)
    ];

    // Inject dynamic header config - handles measurement and environment validation
    config.dynamicHeadersConfig = {
      validateCell: getObservationDynamicHeaderConfig(measurementDictionary, (params) => {
        return getTaxonTsnFromRowState(params.row);
      })
    };

    // Return the final CSV config
    return config;
  }
}
