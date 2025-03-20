import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CodeRepository } from '../../../repositories/code-repository';
import { CreateManualTelemetry } from '../../../repositories/telemetry-repositories/telemetry-manual-repository.interface';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getLatitudeCellValidator,
  getLongitudeCellValidator,
  getSurveyCritterAliasCellValidator,
  getTimeCellSetter,
  getTimeCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { TelemetryDeploymentService } from '../../telemetry-services/telemetry-deployment-service';
import { TelemetryVendorService } from '../../telemetry-services/telemetry-vendor-service';
import { formatTimestampString } from '../utils/datetime';
import { getTelemetrySerialCellValidator, getTelemetryVendorCellValidator } from './telemetry-header-configs';

const defaultLog = getLogger('services/import-services/import-telemetry-service');

// Telemetry CSV static headers
export type TelemetryCSVStaticHeader = 'VENDOR' | 'SERIAL' | 'ALIAS' | 'LATITUDE' | 'LONGITUDE' | 'DATE' | 'TIME';

/**
 * ImportTelemetryService - A service for importing Telemetry from a CSV into SIMS.
 *
 * @class ImportTelemetryService
 * @extends DBService
 */
export class ImportTelemetryService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  // Services
  deploymentService: TelemetryDeploymentService;
  telemetryVendorService: TelemetryVendorService;
  surveyCritterService: SurveyCritterService;
  codeRepository: CodeRepository;
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
        SERIAL: { aliases: ['DEVICE_ID', 'DEVICE ID', 'DEVICE', 'COLLAR', 'COLLAR ID', 'COLLAR_ID'] },
        VENDOR: { aliases: ['MAKE', 'MANUFACTURER'] },
        ALIAS: { aliases: ['NICKNAME', 'ANIMAL'], optional: true },
        LATITUDE: { aliases: ['LAT'] },
        LONGITUDE: { aliases: ['LON', 'LONG', 'LNG'] },
        DATE: { aliases: ['ACQUISITION_DATE', 'ACQUISITION DATE'] },
        TIME: { aliases: ['ACQUISITION_TIME', 'ACQUISITION TIME'], optional: true }
      },
      ignoreDynamicHeaders: false
    };

    this.worksheet = worksheet;
    this.surveyId = surveyId;

    // Initialize services
    this.deploymentService = new TelemetryDeploymentService(connection);
    this.telemetryVendorService = new TelemetryVendorService(connection);
    this.surveyCritterService = new SurveyCritterService(connection);
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

    const telemetry: CreateManualTelemetry[] = rows.map((row) => ({
      deployment_id: row.SERIAL,
      latitude: row.LATITUDE,
      longitude: row.LONGITUDE,
      acquisition_date: formatTimestampString(row.DATE, row.TIME),
      transmission_date: null
    }));

    defaultLog.info({
      label: 'importCSVWorksheet',
      message: 'Batch creating telemetry records',
      telemetryCount: telemetry.length
    });

    await this.telemetryVendorService.bulkCreateTelemetryInBatches(this.surveyId, telemetry);

    return [];
  }

  /**
   * Get the CSV configuration for Telemetry.
   *
   * @returns {Promise<CSVConfig<TelemetryCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<TelemetryCSVStaticHeader>> {
    const deployments = await this.deploymentService.getDeploymentsForSurvey(this.surveyId);
    const surveyCritterAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);
    const vendors = await this.codeRepository.getActiveTelemetryDeviceMakes();
    const vendorsSet = new Set(vendors.map((vendor) => vendor.name.toLowerCase()));

    this.utils.setAllStaticHeaderConfigs({
      SERIAL: { validateCell: getTelemetrySerialCellValidator(deployments, surveyCritterAliasMap, this.utils) },
      ALIAS: { validateCell: getSurveyCritterAliasCellValidator(surveyCritterAliasMap, { optional: true }) },
      VENDOR: { validateCell: getTelemetryVendorCellValidator(vendorsSet) },
      LATITUDE: { validateCell: getLatitudeCellValidator() },
      LONGITUDE: { validateCell: getLongitudeCellValidator() },
      DATE: { validateCell: getDateCellValidator() },
      TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() }
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }
}
