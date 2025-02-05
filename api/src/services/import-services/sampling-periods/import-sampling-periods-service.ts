import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { InsertSamplePeriodObject } from '../../../repositories/sample-period-repository';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getTimeCellSetter,
  getTimeCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { SamplePeriodService } from '../../sample-period-service';
import { SampleSiteService } from '../../sample-site-service';
import { TechniqueService } from '../../technique-service';
import { getMethodTechniqueCellValidator, getSamplingSiteCellValidator } from './utils/sampling-periods-header-configs';

const defaultLog = getLogger('services/import/import-sampling-periods-service');

// Sampling Period CSV static headers
export type SamplingPeriodCSVStaticHeader =
  | 'SAMPLING_SITE'
  | 'TECHNIQUE_NAME'
  | 'START_DATE'
  | 'START_TIME'
  | 'END_DATE'
  | 'END_TIME';

/**
 * ImportSamplingPeriodsService - A service for importing Sampling Periods into SIMS.
 *
 * @class ImportSamplingPeriodsService
 * @extends DBService
 */
export class ImportSamplingPeriodsService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  utils: CSVConfigUtils<SamplingPeriodCSVStaticHeader>;

  /**
   * Construct an instance of ImportSamplingPeriodsService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number) {
    super(connection);

    const initialConfig: CSVConfig<SamplingPeriodCSVStaticHeader> = {
      staticHeadersConfig: {
        SAMPLING_SITE: { aliases: ['SAMPLING SITE', 'SITE'] },
        TECHNIQUE_NAME: { aliases: ['TECHNIQUE NAME', 'TECHNIQUE'] },
        START_DATE: { aliases: ['START DATE'] },
        START_TIME: { aliases: ['START TIME'], optional: true },
        END_DATE: { aliases: ['END DATE'] },
        END_TIME: { aliases: ['END TIME'], optional: true }
      },
      ignoreDynamicHeaders: false
    };

    this.worksheet = worksheet;
    this.surveyId = surveyId;

    this.utils = new CSVConfigUtils(this.worksheet, initialConfig);
  }

  /**
   * Import a `Sampling Periods` CSV worksheet into SIMS.
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

    const samplePeriodService = new SamplePeriodService(this.connection);

    // Convert the rows to sample periods
    const samplePeriods: InsertSamplePeriodObject[] = rows.map((row) => {
      return {
        survey_sample_site_id: row.SAMPLING_SITE,
        method_technique_id: row.TECHNIQUE_NAME,
        start_date: row.START_DATE,
        start_time: row.START_TIME,
        end_date: row.END_DATE,
        end_time: row.END_TIME
      };
    });

    await samplePeriodService.insertSamplePeriods(this.surveyId, samplePeriods);

    defaultLog.debug({ label: 'import sampling periods', samplePeriods });

    return [];
  }

  /**
   * Get the CSV configuration for Sampling Periods.
   *
   * @returns {Promise<CSVConfig<SamplingPeriodCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<SamplingPeriodCSVStaticHeader>> {
    // Initialize dependent services
    const sampleSiteService = new SampleSiteService(this.connection);
    const methodTechniqueService = new TechniqueService(this.connection);

    // Get the injectable reference data
    const sampleSites = await sampleSiteService.getSampleSitesForSurveyId(this.surveyId);
    const methodTechniques = await methodTechniqueService.getTechniquesForSurveyId(this.surveyId);

    // Set all the static header configs
    this.utils.setAllStaticHeaderConfigs({
      SAMPLING_SITE: { validateCell: getSamplingSiteCellValidator(sampleSites) },
      TECHNIQUE_NAME: { validateCell: getMethodTechniqueCellValidator(methodTechniques) },
      START_DATE: { validateCell: getDateCellValidator() },
      START_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      END_DATE: { validateCell: getDateCellValidator() },
      END_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() }
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }
}
