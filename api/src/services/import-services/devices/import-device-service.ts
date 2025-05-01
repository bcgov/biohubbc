import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CodeRepository } from '../../../repositories/code-repository';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getArrayCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getAllAliases } from '../../../utils/csv-utils/csv-helpers';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { TelemetryDeviceService } from '../../telemetry-services/telemetry-device-service';
import { getTelemetrySerialCellValidator, getDeviceVendorCellValidator } from './device-header-configs';
import { CreateTelemetryDevice } from '../../../repositories/telemetry-repositories/telemetry-device-repository.interface';

const defaultLog = getLogger('services/import-services/import-device-service');

// Telemetry CSV static headers
export type DeviceCSVStaticHeader = 'VENDOR' | 'SERIAL' | 'MODEL' | 'COMMENT' ;

/**
 * ImportDeviceService - A service for importing Telemetry devices from a CSV into SIMS.
 *
 * @class ImportDeviceService
 * @extends DBService
 */
export class ImportDeviceService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  // Services
  telemetryDeviceService: TelemetryDeviceService;
  codeRepository: CodeRepository;
  utils: CSVConfigUtils<DeviceCSVStaticHeader>;

  /**
   * Construct an instance of ImportDeviceService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number) {
    super(connection);

    const initialConfig: CSVConfig<DeviceCSVStaticHeader> = {
      staticHeadersConfig: {
        SERIAL: { aliases: getAllAliases(['DEVICE_ID', 'DEVICE', 'COLLAR', 'COLLAR_ID']) },
        VENDOR: { aliases: ['MAKE', 'MANUFACTURER'] },
        MODEL: { aliases: ['PRODUCT'], optional: true },
        COMMENT: { aliases: ['COMMENTS', 'DESCRIPTION'], optional: true }
      },
      ignoreDynamicHeaders: false
    };

    this.worksheet = worksheet;
    this.surveyId = surveyId;

    // Initialize services
    this.telemetryDeviceService = new TelemetryDeviceService(connection);
    this.codeRepository = new CodeRepository(connection);
    this.utils = new CSVConfigUtils(this.worksheet, initialConfig);
  }

  /**
   * Import a Telemetry CSV worksheet into SIMS.
   *
   * @async
   * @throws {ApiGeneralError} - If unable to fully insert records into SIMS
   * @returns {*} {Promise<CSVError[]>} List of CSV errors encountered during import
   */
  async importCSVWorksheet(): Promise<CSVError[]> {
    const config = await this.getCSVConfig();

    const { errors, rows } = validateCSVWorksheet(this.worksheet, config);

    if (errors.length) {
      return errors;
    }

    const telemetryDevice: CreateTelemetryDevice[] = rows.map((row) => ({
      survey_id: this.surveyId,
      serial: row.SERIAL,
      device_make_id: row.VENDOR,
      model: row.MODEL,
      comment:row.COMMENT
    }));

    defaultLog.info({
      label: 'importCSVWorksheet',
      message: 'Batch creating telemetry records',
      telemetryCount: telemetryDevice.length
    });

    await this.telemetryDeviceService.createDevice(telemetryDevice);

    return [];
  }

  /**
   * Get the CSV configuration for Telemetry.
   *
   * @returns {Promise<CSVConfig<DeviceCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<DeviceCSVStaticHeader>> {
    const [vendors] = await Promise.all([
      this.codeRepository.getActiveTelemetryDeviceMakes()
    ]);

    const vendorsSet = new Set(vendors.map((vendor) => vendor.name.toLowerCase()));

    this.utils.setAllStaticHeaderConfigs({
      SERIAL: { validateCell: getTelemetrySerialCellValidator(this.utils) },
      VENDOR: { validateCell: getDeviceVendorCellValidator(vendorsSet) },
      MODEL: { validateCell: getArrayCellValidator() },
      COMMENT: { validateCell: getArrayCellValidator()}
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }
}