import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CodeRepository } from '../../../repositories/code-repository';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getDescriptionCellValidator,
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
import { TelemetryVendorService } from '../../telemetry-services/telemetry-vendor-service';
import { CreateDeployment } from '../../../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
import { getTelemetryVendorCellValidator } from '../telemetry/telemetry-header-configs';
import { TelemetryDeviceService } from '../../telemetry-services/telemetry-device-service';
import { getCritterCaptureCellValidator, getDeviceSerialCellValidator, getFrequencyUnitCellValidator } from './deployment-header-configs';

const defaultLog = getLogger('services/import-services/import-telemetry-service');

// Deployment CSV static headers
export type DeploymentCSVStaticHeader = 'VENDOR' | 'SERIAL' | 'ALIAS' | 'CAPTURE_DATE' | 'CAPTURE_TIME' | 'END_DATE' | 'END_TIME'| 'FREQUENCY' | 'FREQUENCY_UNIT' | 'END_CAPTURE_DATE' | 'MORTALITY_DATE';

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
        ALIAS: { aliases: ['NICKNAME', 'ANIMAL']},
        CAPTURE_DATE: { aliases: ['START_DATE', 'START DATE','CAPTURE DATE','DATE DEPLOYED','ATTACHMENT_START_DATE'] },
        CAPTURE_TIME: { aliases: ['START_TIME', 'START TIME','CAPTURE TIME','TIME DEPLOYED','ATTACHMENT_START_TIME'], optional: true },
        END_DATE: { aliases: ['END_DATE', 'END DATE','DATE REMOVED','DATE RECOVERED','ATTACHMENT_END_DATE'], optional: true },
        END_TIME: { aliases: ['END_TIME', 'END TIME','TIME REMOVED','TIME RECOVERED','ATTACHMENT_END_TIME'], optional: true },
        FREQUENCY: { aliases: ['FREQ'], optional: true },
        FREQUENCY_UNIT: { aliases: ['FREQ_UNIT', 'FREQUENCY_UNIT'], optional: true },
        END_CAPTURE_DATE: { aliases: ['END CAPTURE DATE', 'CAPTURE END DATE','DATE RECOVERED','DATE REMOVED'], optional: true },
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

    const deployment: CreateDeployment[] = rows.map((row) => ({
      survey_id: this.surveyId,
      critter_id: row.ALIAS,
      telemetry_vendor_name: row.VENDOR,
      device_id: row.SERIAL,
      frequency: row.FREQUENCY,
      frequency_unit_id: this.getFrequencyUnitId(row.FREQUENCY_UNIT),
      attachment_start_date: row.CAPTURE_DATE,
      attachment_start_time: row.CAPTURE_TIME,
      attachment_end_date: row.END_DATE,
      attachment_end_time: row.END_TIME,
      critterbase_start_capture_id: this.getCaptureIdForCritter(row.ALIAS, row.CAPTURE_DATE)?.toString() || null,
      critterbase_end_capture_id: this.getCaptureIdForCritter(row.ALIAS, row.END_CAPTURE_DATE)?.toString() || null,
      critterbase_end_mortality_id: this.getMortalityIdForCritter(row.ALIAS, row.MORTALITY_DATE)?.toString() || null,
    }));

    defaultLog.info({
      label: 'importCSVWorksheet',
      message: 'Creating deployment records',
      deploymentCount: deployment.length
    });

    for (const deploymentRecord of deployment) {
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
    const [surveyCritterAliasMap, devices, vendors,frequency_units] = await Promise.all([
      this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId),
      this.deviceService.getDevicesForSurvey(this.surveyId),
      this.codeRepository.getActiveTelemetryDeviceMakes(),
      this.codeRepository.getFrequencyUnits()
    ]);

    // Ensure vendors have a proper type
    const vendorsSet = new Set(
      vendors.map((vendor: { name: string }) => vendor.name.toLowerCase())
    );

    // Ensure frequency units are properly calling ids 
    const frequencySet = new Set(
      frequency_units.map((frequency_unit) => frequency_unit.name.toLowerCase()));


    this.utils.setAllStaticHeaderConfigs({
      SERIAL: { validateCell: getDeviceSerialCellValidator(devices, this.utils) },
      ALIAS: { validateCell: getSurveyCritterAliasCellValidator(surveyCritterAliasMap) },
      VENDOR: { validateCell: getTelemetryVendorCellValidator(vendorsSet) },
      CAPTURE_DATE: { validateCell: getCritterCaptureCellValidator(surveyCritterAliasMap) },
      CAPTURE_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      END_DATE: { validateCell: getDateCellValidator() },
      END_TIME: { validateCell: getTimeCellValidator(), setCellValue: getTimeCellSetter() },
      FREQUENCY: { validateCell: getPositiveNumberCellValidator() },
      FREQUENCY_UNIT: { validateCell: getFrequencyUnitCellValidator(frequencySet) },
      END_CAPTURE_DATE: { validateCell: getCritterCaptureCellValidator(surveyCritterAliasMap) },
      MORTALITY_DATE: { validateCell: getDateCellValidator() }
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }
}
