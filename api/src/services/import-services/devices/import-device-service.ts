import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CodeRepository } from '../../../repositories/code-repository';
import { CreateTelemetryDevice } from '../../../repositories/telemetry-repositories/telemetry-device-repository.interface';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDescriptionCellValidator,
  getPositiveNumberCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getAllAliases } from '../../../utils/csv-utils/csv-helpers';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { TelemetryDeviceService } from '../../telemetry-services/telemetry-device-service';
import { getTelemetryVendorCellValidator } from '../telemetry/telemetry-header-configs';

const defaultLog = getLogger('services/import-services/import-device-service');

// Telemetry CSV static headers
export type DeviceCSVStaticHeader = 'VENDOR' | 'SERIAL' | 'MODEL' | 'COMMENT';

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
  vendorNameToId: Map<string, number> | undefined;

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

    // Map vendor name to id for device_make_id
    if (!this.vendorNameToId) {
      throw new Error('Vendor name to ID map not initialized');
    }

    const telemetryDevice: CreateTelemetryDevice[] = rows
      .map((row) => ({
        survey_id: this.surveyId,
        serial: row.SERIAL,
        device_make_id: this.vendorNameToId?.get(String(row.VENDOR).toLowerCase()),
        model: row.MODEL,
        comment: row.COMMENT
      }))
      .filter((device) => device.device_make_id !== undefined) as CreateTelemetryDevice[];

    defaultLog.info({
      label: 'importCSVWorksheet',
      message: 'Batch creating telemetry records',
      telemetryCount: telemetryDevice.length
    });

    for (const device of telemetryDevice) {
      await this.telemetryDeviceService.createDevice(device);
    }

    return [];
  }

  /**
   * Get the CSV configuration for Telemetry.
   *
   * @returns {Promise<CSVConfig<DeviceCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<DeviceCSVStaticHeader>> {
    const [vendors] = await Promise.all([this.codeRepository.getActiveTelemetryDeviceMakes()]);

    // Create a map from vendor name (lowercased) to id
    this.vendorNameToId = new Map(vendors.map((vendor) => [vendor.name.toLowerCase(), vendor.id]));

    const vendorsSet = new Set(vendors.map((vendor) => vendor.name.toLowerCase()));

    this.utils.setAllStaticHeaderConfigs({
      SERIAL: { validateCell: getPositiveNumberCellValidator() },
      VENDOR: { validateCell: getTelemetryVendorCellValidator(vendorsSet) },
      MODEL: { validateCell: getDescriptionCellValidator() },
      COMMENT: { validateCell: getDescriptionCellValidator() }
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }
}
