import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDateCellValidator,
  getTimeCellValidator,
  validateZodCell
} from '../../../utils/csv-utils/csv-header-configs';
import { getCritterCaptureRowValidator } from '../../../utils/csv-utils/row-validators/critter-capture-row-validator';
import { getLogger } from '../../../utils/logger';
import { NestedRecord } from '../../../utils/nested-record';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  ICritterDetailed,
  IQualMeasurement,
  IQuantMeasurement
} from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { isCBQualitativeMeasurement, isCBQuantitativeMeasurement } from '../utils/measurement';
import { getDynamicMeasurementCellValidator, TSNMeasurementDictionary } from './measurement-header-configs';

const defaultLog = getLogger('services/import/import-measurement-service');

// Measurement CSV static headers
export type MeasurementCSVStaticHeader = 'ALIAS' | 'CAPTURE_DATE' | 'CAPTURE_TIME';

/**
 * ImportMeasurementsService - A service for importing Markings from a CSV into Critterbase.
 *
 * @class ImportMeasurementsService
 * @extends DBService
 */
export class ImportMeasurementsService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  surveyCritterService: SurveyCritterService;
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
    this.utils = new CSVConfigUtils(this.worksheet, initialConfig);
  }

  /**
   * Import a Marking CSV worksheet into Critterbase.
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

    const qualitativeMeasurements: IQualMeasurement[] = [];
    const quantitativeMeasurements: IQuantMeasurement[] = [];

    for (const row of rows) {
      this.utils.worksheetDynamicHeaders.forEach((header) => {
        const stateMeasurement = row[CSVRowState]?.[header];

        if (isCBQualitativeMeasurement(stateMeasurement)) {
          qualitativeMeasurements.push({
            critter_id: row[CSVRowState]?.critter_id,
            capture_id: row[CSVRowState]?.capture_id,
            taxon_measurement_id: stateMeasurement.taxon_measurement_id,
            qualitative_option_id: stateMeasurement.qualitative_option_id
          });
        } else if (isCBQuantitativeMeasurement(stateMeasurement)) {
          quantitativeMeasurements.push({
            critter_id: row[CSVRowState]?.critter_id,
            capture_id: row[CSVRowState]?.capture_id,
            taxon_measurement_id: stateMeasurement.taxon_measurement_id,
            value: stateMeasurement.value
          });
        } else {
          throw new ApiGeneralError('Invalid measurement type', [
            'ImportMeasurementsService->importCSVWorksheet',
            stateMeasurement
          ]);
        }
      });
    }

    defaultLog.debug({ label: 'import measurements', qualitativeMeasurements, quantitativeMeasurements });

    await this.surveyCritterService.critterbaseService.bulkCreate({
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
  async getCSVConfig(): Promise<CSVConfig<MeasurementCSVStaticHeader>> {
    const surveyAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);
    const worksheetTsns = this._getWorksheetTsns(surveyAliasMap);
    const measurementDictionary = await this._getTsnMeasurementDictionaries(worksheetTsns);

    // Set the static header configs for additional error information
    this.utils.setAllStaticHeaderConfigs({
      ALIAS: { validateCell: (params) => validateZodCell(params.cell, z.string()) },
      CAPTURE_DATE: { validateCell: getDateCellValidator() },
      CAPTURE_TIME: { validateCell: getTimeCellValidator() }
    });

    const config = this.utils.getConfig();

    // Inject the row validator - handles critter/alias capture validation
    config.rowValidators = [getCritterCaptureRowValidator(surveyAliasMap, this.utils)];

    // Inject dynamic header config - handles measurement validation
    config.dynamicHeadersConfig = {
      validateCell: getDynamicMeasurementCellValidator(measurementDictionary, surveyAliasMap, this.utils)
    };

    // Return the final CSV config
    return config;
  }

  /**
   * Get the CSV worksheet TSN's.
   *
   * @param {Map<string, ICritterDetailed>} surveyAliasMap - Survey alias map
   * @returns {*} {number[]} List of ITIS TSN's
   */
  _getWorksheetTsns(surveyAliasMap: Map<string, ICritterDetailed>): number[] {
    const aliases = this.utils.getUniqueCellValues('ALIAS');

    const critters = aliases
      .map((alias) => surveyAliasMap.get(String(alias).toLowerCase()))
      .filter(Boolean) as ICritterDetailed[];

    return critters.map((critter) => critter?.itis_tsn);
  }

  /**
   * Get the TSN measurement type definition dictionary.
   *
   * @async
   * @param {number[]} tsns - List of ITIS TSN's
   * @returns {*} {Promise<TSNMeasurementDictionary>} Measurement dictionary
   */
  async _getTsnMeasurementDictionaries(tsns: number[]): Promise<TSNMeasurementDictionary> {
    const measurementDictionary = new NestedRecord<
      CBQualitativeMeasurementTypeDefinition | CBQuantitativeMeasurementTypeDefinition
    >();

    const uniqueTsns = [...new Set(tsns)];

    const measurements = await Promise.all(
      uniqueTsns.map((tsn) => this.surveyCritterService.critterbaseService.getTaxonMeasurements(String(tsn)))
    );

    // Note: This makes the assumption that a qualitative measurement and a quantitative measurement
    // will not have the same measurement name for a given TSN.
    uniqueTsns.forEach((tsn, index) => {
      const qualitativeMeasurements = measurements[index].qualitative;
      const quantitativeMeasurements = measurements[index].quantitative;

      qualitativeMeasurements.forEach((measurement) => {
        measurementDictionary.set({
          path: [tsn, measurement.measurement_name],
          value: measurement
        });
      });

      quantitativeMeasurements.forEach((measurement) => {
        measurementDictionary.set({
          path: [tsn, measurement.measurement_name],
          value: measurement
        });
      });
    });

    return measurementDictionary;
  }
}
