import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CodeRepository } from '../../../repositories/code-repository';
import { CreateDeployment } from '../../../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getPositiveNumberCellValidator,
  getSurveyCritterAliasCellValidator,
  getTimeCellSetter,
  getTimeCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getAllAliases } from '../../../utils/csv-utils/csv-helpers';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { TelemetryDeploymentService } from '../../telemetry-services/telemetry-deployment-service';
import { TelemetryDeviceService } from '../../telemetry-services/telemetry-device-service';
import { TelemetryVendorService } from '../../telemetry-services/telemetry-vendor-service';
import { getTelemetryVendorCellValidator } from '../telemetry/telemetry-header-configs';
import { getDeviceSerialCellValidator, getFrequencyUnitCellValidator } from './deployment-header-configs';

const defaultLog = getLogger('services/import-services/import-telemetry-service');

// Deployment CSV static headers
export type DeploymentCSVStaticHeader =
  | 'VENDOR'
  | 'SERIAL'
  | 'ALIAS'
  | 'CAPTURE_DATE'
  | 'CAPTURE_TIME'
  | 'END_DATE'
  | 'END_TIME'
  | 'FREQUENCY'
  | 'FREQUENCY_UNIT'
  | 'END_CAPTURE_DATE'
  | 'MORTALITY_DATE';

/**
 * ImportDeploymentService - A service for importing Deployments from a CSV into SIMS.
 *
 * @class ImportDeploymentService
 * @extends DBService
 */
export class ImportDeploymentService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  // Services
  deploymentService: TelemetryDeploymentService;
  telemetryVendorService: TelemetryVendorService;
  surveyCritterService: SurveyCritterService;
  codeRepository: CodeRepository;
  utils: CSVConfigUtils<DeploymentCSVStaticHeader>;
  deviceService: TelemetryDeviceService;

  /**
   * Construct an instance of ImportDeploymentService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number) {
    super(connection);

    const initialConfig: CSVConfig<DeploymentCSVStaticHeader> = {
      staticHeadersConfig: {
        SERIAL: { aliases: getAllAliases(['DEVICE_ID', 'DEVICE', 'COLLAR', 'COLLAR_ID']) },
        VENDOR: { aliases: ['MAKE', 'MANUFACTURER'] },
        ALIAS: { aliases: ['NICKNAME', 'ANIMAL'] },
        CAPTURE_DATE: {
          aliases: ['START_DATE', 'START DATE', 'CAPTURE DATE', 'DATE DEPLOYED', 'ATTACHMENT_START_DATE']
        },
        CAPTURE_TIME: {
          aliases: ['START_TIME', 'START TIME', 'CAPTURE TIME', 'TIME DEPLOYED', 'ATTACHMENT_START_TIME'],
          optional: true
        },
        END_DATE: {
          aliases: ['END_DATE', 'END DATE', 'DATE REMOVED', 'DATE RECOVERED', 'ATTACHMENT_END_DATE'],
          optional: true
        },
        END_TIME: {
          aliases: ['END_TIME', 'END TIME', 'TIME REMOVED', 'TIME RECOVERED', 'ATTACHMENT_END_TIME'],
          optional: true
        },
        FREQUENCY: { aliases: ['FREQ'], optional: true },
        FREQUENCY_UNIT: { aliases: ['FREQ_UNIT', 'FREQUENCY_UNIT'], optional: true },
        END_CAPTURE_DATE: {
          aliases: ['END CAPTURE DATE', 'CAPTURE END DATE', 'DATE RECOVERED', 'DATE REMOVED'],
          optional: true
        },
        MORTALITY_DATE: { aliases: ['MORTALITY DATE', 'DATE OF MORTALITY'], optional: true }
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
    this.deviceService = new TelemetryDeviceService(connection);
  }

  /**
   * Import a Deployment CSV worksheet into SIMS.
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

    const deployments: CreateDeployment[] = [];

    // Process each row asynchronously to handle the async helper methods
    for (const row of rows) {
      const frequencyUnitId = await this.getFrequencyUnitId(row.FREQUENCY_UNIT);
      const startCaptureId = await this.getCaptureIdForCritter(row.ALIAS, row.CAPTURE_DATE);
      const endCaptureId = await this.getCaptureIdForCritter(row.ALIAS, row.END_CAPTURE_DATE);
      const mortalityId = await this.getMortalityIdForCritter(row.ALIAS, row.MORTALITY_DATE);

      deployments.push({
        survey_id: this.surveyId,
        critter_id: row.ALIAS,
        device_id: row.SERIAL,
        frequency: row.FREQUENCY,
        frequency_unit_id: frequencyUnitId,
        attachment_start_date: row.CAPTURE_DATE,
        attachment_start_time: row.CAPTURE_TIME,
        attachment_end_date: row.END_DATE,
        attachment_end_time: row.END_TIME,
        critterbase_start_capture_id: startCaptureId,
        critterbase_end_capture_id: endCaptureId,
        critterbase_end_mortality_id: mortalityId
      });
    }

    defaultLog.info({
      label: 'importCSVWorksheet',
      message: 'Creating deployment records',
      deploymentCount: deployments.length
    });

    for (const deploymentRecord of deployments) {
      await this.deploymentService.createDeployment(deploymentRecord);
    }

    // Return an empty array if no errors occurred
    return [];
  }

  /**
   * Get the CSV configuration for Deployments.
   *
   * @returns {Promise<CSVConfig<DeploymentCSVStaticHeader>>}
   */
  async getCSVConfig(): Promise<CSVConfig<DeploymentCSVStaticHeader>> {
    const [surveyCritterAliasMap, devices, vendors, frequency_units] = await Promise.all([
      this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId),
      this.deviceService.getDevicesForSurvey(this.surveyId),
      this.codeRepository.getActiveTelemetryDeviceMakes(),
      this.codeRepository.getFrequencyUnits()
    ]);

    // Ensure vendors have a proper type
    const vendorsSet = new Set(vendors.map((vendor: { name: string }) => vendor.name.toLowerCase()));

    // Ensure frequency units are properly calling ids
    const frequencySet = new Set(frequency_units.map((frequency_unit) => frequency_unit.name.toLowerCase()));

    this.utils.setAllStaticHeaderConfigs({
      SERIAL: { validateCell: getDeviceSerialCellValidator(devices, this.utils) },
      ALIAS: { validateCell: getSurveyCritterAliasCellValidator(surveyCritterAliasMap) },
      VENDOR: { validateCell: getTelemetryVendorCellValidator(vendorsSet) },
      CAPTURE_DATE: { validateCell: getDateCellValidator() },
      CAPTURE_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      END_DATE: { validateCell: getDateCellValidator() },
      END_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      FREQUENCY: { validateCell: getPositiveNumberCellValidator() },
      FREQUENCY_UNIT: { validateCell: getFrequencyUnitCellValidator(frequencySet) },
      END_CAPTURE_DATE: { validateCell: getDateCellValidator() },
      MORTALITY_DATE: { validateCell: getDateCellValidator() }
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }

  /**
   * Get frequency unit ID by name.
   *
   * @param {string} frequencyUnitName - The frequency unit name
   * @returns {number | null} The frequency unit ID or null
   */
  async getFrequencyUnitId(frequencyUnitName: string): Promise<number | null> {
    if (!frequencyUnitName) {
      return null;
    }

    const frequencyUnits = await this.codeRepository.getFrequencyUnits();
    const unit = frequencyUnits.find((fu) => fu.name.toLowerCase() === frequencyUnitName.toLowerCase());
    return unit?.id || null;
  }

  /**
   * Get capture ID for a critter by alias and date.
   *
   * @param {string} alias - The critter alias
   * @param {string} captureDate - The capture date
   * @returns {string | null} The capture ID or null
   */
  async getCaptureIdForCritter(alias: string, captureDate: string): Promise<string | null> {
    if (!alias || !captureDate) {
      return null;
    }

    const surveyCritterAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);
    const critterData = surveyCritterAliasMap.get(alias);

    if (!critterData?.captures) {
      return null;
    }

    // Find capture that matches the date
    const capture = critterData.captures.find((cap) => cap.capture_date === captureDate);

    return capture?.capture_id || null;
  }

  /**
   * Get mortality ID for a critter by alias and date.
   *
   * @param {string} alias - The critter alias
   * @param {string} mortalityDate - The mortality date
   * @returns {string | null} The mortality ID or null
   */
  async getMortalityIdForCritter(alias: string, mortalityDate: string): Promise<string | null> {
    if (!alias || !mortalityDate) {
      return null;
    }

    const surveyCritterAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);
    const critterData = surveyCritterAliasMap.get(alias);

    if (!critterData?.mortality) {
      return null;
    }

    // Check if mortality is an array or single object
    const mortalities = Array.isArray(critterData.mortality) ? critterData.mortality : [critterData.mortality];

    // Find mortality that matches the date
    const mortality = mortalities.find((mort: any) => mort.mortality_date === mortalityDate);

    return mortality?.mortality_id || null;
  }
}
