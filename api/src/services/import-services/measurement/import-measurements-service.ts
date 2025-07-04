import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getTimeCellValidator,
  validateZodCell
} from '../../../utils/csv-utils/csv-header-configs';
import { getCritterCaptureRowValidator } from '../../../utils/csv-utils/row-validators/critter-capture-row-validator';
import { getCritterMortalityRowValidator } from '../../../utils/csv-utils/row-validators/critter-mortality-row-validator';
import { getLogger } from '../../../utils/logger';
import { CritterbaseService, ICritterDetailed, IQualMeasurement, IQuantMeasurement } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import {
  getTsnMeasurementDictionary,
  isCBQualitativeMeasurementStub,
  isCBQuantitativeMeasurementStub
} from '../utils/measurement';
import {
  getCritterCaptureFromRowState,
  getQualitativeMeasurementFromRowState,
  getQuantitativeMeasurementFromRowState
} from '../utils/row-state';
import { getDynamicMeasurementCellValidator } from './utils/measurement-dynamic-headers-config';
import { getTsnFromMeasurementRow } from './utils/measurement-utils';

const defaultLog = getLogger('services/import/import-measurement-service');

// Measurement CSV static headers
export type MeasurementCSVStaticHeader = 'ALIAS' | 'CAPTURE_DATE' | 'CAPTURE_TIME';

/**
 * ImportMeasurementsService - A service for importing Measurements from a CSV into Critterbase.
 *
 * @class ImportMeasurementsService
 * @extends DBService
 */
export class ImportMeasurementsService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  surveyCritterService: SurveyCritterService;
  critterbaseService: CritterbaseService;
  utils: CSVConfigUtils<MeasurementCSVStaticHeader>;

  /**
   * Construct an instance of ImportMeasurementsService.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number) {
    super(connection);

    const initialConfig: CSVConfig<MeasurementCSVStaticHeader> = {
      staticHeadersConfig: {
        ALIAS: { aliases: ['NICKNAME', 'ANIMAL'] },
        CAPTURE_DATE: { aliases: ['CAPTURE DATE', 'DATE'] },
        CAPTURE_TIME: { aliases: ['CAPTURE TIME', 'TIME'] }
      },
      ignoreDynamicHeaders: false
    };

    this.worksheet = worksheet;
    this.surveyId = surveyId;

    this.surveyCritterService = new SurveyCritterService(connection);
    this.critterbaseService = this.surveyCritterService.critterbaseService;
    this.utils = new CSVConfigUtils(this.worksheet, initialConfig);
  }

  /**
   * Import a Measurement CSV worksheet into Critterbase.
   *
   * @async
   * @param {'captures' | 'mortalities'} context - Determines which event type to match (capture or mortality)
   * @throws {ApiGeneralError} - If unable to fully insert records into Critterbase
   * @returns {*} {Promise<CSVError[]>} List of CSV errors encountered during import
   */
  async importCSVWorksheet(context: 'captures' | 'mortalities' = 'captures'): Promise<CSVError[]> {
    const config = await this.getCSVConfig(context);
    const { errors, rows } = validateCSVWorksheet(this.worksheet, config);
    if (errors.length) {
      return errors;
    }
    const qualitativeMeasurements: IQualMeasurement[] = [];
    const quantitativeMeasurements: IQuantMeasurement[] = [];
    // Choose the correct row state getter based on context
    const getCritterEventFromRowState =
      context === 'mortalities'
        ? require('../utils/row-state').getCritterMortalityFromRowState
        : getCritterCaptureFromRowState;
    for (const row of rows) {
      this.utils.worksheetDynamicHeaders.forEach((header) => {
        const stateMeasurement = row[CSVRowState]?.[header];
        if (isCBQualitativeMeasurementStub(stateMeasurement)) {
          const critter = getCritterEventFromRowState(row);
          const qualitativeMeasurement = getQualitativeMeasurementFromRowState(stateMeasurement);
          qualitativeMeasurements.push({
            critter_id: critter.critter_id,
            ...(context === 'captures' ? { capture_id: critter.capture_id } : { mortality_id: critter.mortality_id }),
            taxon_measurement_id: qualitativeMeasurement.taxon_measurement_id,
            qualitative_option_id: qualitativeMeasurement.qualitative_option_id
          });
        } else if (isCBQuantitativeMeasurementStub(stateMeasurement)) {
          const critter = getCritterEventFromRowState(row);
          const quantitativeMeasurement = getQuantitativeMeasurementFromRowState(stateMeasurement);
          quantitativeMeasurements.push({
            critter_id: critter.critter_id,
            ...(context === 'captures' ? { capture_id: critter.capture_id } : { mortality_id: critter.mortality_id }),
            taxon_measurement_id: quantitativeMeasurement.taxon_measurement_id,
            value: quantitativeMeasurement.value
          });
        }
      });
    }
    defaultLog.debug({ label: 'import measurements', context, qualitativeMeasurements, quantitativeMeasurements });
    await this.critterbaseService.bulkCreate({
      qualitative_measurements: qualitativeMeasurements,
      quantitative_measurements: quantitativeMeasurements
    });
    return [];
  }

  /**
   * Get the CSV configuration for Measurements.
   *
   * @returns {Promise<CSVConfig<MeasurementCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(context: 'captures' | 'mortalities' = 'captures'): Promise<CSVConfig<MeasurementCSVStaticHeader>> {
    const surveyAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);
    const worksheetTsns = this._getWorksheetTsns(surveyAliasMap);
    const measurementDictionary = await getTsnMeasurementDictionary(worksheetTsns, this.critterbaseService);

    // Set the static header configs for additional error information
    this.utils.setAllStaticHeaderConfigs({
      ALIAS: { validateCell: (params) => validateZodCell(params.cell, z.string()) },
      CAPTURE_DATE: { validateCell: getDateCellValidator() },
      CAPTURE_TIME: { validateCell: getTimeCellValidator() }
    });

    const config = this.utils.getConfig();

    // Inject the row validator based on context
    config.rowValidators = [
      context === 'mortalities'
        ? getCritterMortalityRowValidator(surveyAliasMap, this.utils)
        : getCritterCaptureRowValidator(surveyAliasMap, this.utils)
    ];

    // Inject dynamic header config - handles measurement validation
    config.dynamicHeadersConfig = {
      validateCell: getDynamicMeasurementCellValidator(
        measurementDictionary,
        getTsnFromMeasurementRow(surveyAliasMap, this.utils)
      )
    };

    // Return the final CSV config
    return config;
  }

  /**
   * Get the CSV worksheet TSN's Set.
   *
   * @param {Map<string, ICritterDetailed>} surveyAliasMap - Survey alias map
   * @returns {*} {number[]} List of ITIS TSN's
   */
  _getWorksheetTsns(surveyAliasMap: Map<string, ICritterDetailed>): number[] {
    const tsns: number[] = [];

    for (const alias of this.utils.getUniqueCellValues('ALIAS')) {
      const critter = surveyAliasMap.get(String(alias).toLowerCase());

      if (critter) {
        tsns.push(critter.itis_tsn);
      }
    }

    return tsns;
  }
}
