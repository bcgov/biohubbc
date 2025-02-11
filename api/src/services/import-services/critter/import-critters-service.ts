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
  CSVRowState,
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
import { getTaxonMap } from '../utils/taxon';
import {
  getCritterAliasCellValidator,
  getCritterCollectionUnitCellSetter,
  getCritterCollectionUnitCellValidator,
  getCritterSexCellValidator,
  getWlhIDCellValidator
} from './critter-header-configs';

const defaultLog = getLogger('services/import/import-critters-service');

// Critter CSV static headers
export type CritterCSVStaticHeader = 'ITIS_TSN' | 'ALIAS' | 'SEX' | 'WLH_ID' | 'DESCRIPTION';

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
        ITIS_TSN: { aliases: getAllAliases(['TAXON', 'SPECIES', 'TSN', 'SCIENTIFIC_NAME']) },
        ALIAS: { aliases: getAllAliases(['NICKNAME', 'NAME', 'ANIMAL_ID']) },
        SEX: { aliases: [], optional: true },
        WLH_ID: { aliases: getAllAliases(['WILDLIFE_HEALTH_ID', 'WLHID', 'WLH_ID']) },
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
   * Note: This will simulate a multi-step validation process if the TSNs are invalid. This is because the TSNs are
   * dependencies for the other header configs, so all TSN related errors must be resolved first.
   *
   * @returns {*} {Promise<CSVConfig<CritterCSVStaticHeader>>} The Critter CSV config
   */
  async getCSVConfig(): Promise<CSVConfig<CritterCSVStaticHeader>> {
    const [aliasHeaderConfig, sexHeaderConfig, dynamicHeadersConfig] = await Promise.all([
      this._getAliasHeaderConfig(),
      this._getSexHeaderConfig().catch(() => undefined), // If this throws due to invalid TSNs, we can ignore this header till TSNs are fixed
      this._getCollectionUnitDynamicHeaderConfig().catch(() => undefined) // Same for the dynamic columns
    ]);

    // Generate the taxon map from the worksheet taxon identifiers
    const taxonIdentifiers = this.utils.getUniqueCellValues('ITIS_TSN').filter(Boolean) as Array<string | number>;
    const taxonMap = await getTaxonMap(taxonIdentifiers, this.platformService);

    this.utils.setAllStaticHeaderConfigs({
      // ITIS_TSN is handled by the taxon row validator
      ITIS_TSN: { validateCell: () => [] },
      ALIAS: aliasHeaderConfig,
      // SEX header config is only defined when the TSNs are valid
      SEX: sexHeaderConfig ?? { validateCell: () => [] },
      WLH_ID: { validateCell: getWlhIDCellValidator(this.utils) },
      DESCRIPTION: { validateCell: getDescriptionCellValidator() }
    });

    this.utils.config.rowValidators = [getTaxonRowValidator(taxonMap, this.utils, 'ITIS_TSN')];

    this.utils.config.dynamicHeadersConfig = dynamicHeadersConfig;
    this.utils.config.ignoreDynamicHeaders = !dynamicHeadersConfig;

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
        sex_qualitative_option_id: row[CSVRowState]?.sexId,
        itis_tsn: row.ITIS_TSN,
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
   * @returns {*} {CSVHeaderConfig} The sex header config
   */
  async _getSexHeaderConfig(): Promise<CSVHeaderConfig> {
    const rowDictionary = new NestedRecord<string>();

    const rowTsns = this.utils.getUniqueCellValues('ITIS_TSN').map((tsn) => String(tsn));
    const measurements = await Promise.all(rowTsns.map((tsn) => this.critterbaseService.getTaxonMeasurements(tsn)));

    measurements.forEach((measurement, index) => {
      const sexMeasurement = measurement.qualitative.find(
        (measurement) => measurement.measurement_name.toLowerCase() === 'sex'
      );

      if (sexMeasurement) {
        sexMeasurement.options.forEach((option) => {
          const tsn = Number(rowTsns[index]);
          const sexLabel = option.option_label;

          rowDictionary.set({ path: [tsn, sexLabel], value: option.qualitative_option_id });
        });
      }
    });

    return {
      validateCell: getCritterSexCellValidator(rowDictionary, this.utils)
    };
  }

  /**
   * Get the CSV Collection Unit dynamic header config.
   *
   * @returns {*} {Promise<CSVHeaderConfig>} The Collection Unit dynamic header config
   */
  async _getCollectionUnitDynamicHeaderConfig(): Promise<CSVHeaderConfig> {
    const rowDictionary = new NestedRecord<string>();
    const rowTsns = this.utils.getUniqueCellValues('ITIS_TSN').map((tsn) => String(tsn));
    // Get the collection units for all the tsns in the worksheet
    const collectionUnits = await Promise.all(
      rowTsns.map((tsn) => this.critterbaseService.findTaxonCollectionUnits(tsn))
    );

    collectionUnits.forEach((collectionUnits, index) => {
      collectionUnits.forEach((unit) => {
        const category = unit.category_name;
        const tsn = Number(rowTsns[index]);
        const unitName = unit.unit_name;

        rowDictionary.set({
          path: [tsn, category, unitName],
          value: unit.collection_unit_id
        });

        rowDictionary.set({ path: [tsn, category, unitName], value: unit.collection_unit_id });
      });
    });

    return {
      validateCell: getCritterCollectionUnitCellValidator(rowDictionary, this.utils),
      setCellValue: getCritterCollectionUnitCellSetter(rowDictionary, this.utils)
    };
  }
}
