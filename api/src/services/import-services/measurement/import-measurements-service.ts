import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getCritterCaptureRowValidator } from '../../../utils/csv-utils/csv-row-validators';
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
        // Note: These headers are validated in the row validator
        ALIAS: { aliases: ['NICKNAME', 'ANIMAL'], validateCell: () => [] },
        CAPTURE_DATE: { aliases: ['CAPTURE DATE', 'DATE'], validateCell: () => [] },
        CAPTURE_TIME: { aliases: ['CAPTURE TIME', 'TIME'], validateCell: () => [] }
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
        const measurement = row[CSVRowState]?.[header];

        if (isCBQualitativeMeasurement(measurement)) {
          qualitativeMeasurements.push({
            critter_id: row[CSVRowState]?.critter_id,
            capture_id: row[CSVRowState]?.capture_id,
            taxon_measurement_id: measurement.taxon_measurement_id,
            qualitative_option_id: measurement.qualitative_option_id
          });
        } else if (isCBQuantitativeMeasurement(measurement)) {
          quantitativeMeasurements.push({
            critter_id: row[CSVRowState]?.critterId,
            capture_id: row[CSVRowState]?.captureId,
            taxon_measurement_id: measurement.taxon_measurement_id,
            value: measurement.value
          });
        } else {
          throw new Error('Measurement type not recognized');
        }
      });
    }

    defaultLog.debug({ label: 'import measurements' });

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

    const config = this.utils.getConfig();

    config.dynamicHeadersConfig = {
      ...config.dynamicHeadersConfig,
      validateCell: getDynamicMeasurementCellValidator(measurementDictionary, surveyAliasMap, this.utils)
    };

    config.rowValidators = [
      getCritterCaptureRowValidator(surveyAliasMap, this.utils, {
        aliasHeader: 'ALIAS',
        captureDateHeader: 'CAPTURE_DATE',
        captureTimeHeader: 'CAPTURE_TIME'
      })
    ];

    // Return the final CSV config
    return config;
  }

  _getWorksheetTsns(surveyAliasMap: Map<string, ICritterDetailed>): number[] {
    const aliases = this.utils.getUniqueCellValues('ALIAS');

    const critters = aliases
      .map((alias) => surveyAliasMap.get(String(alias).toLowerCase()))
      .filter(Boolean) as ICritterDetailed[];

    return critters.map((critter) => critter?.itis_tsn);
  }

  /**
   *
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
