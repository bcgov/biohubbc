import { merge, set } from 'lodash';
import { v4 } from 'uuid';
import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVConfig, CSVHeaderConfig, CSVRow } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getLogger } from '../../../utils/logger';
import { CritterbaseService, IBulkCreate } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { PlatformService } from '../../platform-service';
import { SurveyCritterService } from '../../survey-critter-service';

const defaultLog = getLogger('services/import/import-critters-service');

const SEX_MEASUREMENT_NAME = 'sex';

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
        WLH_ID: { aliases: ['WILDLIFE_HEALTH_ID'] },
        DESCRIPTION: { aliases: ['COMMENTS', 'COMMENT', 'NOTES'] }
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
    const [tsnHeaderConfig, aliasHeaderConfig, sexHeaderConfig, dynamicHeadersConfig] = await Promise.allSettled([
      this._getTsnHeaderConfig(),
      this._getAliasHeaderConfig(),
      this._getSexHeaderConfig(),
      this._getCollectionUnitDynamicHeaderConfig()
    ]);

    if (tsnHeaderConfig.status === 'fulfilled') {
      merge(this._config.staticHeadersConfig.ITIS_TSN, tsnHeaderConfig.value);
    }

    if (aliasHeaderConfig.status === 'fulfilled') {
      merge(this._config.staticHeadersConfig.ALIAS, aliasHeaderConfig.value);
    }

    if (sexHeaderConfig.status === 'fulfilled') {
      merge(this._config.staticHeadersConfig.SEX, sexHeaderConfig.value);

      if (dynamicHeadersConfig.status === 'fulfilled') {
        this._config.dynamicHeadersConfig = dynamicHeadersConfig.value;
        this._config.ignoreDynamicHeaders = true;
      }
    }

    merge(this._config.staticHeadersConfig.WLH_ID, this._getWlhIdHeaderConfig());
    merge(this._config.staticHeadersConfig.DESCRIPTION, this._getDescriptionHeaderConfig());

    this._config.ignoreDynamicHeaders = true;

    console.log(this._config);

    return this._config;
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
    const tsnSet = new Set(taxonomy.map((taxon) => taxon.tsn));

    return {
      validateCell: (params) => {
        const cellErrors = this.configUtils.validateZodCell(params, z.number().min(0));

        if (cellErrors.length) {
          return cellErrors;
        }

        if (!tsnSet.has(Number(params.cell))) {
          cellErrors.push({
            error: `ITIS has no reference of this TSN`,
            solution: `Use valid ITIS TSN`,
            ...this.configUtils.getParamsError(params)
          });
        }

        return cellErrors;
      }
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
    const sexRecord: { [tsn: number]: { [sex: string]: string } } = {};

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
          set(sexRecord, `${tsn}.${sexLabel}`, option.qualitative_option_id);
        });
      }
    });

    return {
      validateCell: (params) => {
        const cellErrors = this.configUtils.validateZodCell(params, z.string());

        if (cellErrors.length) {
          return cellErrors;
        }

        const rowTsn = Number(this.configUtils.getCellValue('ITIS_TSN', params.row));
        const cellValue = String(params.cell).toLowerCase();

        if (!sexRecord?.[rowTsn]) {
          cellErrors.push({
            error: `Sex is not a supported attribute for TSN: ${rowTsn}`,
            solution: `Use a valid TSN that supports sex, or contact a system administrator to add additional sex values.`,
            ...this.configUtils.getParamsError(params)
          });
        } else if (!sexRecord[rowTsn]?.[cellValue]) {
          cellErrors.push({
            error: `Sex option invalid`,
            solution: `Use valid sex option`,
            values: Object.keys(sexRecord[rowTsn]),
            ...this.configUtils.getParamsError(params)
          });
        }

        return cellErrors;
      },
      setCellValue: (params) => {
        const rowTsn = Number(this.configUtils.getCellValue('ITIS_TSN', params.row));
        const cellValue = String(params.cell).toLowerCase();

        return sexRecord[rowTsn][cellValue];
      }
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

    const rowAliases = this.configUtils.getCellValues('ALIAS');
    const uniqueRowAliases = [...new Set(rowAliases)];

    return {
      validateCell: (params) => {
        const cellErrors = this.configUtils.validateZodCell(params, z.string().max(50));

        if (cellErrors.length) {
          return cellErrors;
        }

        if (surveyAliases.has(String(params.cell))) {
          cellErrors.push({
            error: `Critter alias already exists in the Survey`,
            solution: `Update the alias to be unique`,
            ...this.configUtils.getParamsError(params)
          });
        }

        if (uniqueRowAliases.length !== rowAliases.length) {
          cellErrors.push({
            error: `Critter alias already exists in the CSV`,
            solution: `Update the alias to be unique`,
            ...this.configUtils.getParamsError(params)
          });
        }

        return cellErrors;
      }
    };
  }

  /**
   * Get the CSV Wildlife Health ID header config.
   *
   * Validation rules:
   *  1. Wildlife Health ID must be a string or undefined.
   *  2. Wildlife Health ID must be in the format 'XX-XXXX'.
   *
   * @returns {CSVHeaderConfig} The Wildlife Health ID header config
   */
  _getWlhIdHeaderConfig(): CSVHeaderConfig {
    return {
      validateCell: (params) => {
        const cellErrors = this.configUtils.validateZodCell(params, z.string().optional());

        if (cellErrors.length || !params.cell) {
          return cellErrors;
        }

        if (!/^\d{2}-.+/.exec(String(params.cell))) {
          cellErrors.push({
            error: `Invalid Wildlife Health ID format`,
            solution: `Wildlife Health ID must be in the format 'XX-XXXX'`,
            ...this.configUtils.getParamsError(params)
          });
        }

        return cellErrors;
      }
    };
  }

  /**
   * Get the CSV Description header config.
   *
   * Validation rules:
   *  1. Description must be a string or undefined.
   *
   * @returns {CSVHeaderConfig} The Description header config
   */
  _getDescriptionHeaderConfig(): CSVHeaderConfig {
    return {
      validateCell: (params) => this.configUtils.validateZodCell(params, z.string().max(250).optional())
    };
  }

  /**
   * Get the CSV Collection Unit dynamic header config.
   *
   * @returns {Promise<CSVHeaderConfig>} The Collection Unit dynamic header config
   */
  async _getCollectionUnitDynamicHeaderConfig(): Promise<CSVHeaderConfig> {
    const unitRecord: { [tsn: string]: { [header: number]: { [unit: string]: string } } } = {};

    const rowTsns = this.configUtils.getUniqueCellValues('ITIS_TSN');

    // Get the collection units for all the tsns in the worksheet
    const tsnCollectionUnits = await Promise.all(
      rowTsns.map((tsn) => this.critterbaseService.findTaxonCollectionUnits(tsn))
    ).catch(() => []);

    tsnCollectionUnits.forEach((collectionUnits, index) => {
      collectionUnits.forEach((unit) => {
        const category = unit.category_name.toUpperCase();
        const tsn = Number(rowTsns[index]);
        const unitName = unit.unit_name.toLowerCase();
        // Using lodash to easily set nested object properties without worrying about undefined
        set(unitRecord, `${tsn}.${category}.${unitName}`, unit.collection_unit_id);
      });
    });

    return {
      validateCell: (params) => {
        const cellErrors = this.configUtils.validateZodCell(params, z.string().max(50).optional());

        if (cellErrors.length || !params.cell) {
          return cellErrors;
        }

        const tsn = Number(this.configUtils.getCellValue('ITIS_TSN', params.row));
        const unit = String(params.cell).toLowerCase();

        if (!unitRecord?.[tsn]) {
          cellErrors.push({
            error: `TSN ${tsn} has no collection units`,
            solution: `Validate TSN is correct and has collection units`,
            ...this.configUtils.getParamsError(params)
          });
        } else if (!unitRecord[tsn]?.[params.header]) {
          cellErrors.push({
            error: `Invalid collection category header`,
            solution: `Use valid collection unit category header`,
            values: Object.keys(unitRecord[tsn]),
            ...this.configUtils.getParamsError(params)
          });
        } else if (!unitRecord[tsn][params.header]?.[unit]) {
          cellErrors.push({
            error: `Invalid collection unit cell value`,
            solution: `Use valid collection unit cell value`,
            values: Object.keys(unitRecord[params.header][unit]),
            ...this.configUtils.getParamsError(params)
          });
        }

        return cellErrors;
      },
      setCellValue: (params) => {
        if (!params.cell) {
          return undefined;
        }

        const tsn = Number(this.configUtils.getCellValue('ITIS_TSN', params.row));
        const cellValue = String(params.cell).toLowerCase();

        return unitRecord[tsn][params.header][cellValue];
      }
    };
  }
}
