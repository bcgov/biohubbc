import { merge, set } from 'lodash';
import { v4 } from 'uuid';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVConfig, CSVHeaderConfig, CSVRow } from '../../../utils/csv-utils/csv-config-validation.interface';
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
  getAliasCellValidator,
  getCollectionUnitCellSetter,
  getCollectionUnitCellValidator,
  getSexCellSetter,
  getSexCellValidator
} from './critter-header-configs';

const defaultLog = getLogger('services/import/import-critters-service');

const SEX_MEASUREMENT_NAME = 'sex';

// Critter CSV static headers
type CritterHeaders = 'ITIS_TSN' | 'SEX' | 'ALIAS' | 'WLH_ID' | 'DESCRIPTION';

/**
 *
 * ImportCSVCritters
 *
 * @class ImportCSVCritters
 * @extends DBService
 *
 */
export class ImportCSVCritters extends DBService {
  _config: CSVConfig<CritterHeaders>;

  surveyId: number;
  worksheet: WorkSheet;

  configUtils: CSVConfigUtils<CSVConfig<CritterHeaders>>;

  platformService: PlatformService;
  critterbaseService: CritterbaseService;
  surveyCritterService: SurveyCritterService;

  /**
   * Instantiates an instance of ImportCSVCritters
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
   * Get the Critter CSV config asynchonously.
   *
   * @returns {Promise<CSVConfig<CritterHeaders>>} The Critter CSV config
   */
  async getCSVConfig(): Promise<CSVConfig<CritterHeaders>> {
    const [tsnHeaderConfig, aliasHeaderConfig, sexHeaderConfig, dynamicHeadersConfig] = await Promise.all([
      this._getTsnHeaderConfig(),
      this._getAliasHeaderConfig(),
      this._getSexHeaderConfig(),
      this._getCollectionUnitDynamicHeaderConfig()
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
   * Insert CSV critters into Critterbase and SIMS.
   *
   * @async
   * @param {CSVRow[]} validatedRows - Validated rows
   * @throws {ApiGeneralError} - If unable to fully insert records into Critterbase
   * @returns {Promise<number[]>} List of inserted survey critter ids
   */
  async importCSVRows(validatedRows: CSVRow[]) {
    const simsPayload: string[] = [];
    const critterbasePayload: IBulkCreate = { critters: [], collections: [] };

    // Convert rows to Critterbase and SIMS payloads
    for (const row of validatedRows) {
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

    //// Add critters to Critterbase
    //const bulkResponse = await this.critterbaseService.bulkCreate(critterbasePayload);
    //
    //// Check critterbase inserted the full list of critters
    //// In reality this error should not be triggered, safeguard to prevent floating critter ids in SIMS
    //if (bulkResponse.created.critters !== simsPayload.length) {
    //  throw new ApiGeneralError('Unable to fully import critters from CSV', [
    //    'importCrittersStrategy -> insertCsvCrittersIntoSimsAndCritterbase',
    //    'critterbase bulk create response count !== critterIds.length'
    //  ]);
    //}
    //
    //// Add Critters to SIMS survey
    //return this.surveyCritterService.addCrittersToSurvey(this.surveyId, simsPayload);
    return [];
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
      validateCell: getAliasCellValidator(surveyAliases, this.configUtils)
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
  async _getSexHeaderConfig(): Promise<CSVHeaderConfig | undefined> {
    try {
      const rowDictionary: { [tsn: number]: { [sex: string]: string } } = {};
      const rowTsns = this.configUtils.getUniqueCellValues('ITIS_TSN');
      const measurements = await Promise.all(rowTsns.map((tsn) => this.critterbaseService.getTaxonMeasurements(tsn)));

      measurements.forEach((measurement, index) => {
        const sexMeasurement = measurement.qualitative.find(
          (measurement) => measurement.measurement_name.toLowerCase() === SEX_MEASUREMENT_NAME
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
        validateCell: getSexCellValidator(rowDictionary, this.configUtils),
        setCellValue: getSexCellSetter(rowDictionary, this.configUtils)
      };
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Get the CSV Collection Unit dynamic header config.
   *
   * Note: Catches errors and returns undefined when unable to fetch collection units.
   * This is to prevent the entire import from failing when invalid TSNs are provided.
   *
   * @returns {Promise<CSVHeaderConfig>} The Collection Unit dynamic header config
   */
  async _getCollectionUnitDynamicHeaderConfig(): Promise<CSVHeaderConfig | undefined> {
    try {
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
        validateCell: getCollectionUnitCellValidator(rowDictionary, this.configUtils),
        setCellValue: getCollectionUnitCellSetter(rowDictionary, this.configUtils)
      };
    } catch (err) {
      return undefined;
    }
  }
}
