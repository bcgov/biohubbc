import { keys, omit, toUpper, uniq } from 'lodash';
import { v4 as uuid } from 'uuid';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { getLogger } from '../../../utils/logger';
import { getTsnMeasurementTypeDefinitionMap } from '../../../utils/observation-xlsx-utils/measurement-column-utils';
import { CSV_COLUMN_ALIASES } from '../../../utils/xlsx-utils/column-aliases';
import { generateCellGetterFromColumnValidator } from '../../../utils/xlsx-utils/column-validator-utils';
import { getNonStandardColumnNamesFromWorksheet, IXLSXCSVValidator } from '../../../utils/xlsx-utils/worksheet-utils';
import {
  CBQualitativeOption,
  CritterbaseService,
  IBulkCreate,
  ICollection,
  ICollectionUnitWithCategory,
  ICreateCritter
} from '../../critterbase-service';
import { DBService } from '../../db-service';
import { PlatformService } from '../../platform-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { CSVImportStrategy, Row, Validation, ValidationError } from '../import-csv.interface';
import { CsvCritter, PartialCsvCritter } from './import-critters-strategy.interface';

const defaultLog = getLogger('services/import/import-critters-service');

/**
 *
 * ImportCrittersStrategy - Injected into CSVImportStrategy as the CSV import dependency
 *
 * @example new CSVImportStrategy(new ImportCrittersStrategy(connection, surveyId)).import(file);
 *
 * @class ImportCrittersStrategy
 * @extends DBService
 *
 */
export class ImportCrittersStrategy extends DBService implements CSVImportStrategy {
  platformService: PlatformService;
  critterbaseService: CritterbaseService;
  surveyCritterService: SurveyCritterService;

  surveyId: number;

  /**
   * An XLSX validation config for the standard columns of a Critter CSV.
   *
   * Note: `satisfies` allows `keyof` to correctly infer key types, while also
   * enforcing uppercase object keys.
   */
  columnValidator = {
    ITIS_TSN: { type: 'number', aliases: CSV_COLUMN_ALIASES.ITIS_TSN },
    SEX: { type: 'string', optional: true },
    ALIAS: { type: 'string', aliases: CSV_COLUMN_ALIASES.ALIAS },
    WLH_ID: { type: 'string', optional: true },
    DESCRIPTION: { type: 'string', aliases: CSV_COLUMN_ALIASES.DESCRIPTION, optional: true }
  } satisfies IXLSXCSVValidator;

  /**
   * Instantiates an instance of ImportCrittersStrategy
   *
   * @param {IDBConnection} connection - Database connection
   * @param {number} surveyId - Survey identifier
   */
  constructor(connection: IDBConnection, surveyId: number) {
    super(connection);

    this.surveyId = surveyId;

    this.platformService = new PlatformService(connection);
    this.surveyCritterService = new SurveyCritterService(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get non-standard columns (collection unit columns) from worksheet.
   *
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @returns {string[]} Array of non-standard headers from CSV (worksheet)
   */
  _getNonStandardColumns(worksheet: WorkSheet) {
    return uniq(getNonStandardColumnNamesFromWorksheet(worksheet, this.columnValidator));
  }

  /**
   * Get critter from properties from row.
   *
   * @param {CsvCritter} row - Row object as CsvCritter
   * @returns {ICreateCritter} Create critter object
   */
  _getCritterFromRow(row: CsvCritter): ICreateCritter {
    return {
      critter_id: row.critter_id,
      sex_qualitative_option_id: row.sex ?? null,
      itis_tsn: row.itis_tsn,
      animal_id: row.animal_id,
      wlh_id: row.wlh_id,
      critter_comment: row.critter_comment
    };
  }

  /**
   * Get list of collection units from row.
   *
   * @param {CsvCritter} row - Row object as a CsvCritter
   * @returns {ICollection[]} Array of collection units
   */
  _getCollectionUnitsFromRow(row: CsvCritter): ICollection[] {
    const critterId = row.critter_id;

    // Get portion of row object that is not a critter
    const partialRow: { [key: keyof ICreateCritter | keyof CsvCritter]: any } = omit(row, [
      ...keys(this._getCritterFromRow(row)),
      'sex' as keyof CsvCritter
    ]);

    console.log(partialRow);

    // Keys of collection units
    const collectionUnitKeys = keys(partialRow);

    // Return an array of formatted collection units for bulk create
    return collectionUnitKeys
      .filter((key) => partialRow[key])
      .map((key) => ({ collection_unit_id: partialRow[key], critter_id: critterId }));
  }

  /**
   * Get a Set of valid ITIS TSNS from xlsx worksheet rows.
   *
   * @async
   * @returns {Promise<string[]>} Unique Set of valid TSNS from worksheet.
   */
  async _getValidTsns(rows: PartialCsvCritter[]): Promise<string[]> {
    // Get a unique list of tsns from worksheet
    const critterTsns = uniq(rows.map((row) => String(row.itis_tsn)));

    // Query the platform service (taxonomy) for matching tsns
    const taxonomy = await this.platformService.getTaxonomyByTsns(critterTsns);

    return taxonomy.map((taxon) => taxon.tsn);
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

    const collectionUnitColumns = this._getNonStandardColumns(worksheet);

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
        // TODO: Is this correct?
        collectionUnitMap.set(toUpper(collectionUnits[0].category_name), { collectionUnits, tsn: Number(tsns[index]) });
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
   * Parse the CSV rows into the Critterbase critter format.
   *
   * @param {Row[]} rows - CSV rows
   * @param {string[]} collectionUnitColumns - Non standard columns
   * @returns {PartialCsvCritter[]} CSV critters before validation
   */
  _getRowsToValidate(rows: Row[], collectionUnitColumns: string[]): PartialCsvCritter[] {
    const getCellValue = generateCellGetterFromColumnValidator(this.columnValidator);

    return rows.map((row) => {
      // Standard critter properties from CSV
      const standardCritterRow = {
        critter_id: uuid(), // Generate a uuid for each critter for convienence
        sex: getCellValue(row, 'SEX'),
        itis_tsn: getCellValue(row, 'ITIS_TSN'),
        wlh_id: getCellValue(row, 'WLH_ID'),
        animal_id: getCellValue(row, 'ALIAS'),
        critter_comment: getCellValue(row, 'DESCRIPTION')
      };

      // All other properties must be collection units ie: `population unit` or `herd unit` etc...
      collectionUnitColumns.forEach((categoryHeader) => {
        standardCritterRow[categoryHeader] = row[categoryHeader];
      });

      return standardCritterRow;
    });
  }

  /**
   * Validate CSV worksheet rows against reference data.
   *
   * @async
   * @param {Row[]} rows - Invalidated CSV rows
   * @param {WorkSheet} worksheet - Xlsx worksheet
   * @returns {Promise<Validation<CsvCritter>>} Conditional validation object
   */
  async validateRows(rows: Row[], worksheet: WorkSheet): Promise<Validation<CsvCritter>> {
    const nonStandardColumns = this._getNonStandardColumns(worksheet);
    const rowsToValidate = this._getRowsToValidate(rows, nonStandardColumns);

    // Retrieve the dynamic validation config
    const [validRowTsns, surveyCritterAliases] = await Promise.all([
      this._getValidTsns(rowsToValidate),
      this.surveyCritterService.getUniqueSurveyCritterAliases(this.surveyId)
    ]);
    const collectionUnitMap = await this._getCollectionUnitMap(worksheet, validRowTsns);

    // Get sex options for each species being imported
    const sexMap = await this._getSpeciesSexMap(validRowTsns);

    // Parse reference data for validation
    const tsnSet = new Set(validRowTsns.map((tsn) => Number(tsn)));
    const csvCritterAliases = rowsToValidate.map((row) => row.animal_id);

    // Track the row validation errors
    const errors: ValidationError[] = [];

    const csvCritters = rowsToValidate.map((row, index) => {
      const tsn = row.itis_tsn;

      /**
       * --------------------------------------------------------------------
       *                      STANDARD ROW VALIDATION
       * --------------------------------------------------------------------
       */

      // WLH_ID must follow regex pattern
      const invalidWlhId = row.wlh_id && !/^\d{2}-.+/.exec(row.wlh_id);
      // ITIS_TSN is required and be a valid TSN
      const invalidTsn = !tsn || !tsnSet.has(tsn);
      // ALIAS is required and must not already exist in Survey or CSV
      const invalidAlias =
        !row.animal_id ||
        surveyCritterAliases.has(row.animal_id) ||
        csvCritterAliases.filter((value) => value === row.animal_id).length > 1;

      if (invalidWlhId) {
        errors.push({
          row: index,
          message: `Wildlife health ID ${row.wlh_id} is incorrectly formatted. Expected a 2-digit hyphenated prefix like '18-98491'.`
        });
      }
      if (invalidTsn) {
        errors.push({ row: index, message: `Species TSN ${tsn} does not exist.` });
      }
      if (invalidAlias) {
        errors.push({
          row: index,
          message: `Animal ${row.animal_id} already exists in the Survey. Duplicate names are not allowed.`
        });
      }

      /**
       * --------------------------------------------------------------------
       *                      SEX VALIDATION
       * --------------------------------------------------------------------
       */
      if (tsn) {
        // Get the sex options from the sexMap
        const sexOptionsForTsn = sexMap.get(tsn);

        // If no sex value is given, delete the sex column
        if (!row.sex) {
          delete row.sex;
        }

        // If a sex value is given but sex is not allowed for the tsn, add an error message
        if (!sexOptionsForTsn && row.sex) {
          errors.push({
            row: index,
            message: `Sex is not a supported attribute for TSN ${tsn}. Please contact a system administrator if it should be.`
          });
        }

        // If sex is allowed and a value is given, look for a matching quantitative_option_id
        if (sexOptionsForTsn && row.sex) {
          const sexMatch = sexOptionsForTsn.sexes.find(
            (sex) => sex.option_label.toLowerCase() === row.sex?.toLowerCase()
          );

          // If the given value is not valid, add an error message
          if (!sexMatch) {
            errors.push({
              row: index,
              message: `${sexMatch} is not a valid sex option for TSN ${tsn}. Did you mean one of ${sexOptionsForTsn.sexes.join(
                ','
              )}`
            });
          } else {
            // If the value is valid, update the cell with the qualitative_option_id
            row.sex = sexMatch.qualitative_option_id;
          }
        }
      }

      /**
       * --------------------------------------------------------------------
       *                      NON-STANDARD ROW VALIDATION
       * --------------------------------------------------------------------
       */

      nonStandardColumns.forEach((column) => {
        const collectionUnitColumn = collectionUnitMap.get(column);
        // Remove property if undefined or not a collection unit
        if (!collectionUnitColumn || !row[column]) {
          delete row[column];
          return;
        }
        // Attempt to find the collection unit with the cell value from the mapping
        const collectionUnitMatch = collectionUnitColumn.collectionUnits.find(
          (unit) => unit.unit_name.toLowerCase() === String(row[column]).toLowerCase()
        );
        // Collection unit must be a valid value
        if (!collectionUnitMatch) {
          errors.push({ row: index, message: `Invalid ${column}. Cell value is not valid.` });
        }
        // Collection unit must have correct TSN mapping
        else if (row.itis_tsn !== collectionUnitColumn.tsn) {
          errors.push({ row: index, message: `Invalid ${column}. Cell value not allowed for TSN.` });
        } else {
          // Update the cell to be the collection unit id
          row[column] = collectionUnitMatch.collection_unit_id;
        }
      });

      return row;
    });

    // If validation successful the rows should all be CsvCritters
    if (!errors.length) {
      return { success: true, data: csvCritters as CsvCritter[] };
    }

    return { success: false, error: { issues: errors } };
  }

  /**
   * Insert CSV critters into Critterbase and SIMS.
   *
   * @async
   * @param {CsvCritter[]} critterRows - CSV row critters
   * @throws {ApiGeneralError} - If unable to fully insert records into Critterbase
   * @returns {Promise<number[]>} List of inserted survey critter ids
   */
  async insert(critterRows: CsvCritter[]): Promise<number[]> {
    const simsPayload: string[] = [];
    const critterbasePayload: IBulkCreate = { critters: [], collections: [] };

    // Convert rows to Critterbase and SIMS payloads
    for (const row of critterRows) {
      simsPayload.push(row.critter_id);
      critterbasePayload.critters?.push(this._getCritterFromRow(row));
      critterbasePayload.collections = critterbasePayload.collections?.concat(this._getCollectionUnitsFromRow(row));
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
