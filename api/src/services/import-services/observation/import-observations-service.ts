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
  getDescriptionCellValidator,
  getLatitudeCellValidator,
  getLongitudeCellValidator,
  getTaxonCellValidator,
  getTimeCellSetter,
  getTimeCellValidator,
  validateZodCell
} from '../../../utils/csv-utils/csv-header-configs';
import { DBService } from '../../db-service';
import {
  InsertSubCount,
  InsertUpdateObservations,
  ObservationService
} from '../../observation-services/observation-service';
import { SamplePeriodService } from '../../sample-period-service';
import { getObservationSubcountSignCellValidator } from './observation-header-configs';

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

  observationService: ObservationService;
  samplePeriodService: SamplePeriodService;
  codeRepository: CodeRepository;

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
        // TODO: This needs to support the scientific name
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

    this.observationService = new ObservationService(connection);
    this.samplePeriodService = new SamplePeriodService(connection);
    this.codeRepository = new CodeRepository(connection);

    this.utils = new CSVConfigUtils(this.worksheet, initialConfig);
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
        dynamicHeader;
        // TODO: Inject the measurements and environments into the subcount
      }

      observations.push({ standardColumns: newObservation, subcounts: [newSubcount] });
    }

    await this.observationService.insertUpdateManualSurveyObservations(this.surveyId, observations);

    return [];
  }

  /**
   * Get the CSV configuration for Observations.
   *
   * @returns {Promise<CSVConfig<ObservationCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<ObservationCSVStaticHeader>> {
    const samplePeriods = await this.samplePeriodService.getSamplePeriodsForSurvey(this.surveyId);
    const subcountSignCodes = await this.codeRepository.getObservationSubcountSigns();

    this.utils.setAllStaticHeaderConfigs({
      SPECIES: { validateCell: getTaxonCellValidator([]) },
      COUNT: { validateCell: (params) => validateZodCell(params, z.number().min(1)) },
      SUBCOUNT_SIGN: { validateCell: getObservationSubcountSignCellValidator(subcountSignCodes) },
      DATE: { validateCell: getDateCellValidator({ optional: true }) },
      TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      LATITUDE: { validateCell: getLatitudeCellValidator({ optional: true }) },
      LONGITUDE: { validateCell: getLongitudeCellValidator({ optional: true }) },
      SAMPLING_PERIOD: { validateCell: (params) => validateZodCell(params, z.string().optional()) },
      SAMPLING_SITE: { validateCell: (params) => validateZodCell(params, z.string().optional()) },
      METHOD_TECHNIQUE: { validateCell: (params) => validateZodCell(params, z.string().optional()) },
      COMMENT: { validateCell: getDescriptionCellValidator() }
    });

    const config = this.utils.getConfig();

    config.dynamicHeadersConfig = { ...config.dynamicHeadersConfig, validateCell: () => [] };

    // Return the final CSV config
    return config;
  }
}
