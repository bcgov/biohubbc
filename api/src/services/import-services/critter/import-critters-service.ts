import { merge, set } from 'lodash';
import { v4 } from 'uuid';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVError, CSVHeaderConfig, CSVRow } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDescriptionCellValidator,
  getTsnCellValidator,
  getWlhIDCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getLogger } from '../../../utils/logger';
import { CritterbaseService, IBulkCreate } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { PlatformService } from '../../platform-service';
import { SurveyCritterService } from '../../survey-critter-service';
import {
  getCritterAliasCellValidator,
  getCritterCollectionUnitCellSetter,
  getCritterCollectionUnitCellValidator,
  getCritterSexCellSetter,
  getCritterSexCellValidator
} from './critter-header-configs';

const defaultLog = getLogger('services/import/import-critters-service');

// Critter CSV config with typed static headers
export type CritterCSVConfig = CSVConfig<'ITIS_TSN' | 'SEX' | 'ALIAS' | 'WLH_ID' | 'DESCRIPTION'>;

/**
 *
 * ImportCrittersService
 *
 * @class ImportCrittersService
 * @extends DBService
 *
 */
export class ImportCrittersService extends DBService {
  _config: CritterCSVConfig;

  surveyId: number;
  worksheet: WorkSheet;

  configUtils: CSVConfigUtils<CritterCSVConfig>;

  platformService: PlatformService;
  critterbaseService: CritterbaseService;
  surveyCritterService: SurveyCritterService;

  /**
   * Instantiates an instance of ImportCrittersService
   *
   * @param {IDBConnection} connection - Database connection
   * @param {number} surveyId - Survey identifier
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number) {
    super(connection);

    this._config = {
      staticHeadersConfig: {
        ITIS_TSN: { aliases: ['TAXON', 'SPECIES', 'TSN'] },
        ALIAS: { aliases: ['NICKNAME', 'NAME', 'ANIMAL_ID'] },
        SEX: { aliases: ['TEST'] },
        WLH_ID: { aliases: ['WILDLIFE_HEALTH_ID'], validateCell: getWlhIDCellValidator() },
        DESCRIPTION: { aliases: ['COMMENTS', 'COMMENT', 'NOTES'], validateCell: getDescriptionCellValidator() }
      },
      ignoreDynamicHeaders: false
    };

    this.surveyId = surveyId;
    this.worksheet = worksheet;

    this.configUtils = new CSVConfigUtils(worksheet, this._config);

    this.platformService = new PlatformService(connection);
    this.surveyCritterService = new SurveyCritterService(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Import a Critter CSV worksheet into Critterbase and SIMS.
   *
   * @async
   * @throws {ApiGeneralError} - If unable to fully insert records into Critterbase
   * @returns {Promise<number[]>} List of inserted survey critter ids
   */
  async importCSVWorksheet(): Promise<CSVError[]> {
    const config = await this._getCSVConfig();

    const { errors, rows } = validateCSVWorksheet(this.worksheet, config);

    if (errors.length) {
      return errors;
    }

    const payloads = await this._getImportPayloads(rows);

    // Add critters to Critterbase
    const bulkResponse = await this.critterbaseService.bulkCreate(payloads.critterbasePayload);

    // Check critterbase inserted the full list of critters
    // In reality this error should not be triggered, safeguard to prevent floating critter ids in SIMS
    if (bulkResponse.created.critters !== payloads.simsPayload.length) {
      throw new ApiGeneralError('Unable to fully import critters from CSV', [
        'importCrittersStrategy -> insertCsvCrittersIntoSimsAndCritterbase',
        'critterbase bulk create response count !== critterIds.length'
      ]);
    }

    // Add Critters to SIMS survey
    await this.surveyCritterService.addCrittersToSurvey(this.surveyId, payloads.simsPayload);

    return [];
  }

  /**
   * Get the Critter CSV config - this will fetch all the header configs and merge them into the final config.
   *
   * Note: This will simulate a multi-step validation process if the TSNs are invalid. This is because the TSNs are
   * dependencies for the other header configs, so all TSN related errors must be resolved first.
   *
   * @returns {Promise<CSVConfig<CritterHeaders>>} The Critter CSV config
   */
  async _getCSVConfig(): Promise<CritterCSVConfig> {
    const [tsnHeaderConfig, aliasHeaderConfig, sexHeaderConfig, dynamicHeadersConfig] = await Promise.all([
      this._getTsnHeaderConfig(),
      this._getAliasHeaderConfig(),
      this._getSexHeaderConfig().catch(() => undefined), // If this throws due to invalid TSNs, we can ignore this header till TSNs are fixed
      this._getCollectionUnitDynamicHeaderConfig().catch(() => undefined) // Same for the dynamic columns
    ]);

    return merge(this._config, {
      staticHeadersConfig: {
        ITIS_TSN: tsnHeaderConfig,
        ALIAS: aliasHeaderConfig,
        SEX: sexHeaderConfig
      },
      dynamicHeadersConfig: dynamicHeadersConfig,
      ignoreDynamicHeaders: dynamicHeadersConfig ? false : true
    });
  }

  /**
   * Get the Critterbase and SIMS import payloads.
   *
   * @param {CSVRow[]} rows - The CSV rows
   * @returns {Promise<{ simsPayload: string[]; critterbasePayload: IBulkCreate }>} The import payloads
   */
  async _getImportPayloads(rows: CSVRow[]) {
    const simsPayload: string[] = [];
    const critterbasePayload: IBulkCreate = { critters: [], collections: [] };

    // Convert rows to Critterbase and SIMS payloads
    for (const row of rows) {
      const critterId = v4();

      // SIMS payload
      simsPayload.push(critterId);

      // Critterbase static headers payload
      critterbasePayload.critters?.push({
        critter_id: critterId,
        sex_qualitative_option_id: this.configUtils.getCellValue('SEX', row),
        itis_tsn: this.configUtils.getCellValue('ITIS_TSN', row),
        animal_id: this.configUtils.getCellValue('ALIAS', row),
        wlh_id: this.configUtils.getCellValue('WLH_ID', row),
        critter_comment: this.configUtils.getCellValue('DESCRIPTION', row)
      });

      // Critterbase dynamic headers payload
      this.configUtils.dynamicHeaders.forEach((header) => {
        if (row[header]) {
          critterbasePayload.collections?.push({
            collection_unit_id: row[header],
            critter_id: critterId
          });
        }
      });
    }

    defaultLog.debug({ label: 'critter import payloads', simsPayload, critterbasePayload });

    return { simsPayload, critterbasePayload };
  }

  /**
   * Get the TSN header config.
   *
   * Validation rules:
   *  1. TSN must be a number
   *  2. TSN must be a real ITIS TSN
   *
   * @returns {Promise<CSVHeaderConfig>} The TSN header config
   */
  async _getTsnHeaderConfig(): Promise<CSVHeaderConfig> {
    const rowTsns = this.configUtils.getUniqueCellValues('ITIS_TSN');
    const taxonomy = await this.platformService.getTaxonomyByTsns(rowTsns);
    const allowedTsns = new Set(taxonomy.map((taxon) => taxon.tsn));

    return {
      validateCell: getTsnCellValidator(allowedTsns)
    };
  }

  /**
   * Get the CSV Alias header config.
   *
   * Validation rules:
   *  1. Alias must be a string
   *  2. Alias must be unique in the SIMS Survey
   *  3. Alias must be unique in the CSV
   *
   * @returns {Promise<CSVHeaderConfig>} The alias header config
   */
  async _getAliasHeaderConfig(): Promise<CSVHeaderConfig> {
    const surveyAliases = await this.surveyCritterService.getUniqueSurveyCritterAliases(this.surveyId);

    return {
      validateCell: getCritterAliasCellValidator(surveyAliases, this.configUtils)
    };
  }

  /**
   * Get the CSV Sex header config.
   *
   * Validation rules:
   *  1. Sex must be a string
   *  2. Sex must be a valid option in Critterbase for the TSN
   *
   * @returns {CSVHeaderConfig} The sex header config
   */
  async _getSexHeaderConfig(): Promise<CSVHeaderConfig> {
    const rowDictionary: { [tsn: number]: { [sex: string]: string } } = {};
    const rowTsns = this.configUtils.getUniqueCellValues('ITIS_TSN');
    const measurements = await Promise.all(rowTsns.map((tsn) => this.critterbaseService.getTaxonMeasurements(tsn)));

    measurements.forEach((measurement, index) => {
      const sexMeasurement = measurement.qualitative.find(
        (measurement) => measurement.measurement_name.toLowerCase() === 'sex'
      );

      if (sexMeasurement) {
        sexMeasurement.options.forEach((option) => {
          const tsn = Number(rowTsns[index]);
          const sexLabel = option.option_label.toLowerCase();
          set(rowDictionary, `${tsn}.${sexLabel}`, option.qualitative_option_id);
        });
      }
    });

    return {
      validateCell: getCritterSexCellValidator(rowDictionary, this.configUtils),
      setCellValue: getCritterSexCellSetter(rowDictionary, this.configUtils)
    };
  }

  /**
   * Get the CSV Collection Unit dynamic header config.
   *
   * @returns {Promise<CSVHeaderConfig>} The Collection Unit dynamic header config
   */
  async _getCollectionUnitDynamicHeaderConfig(): Promise<CSVHeaderConfig> {
    const rowDictionary: { [tsn: number]: { [header: string]: { [unit: string]: string } } } = {};

    const rowTsns = this.configUtils.getUniqueCellValues('ITIS_TSN');
    // Get the collection units for all the tsns in the worksheet
    const collectionUnits = await Promise.all(
      rowTsns.map((tsn) => this.critterbaseService.findTaxonCollectionUnits(tsn))
    );

    collectionUnits.forEach((collectionUnits, index) => {
      collectionUnits.forEach((unit) => {
        const category = unit.category_name.toUpperCase();
        const tsn = Number(rowTsns[index]);
        const unitName = unit.unit_name.toLowerCase();
        // Using lodash to easily set nested object properties without worrying about undefined
        set(rowDictionary, `${tsn}.${category}.${unitName}`, unit.collection_unit_id);
      });
    });

    return {
      validateCell: getCritterCollectionUnitCellValidator(rowDictionary, this.configUtils),
      setCellValue: getCritterCollectionUnitCellSetter(rowDictionary, this.configUtils)
    };
  }
}
