import { v4 } from 'uuid';
import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import {
  CSVConfig,
  CSVError,
  CSVHeaderConfig,
  CSVRowValidated
} from '../../../utils/csv-utils/csv-config-validation.interface';
import { getDescriptionCellValidator } from '../../../utils/csv-utils/csv-header-configs';
import { getAllAliases } from '../../../utils/csv-utils/csv-helpers';
import { getTaxonRowValidator } from '../../../utils/csv-utils/row-validators/taxon-row-validator';
import { getLogger } from '../../../utils/logger';
import { NestedRecord } from '../../../utils/nested-record';
import { CritterbaseService, IBulkCreate } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { PlatformService } from '../../platform-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { getTaxonFromRowState } from '../utils/row-state';
import { getTaxonMap, getTsnsFromTaxonMap } from '../utils/taxon';
import {
  getCritterAliasCellValidator,
  getCritterCollectionUnitCellValidator,
  getCritterSexCellValidator,
  getWlhIDCellValidator
} from './utils/critter-header-configs';

const defaultLog = getLogger('services/import/import-critters-service');

// Critter CSV static headers
export type CritterCSVStaticHeader = 'SPECIES' | 'ALIAS' | 'SEX' | 'WLH_ID' | 'DESCRIPTION';

/**
 *
 * ImportCrittersService
 *
 * @class ImportCrittersService
 * @extends DBService
 *
 */
export class ImportCrittersService extends DBService {
  surveyId: number;
  worksheet: WorkSheet;

  utils: CSVConfigUtils<CritterCSVStaticHeader>;

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

    const initialConfig: CSVConfig<CritterCSVStaticHeader> = {
      staticHeadersConfig: {
        SPECIES: { aliases: getAllAliases(['TAXON', 'TSN', 'ITIS_TSN', 'SCIENTIFIC_NAME']) },
        ALIAS: { aliases: getAllAliases(['NICKNAME', 'NAME', 'ANIMAL_ID']) },
        SEX: { aliases: [], optional: true },
        WLH_ID: { aliases: getAllAliases(['WILDLIFE_HEALTH_ID', 'WLHID']) },
        DESCRIPTION: { aliases: ['COMMENTS', 'COMMENT', 'NOTES'], optional: true }
      },
      ignoreDynamicHeaders: false
    };

    this.surveyId = surveyId;
    this.worksheet = worksheet;

    this.utils = new CSVConfigUtils(worksheet, initialConfig);

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
   * @returns {*} {Promise<CSVError[]>} List of CSV errors encountered during import
   */
  async importCSVWorksheet(): Promise<CSVError[]> {
    const config = await this.getCSVConfig();

    const { errors, rows } = validateCSVWorksheet(this.worksheet, config);

    if (errors.length) {
      return errors;
    }

    const payloads = this._getImportPayloads(rows);

    // Add critters to Critterbase
    const bulkResponse = await this.critterbaseService.bulkCreate(payloads.critterbasePayload);

    // Check critterbase inserted the full list of critters
    // In reality this error should not be triggered, safeguard to prevent floating critter ids in SIMS
    if (bulkResponse.created.critters !== payloads.simsPayload.length) {
      throw new ApiGeneralError('Unable to fully import critters from CSV', [
        'importCrittersService->importCSVWorksheet',
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
   * @returns {*} {Promise<CSVConfig<CritterCSVStaticHeader>>} The Critter CSV config
   */
  async getCSVConfig(): Promise<CSVConfig<CritterCSVStaticHeader>> {
    // Generate the taxon map from the worksheet taxon identifiers
    const taxonIdentifiers = this.utils.getUniqueCellValues('SPECIES').filter(Boolean) as Array<string | number>;
    const taxonMap = await getTaxonMap(taxonIdentifiers, this.platformService);

    // this should only contain valid TSNs
    const worksheetTsns = getTsnsFromTaxonMap(taxonMap);

    // Get the header configs in parallel
    const [aliasHeaderConfig, sexHeaderConfig, dynamicHeadersConfig] = await Promise.all([
      this._getAliasHeaderConfig(),
      this._getSexHeaderConfig(worksheetTsns),
      this._getCollectionUnitDynamicHeaderConfig(worksheetTsns)
    ]);

    // Set the static header configs
    this.utils.setAllStaticHeaderConfigs({
      // SPECIES is handled by the taxon row validator
      SPECIES: { validateCell: () => [] },
      ALIAS: aliasHeaderConfig,
      SEX: sexHeaderConfig,
      WLH_ID: { validateCell: getWlhIDCellValidator(this.utils) },
      DESCRIPTION: { validateCell: getDescriptionCellValidator({ optional: true }) }
    });

    // Add the taxon row validator - validates the taxon / tsn and sets the TSN in the row state
    this.utils.config.rowValidators = [getTaxonRowValidator(taxonMap, this.utils, 'SPECIES')];

    // Set the dynamic header config - validates the collection unit columns
    this.utils.config.dynamicHeadersConfig = dynamicHeadersConfig;

    return this.utils.getConfig();
  }

  /**
   * Get the Critterbase and SIMS import payloads.
   *
   * @param {CSVRowValidated[]} rows - The validated CSV rows
   * @returns {*} { simsPayload: string[]; critterbasePayload: IBulkCreate } The import payloads
   */
  _getImportPayloads(rows: CSVRowValidated<CritterCSVStaticHeader>[]): {
    simsPayload: string[];
    critterbasePayload: IBulkCreate;
  } {
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
        sex_qualitative_option_id: row.SEX,
        itis_tsn: getTaxonFromRowState(row).taxon.itis_tsn,
        animal_id: row.ALIAS,
        wlh_id: row.WLH_ID,
        critter_comment: row.DESCRIPTION
      });

      // Critterbase dynamic headers payload
      this.utils.worksheetDynamicHeaders.forEach((header) => {
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
   * Get the CSV Alias header config.
   *
   * Validation rules:
   *  1. Alias must be a string
   *  2. Alias must be unique in the SIMS Survey
   *  3. Alias must be unique in the CSV
   *
   * @returns {*} {Promise<CSVHeaderConfig>} The alias header config
   */
  async _getAliasHeaderConfig(): Promise<CSVHeaderConfig> {
    const surveyAliases = await this.surveyCritterService.getUniqueSurveyCritterAliases(this.surveyId);

    return {
      validateCell: getCritterAliasCellValidator(surveyAliases, this.utils),
      setCellValue: (params) => String(params.cell)
    };
  }

  /**
   * Get the CSV Sex header config.
   *
   * Validation rules:
   *  1. Sex must be a string
   *  2. Sex must be a valid option in Critterbase for the TSN
   *
   * @param {number[]} worksheetTsns - The worksheet tsns
   * @returns {*} {CSVHeaderConfig} The sex header config
   */
  async _getSexHeaderConfig(worksheetTsns: number[]): Promise<CSVHeaderConfig> {
    const rowDictionary = new NestedRecord<string>();

    // Get the measurements for all the taxon identifiers
    const measurements = await Promise.all(
      worksheetTsns.map((tsn) => this.critterbaseService.getTaxonMeasurements(tsn))
    );

    // Populate the row dictionary with the tsn and measurement sex label
    measurements.forEach((measurement, index) => {
      const sexMeasurement = measurement.qualitative.find(
        (measurement) => measurement.measurement_name.toLowerCase() === 'sex'
      );

      if (sexMeasurement) {
        sexMeasurement.options.forEach((option) => {
          const tsn = worksheetTsns[index];
          const sexLabel = option.option_label;

          rowDictionary.set({ path: [tsn, sexLabel], value: option.qualitative_option_id });
        });
      }
    });

    return {
      validateCell: getCritterSexCellValidator(rowDictionary)
    };
  }

  /**
   * Get the CSV Collection Unit dynamic header config.
   *
   * @param {number[]} worksheetTsns - The worksheet tsns
   * @returns {*} {Promise<CSVHeaderConfig>} The Collection Unit dynamic header config
   */
  async _getCollectionUnitDynamicHeaderConfig(worksheetTsns: number[]): Promise<CSVHeaderConfig> {
    const rowDictionary = new NestedRecord<string>();

    // Get the collection units for all the tsns in the worksheet
    const collectionUnits = await Promise.all(
      worksheetTsns.map((tsn) => this.critterbaseService.findTaxonCollectionUnits(tsn))
    );

    collectionUnits.forEach((collectionUnits, index) => {
      collectionUnits.forEach((unit) => {
        const category = unit.category_name;
        const tsn = Number(worksheetTsns[index]);
        const unitName = unit.unit_name;

        rowDictionary.set({
          path: [tsn, category, unitName],
          value: unit.collection_unit_id
        });

        rowDictionary.set({ path: [tsn, category, unitName], value: unit.collection_unit_id });
      });
    });

    return {
      validateCell: getCritterCollectionUnitCellValidator(rowDictionary)
    };
  }
}
