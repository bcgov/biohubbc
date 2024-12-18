import { chunk } from 'lodash';
import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { HTTP422CSVValidationError } from '../../../errors/http-error';
import { CreateManualTelemetry } from '../../../repositories/telemetry-repositories/telemetry-manual-repository.interface';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSV_ERROR_MESSAGE } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getTimeCellSetter, getTimeCellValidator, validateZodCell } from '../../../utils/csv-utils/csv-header-configs';
import { taskQueue } from '../../../utils/task-queue';
import { CodeService } from '../../code-service';
import { DBService } from '../../db-service';
import { TelemetryVendorService } from '../../telemetry-services/telemetry-vendor-service';
import { formatTimestampString } from '../utils/datetime';
import { getTelemetrySerialCellValidator, getTelemetryVendorCellValidator } from './telemetry-header-configs';

const TELEMETRY_BATCH_SIZE = 500;

//const defaultLog = getLogger('services/import/import-telemetry-service');

// Telemetry CSV static headers
export type TelemetryCSVStaticHeader = 'VENDOR' | 'SERIAL' | 'LATITUDE' | 'LONGITUDE' | 'DATE' | 'TIME';

/**
 * ImportTelemetryService - A service for importing Telemetry from a CSV into SIMS.
 *
 * @class ImportTelemetryService
 * @extends DBService
 */
export class ImportTelemetryService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  telemetryVendorService: TelemetryVendorService;
  codeService: CodeService;
  utils: CSVConfigUtils<TelemetryCSVStaticHeader>;

  /**
   * Construct an instance of ImportTelemetryService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number) {
    super(connection);

    const initialConfig: CSVConfig<TelemetryCSVStaticHeader> = {
      staticHeadersConfig: {
        SERIAL: { aliases: ['DEVICE_ID'] },
        VENDOR: { aliases: [] },
        LATITUDE: { aliases: ['LAT'] },
        LONGITUDE: { aliases: ['LON', 'LONG', 'LNG'] },
        DATE: { aliases: [] },
        TIME: { aliases: [], optional: true }
      },
      ignoreDynamicHeaders: false
    };

    this.worksheet = worksheet;
    this.surveyId = surveyId;

    this.telemetryVendorService = new TelemetryVendorService(connection);
    this.codeService = new CodeService(connection);
    this.utils = new CSVConfigUtils(this.worksheet, initialConfig);
  }

  /**
   * Import a Telemetry CSV worksheet into SIMS.
   *
   * @async
   * @throws {ApiGeneralError} - If unable to fully insert records into SIMS
   * @returns {*} {Promise<CSVError[]>}
   */
  async importCSVWorksheet(): Promise<void> {
    const config = await this.getCSVConfig();

    const { errors, rows } = validateCSVWorksheet(this.worksheet, config);

    if (errors.length) {
      throw new HTTP422CSVValidationError(CSV_ERROR_MESSAGE, errors);
    }

    const telemetry: CreateManualTelemetry[] = rows.map((row) => ({
      deployment_id: row.SERIAL,
      latitude: row.LATITUDE,
      longitude: row.LONGITUDE,
      acquisition_date: formatTimestampString(row.DATE, row.TIME),
      transmission_date: null
    }));

    // Split the teletry into batches to prevent SQL cap error
    const telemetryBatches = chunk(telemetry, TELEMETRY_BATCH_SIZE);

    const telemetryProcessor = async (telemetryBatch: CreateManualTelemetry[]): Promise<void> => {
      return this.telemetryVendorService.bulkCreateManualTelemetry(this.surveyId, telemetryBatch);
    };

    const queueResult = await taskQueue(telemetryBatches, telemetryProcessor, 10);

    // Check for any errors in the batch processing
    const batchErrors = queueResult.filter((result) => result.error);

    if (batchErrors.length) {
      throw new ApiGeneralError('Failed to batch import telemetry.', [batchErrors.map((task) => task.error)]);
    }
  }

  /**
   * Get the CSV configuration for Telemetry.
   *
   * @returns {Promise<CSVConfig<TelemetryCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<TelemetryCSVStaticHeader>> {
    const deployments = await this.telemetryVendorService.deploymentService.getDeploymentsForSurvey(this.surveyId);
    const vendors = await this.codeService.codeRepository.getActiveTelemetryDeviceMakes();

    this.utils.setStaticHeaderConfig('SERIAL', {
      validateCell: getTelemetrySerialCellValidator(deployments, this.utils)
    });
    this.utils.setStaticHeaderConfig('VENDOR', {
      validateCell: getTelemetryVendorCellValidator(new Set(vendors.map((vendor) => vendor.name.toLowerCase())))
    });
    this.utils.setStaticHeaderConfig('LATITUDE', {
      validateCell: (params) => validateZodCell(params, z.number().min(-90).max(90))
    });
    this.utils.setStaticHeaderConfig('LONGITUDE', {
      validateCell: (params) => validateZodCell(params, z.number().min(-180).max(180))
    });
    this.utils.setStaticHeaderConfig('DATE', {
      validateCell: (params) => validateZodCell(params, z.string().date())
    });
    this.utils.setStaticHeaderConfig('TIME', {
      validateCell: getTimeCellValidator(),
      setCellValue: getTimeCellSetter()
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }
}
