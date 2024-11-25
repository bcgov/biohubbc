import { merge, toUpper } from 'lodash';
import { v4 } from 'uuid';
import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { validateZodCell } from '../../../utils/csv-utils/csv-cells';
import { getCSVCellValue, getCSVWorksheetDynamicHeaders } from '../../../utils/csv-utils/csv-config-utils';
import { CSVConfig, CSVHeaderConfig, CSVRow } from '../../../utils/csv-utils/csv-config-utils.interface';
import { getLogger } from '../../../utils/logger';
import { getTsnMeasurementTypeDefinitionMap } from '../../../utils/observation-xlsx-utils/measurement-column-utils';
import { getWorksheetRowObjects } from '../../../utils/xlsx-utils/worksheet-utils';
import {
  CBQualitativeOption,
  CritterbaseService,
  IBulkCreate,
  ICollectionUnitWithCategory
} from '../../critterbase-service';
import { DBService } from '../../db-service';
import { PlatformService } from '../../platform-service';
import { SurveyCritterService } from '../../survey-critter-service';

const defaultLog = getLogger('services/import/import-critters-service');

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
  worksheetRows: CSVRow[];

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
        SEX: { aliases: [] },
        WLH_ID: { aliases: ['WILDLIFE_HEALTH_ID'] },
        DESCRIPTION: { aliases: ['COMMENTS', 'COMMENT', 'NOTES'] }
      },
      ignoreDynamicHeaders: false
    };

    this.surveyId = surveyId;
    this.worksheet = worksheet;
    this.worksheetRows = getWorksheetRowObjects(worksheet);

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

    const wlhIdHeaderConfig = this._getWlhIdHeaderConfig();
    const descriptionHeaderConfig = this._getDescriptionHeaderConfig();

    // Recursively merges the default config with the async header configs
    const newConfig = merge(this._config, {
      staticHeadersConfig: {
        ITIS_TSN: tsnHeaderConfig,
        ALIAS: aliasHeaderConfig,
        SEX: sexHeaderConfig,
        WLH_ID: wlhIdHeaderConfig,
        DESCRIPTION: descriptionHeaderConfig
      },
      dynamicHeadersConfig: dynamicHeadersConfig
    });

    return newConfig;
  }

  /**
   * Get the TSN header config.
   *
   * @returns {Promise<CSVHeaderConfig>} The TSN header config
   */
  async _getTsnHeaderConfig(): Promise<CSVHeaderConfig> {
    const allRowTsns = this.worksheetRows.map((row) => String(getCSVCellValue('ITIS_TSN', row, this._config)));

    const taxonomy = await this.platformService.getTaxonomyByTsns(allRowTsns);
    const tsnSet = new Set(taxonomy.map((t) => t.tsn));

    return {
      validateCell: (params) => {
        const cellErrors = validateZodCell(params, z.number().min(0));

        if (!tsnSet.has(Number(params.cell))) {
          cellErrors.push({
            error: `ITIS has no reference of this TSN`,
            solution: `Use valid ITIS TSN`,
            cell: params.cell,
            header: params.header,
            rowIndex: params.rowIndex
          });
        }

        return cellErrors;
      }
    };
  }

  /**
   * Get the CSV Sex header config.
   *
   * @returns {CSVHeaderConfig} The sex header config
   */
  async _getSexHeaderConfig(): Promise<CSVHeaderConfig> {
    const allRowTsns = this.worksheetRows.map((row) => String(getCSVCellValue('ITIS_TSN', row, this._config)));

    const sexMap = await this._getSpeciesSexMap(allRowTsns);

    return {
      validateCell: (params) => {
        const cellErrors = validateZodCell(params, z.string());

        const rowTsn = Number(getCSVCellValue('ITIS_TSN', params.row, this._config));
        const sexOptionMatch = sexMap.get(rowTsn);

        if (!sexOptionMatch) {
          cellErrors.push({
            error: `Sex is not a supported attribute for TSN: ${rowTsn}`,
            solution: `Use a valid TSN that supports sex, or contact a system administrator to add additional sex values.`,
            cell: params.cell,
            header: params.header,
            rowIndex: params.rowIndex
          });
        }

        if (sexOptionMatch) {
          const sexOption = sexOptionMatch.sexes.find(
            (option) => option.option_label.toLowerCase() === String(params.cell).toLowerCase()
          );

          if (!sexOption) {
            cellErrors.push({
              error: `Sex option not found for TSN: ${rowTsn}`,
              solution: `Use valid sex option`,
              values: sexOptionMatch.sexes.map((option) => option.option_label),
              cell: params.cell,
              header: params.header,
              rowIndex: params.rowIndex
            });
          }
        }

        return cellErrors;
      }
    };
  }

  async _getAliasHeaderConfig(): Promise<CSVHeaderConfig> {
    const surveyAliases = await this.surveyCritterService.getUniqueSurveyCritterAliases(this.surveyId);

    return {
      validateCell: (params) => {
        const cellErrors = validateZodCell(params, z.string().max(50));

        if (surveyAliases.has(String(params.cell))) {
          cellErrors.push({
            error: `Critter alias already exists in the Survey`,
            solution: `Update the alias to be unique`,
            cell: params.cell,
            header: params.header,
            rowIndex: params.rowIndex
          });
        }

        return cellErrors;
      }
    };
  }

  /**
   * Get the CSV Wildlife Health ID header config.
   *
   * Rules:
   *  1. Wildlife Health ID must be a string.
   *  2. Wildlife Health ID must be in the format 'XX-XXXX'.
   *
   * @returns {CSVHeaderConfig} The Wildlife Health ID header config
   */
  _getWlhIdHeaderConfig(): CSVHeaderConfig {
    return {
      validateCell: (params) => {
        const cellErrors = validateZodCell(params, z.string().optional());

        if (!/^\d{2}-.+/.exec(String(params.cell))) {
          cellErrors.push({
            error: `Invalid Wildlife Health ID format`,
            solution: `Wildlife Health ID must be in the format 'XX-XXXX'`,
            cell: params.cell,
            header: params.header,
            rowIndex: params.rowIndex
          });
        }

        return cellErrors;
      }
    };
  }

  _getDescriptionHeaderConfig(): CSVHeaderConfig {
    return {
      validateCell: (params) => validateZodCell(params, z.string().max(250).optional())
    };
  }

  async _getCollectionUnitDynamicHeaderConfig(): Promise<CSVHeaderConfig> {
    const allRowTsns = this.worksheetRows.map((row) => String(getCSVCellValue('ITIS_TSN', row, this._config)));

    const collectionUnitMap = await this._getCollectionUnitMap(this.worksheet, allRowTsns);

    return {
      validateCell: (params) => {
        const cellErrors = validateZodCell(params, z.string().max(50).optional());

        const collectionUnit = collectionUnitMap.get(params.header);

        if (!collectionUnit) {
          cellErrors.push({
            error: `Invalid collection unit category header`,
            solution: `Use valid collection unit category header`,
            cell: params.cell,
            header: params.header,
            rowIndex: params.rowIndex
          });
        }

        if (collectionUnit && collectionUnit.tsn !== Number(getCSVCellValue('ITIS_TSN', params.row, this._config))) {
          cellErrors.push({
            error: `Collection unit not allowed for TSN`,
            solution: `Use collection unit allowed for TSN`,
            values: collectionUnit.collectionUnits.map((unit) => unit.unit_name),
            cell: params.cell,
            header: params.header,
            rowIndex: params.rowIndex
          });
        }

        if (
          collectionUnit &&
          !collectionUnit.collectionUnits.find(
            (unit) => unit.unit_name.toLowerCase() === String(params.cell).toLowerCase()
          )
        ) {
          cellErrors.push({
            error: `Invalid collection unit`,
            solution: `Use valid collection unit`,
            values: collectionUnit.collectionUnits.map((unit) => unit.unit_name),
            cell: params.cell,
            header: params.header,
            rowIndex: params.rowIndex
          });
        }

        return cellErrors;
      },
      setCellValue: (params) => {
        const collectionUnit = collectionUnitMap.get(params.header);

        const collectionUnitId = collectionUnit?.collectionUnits.find(
          (unit) => unit.unit_name.toLowerCase() === String(params.cell).toLowerCase()
        )?.collection_unit_id;

        return collectionUnitId;
      }
    };
  }

  /**
   * Get a mapping of collection units for a list of tsns.
   * Used in the zod validation.
   *
   * @example new Map([['Population Unit', new Set(['Atlin', 'Unit B'])]]);
   *
   * @async
   * @param {WorkSheet} worksheet - Xlsx Worksheet
   * @param {string[]} tsns - List of unique and valid TSNS
   * @returns {Promise<Map<string, ICollectionUnitWithCategory[]>} Collection unit mapping
   */
  async _getCollectionUnitMap(worksheet: WorkSheet, tsns: string[]) {
    const collectionUnitMap = new Map<string, { collectionUnits: ICollectionUnitWithCategory[]; tsn: number }>();

    const collectionUnitColumns = getCSVWorksheetDynamicHeaders(worksheet, this._config);

    // If no collection unit columns return empty Map
    if (!collectionUnitColumns.length) {
      return collectionUnitMap;
    }

    // Get the collection units for all the tsns in the worksheet
    const tsnCollectionUnits = await Promise.all(
      tsns.map((tsn) => this.critterbaseService.findTaxonCollectionUnits(tsn))
    );

    tsnCollectionUnits.forEach((collectionUnits, index) => {
      if (collectionUnits.length) {
        collectionUnitMap.set(toUpper(collectionUnits[0].category_name), {
          collectionUnits: collectionUnits,
          tsn: Number(tsns[index])
        });
      }
    });

    return collectionUnitMap;
  }

  /**
   * Get a mapping of sex values for a list of tsns.
   * Used in the zod validation.
   *
   * @example new Map([['180844', new Set(['Male', 'Female'])]]);
   *
   * @async
   * @param {string[]} tsns - List of unique and valid TSNS
   * @returns {Promise<Map<string, CBQualitativeOption[]>} Sex mapping
   */
  async _getSpeciesSexMap(tsns: string[]): Promise<Map<number, { sexes: CBQualitativeOption[] }>> {
    // Initialize the sex map
    const sexMap = new Map<number, { sexes: CBQualitativeOption[] }>();

    // Fetch the measurement type definitions
    const tsnMeasurementTypeDefinitionMap = await getTsnMeasurementTypeDefinitionMap(tsns, this.critterbaseService);

    // Iterate over each TSN to populate the sexMap
    tsns.forEach((tsn) => {
      // Get the sex options for the current species
      const measurements = tsnMeasurementTypeDefinitionMap[tsn];

      // Look for a measurement called "sex" (case insensitive)
      const sexMeasurement = measurements.qualitative.find((qual) => qual.measurement_name.toLowerCase() === 'sex');

      // If there is a measurement called sex, add the options to the sexMap
      sexMap.set(Number(tsn), {
        sexes: sexMeasurement?.options ?? []
      });
    });

    return sexMap;
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

      simsPayload.push(critterId);

      critterbasePayload.critters?.push({
        critter_id: critterId,
        sex_qualitative_option_id: getCSVCellValue('SEX', row, this._config),
        itis_tsn: getCSVCellValue('ITIS_TSN', row, this._config),
        animal_id: getCSVCellValue('ALIAS', row, this._config),
        wlh_id: getCSVCellValue('WLH_ID', row, this._config),
        critter_comment: getCSVCellValue('DESCRIPTION', row, this._config)
      });

      //critterbasePayload.collections = critterbasePayload.collections?.concat(this._getCollectionUnitsFromRow(row));
    }

    defaultLog.debug({ label: 'critter import payloads', simsPayload, critterbasePayload });

    // Add critters to Critterbase
    const bulkResponse = await this.critterbaseService.bulkCreate(critterbasePayload);

    // Check critterbase inserted the full list of critters
    // In reality this error should not be triggered, safeguard to prevent floating critter ids in SIMS
    if (bulkResponse.created.critters !== simsPayload.length) {
      throw new ApiGeneralError('Unable to fully import critters from CSV', [
        'importCrittersStrategy -> insertCsvCrittersIntoSimsAndCritterbase',
        'critterbase bulk create response count !== critterIds.length'
      ]);
    }

    // Add Critters to SIMS survey
    return this.surveyCritterService.addCrittersToSurvey(this.surveyId, simsPayload);
  }
}
