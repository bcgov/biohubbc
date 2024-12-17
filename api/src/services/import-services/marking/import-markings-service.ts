import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import {
  CSVConfig,
  CSVValidationError,
  CSV_ERROR_MESSAGE
} from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDescriptionCellValidator,
  getTimeCellSetter,
  getTimeCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getLogger } from '../../../utils/logger';
import { NestedRecord } from '../../../utils/nested-record';
import { IAsSelectLookup, ICritterDetailed } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import {
  getMarkingAliasCellValidator,
  getMarkingBodyLocationCellValidator,
  getMarkingCaptureDateCellValidator,
  getMarkingColourCellValidator,
  getMarkingIdentifierCellValidator,
  getMarkingTypeCellValidator
} from './marking-header-configs';

const defaultLog = getLogger('services/import/import-markings-service');

// Marking CSV static headers
export type MarkingCSVStaticHeader =
  | 'ALIAS'
  | 'CAPTURE_DATE'
  | 'CAPTURE_TIME'
  | 'BODY_LOCATION'
  | 'MARKING_TYPE'
  | 'IDENTIFIER'
  | 'PRIMARY_COLOUR'
  | 'SECONDARY_COLOUR'
  | 'DESCRIPTION';

/**
 * ImportMarkingsService - A service for importing Markings from a CSV into Critterbase.
 *
 * @class ImportMarkingsService
 * @extends DBService
 */
export class ImportMarkingsService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  surveyCritterService: SurveyCritterService;
  utils: CSVConfigUtils<MarkingCSVStaticHeader>;

  /**
   * Construct an instance of ImportMarkingsStrategy.
   *
   * @param {IDBConnection} connection - DB connection
   * @param {string} surveyId
   */
  constructor(connection: IDBConnection, worksheet: WorkSheet, surveyId: number) {
    super(connection);

    const initialConfig: CSVConfig<MarkingCSVStaticHeader> = {
      staticHeadersConfig: {
        ALIAS: { aliases: ['NICKNAME', 'ANIMAL'] },
        CAPTURE_DATE: { aliases: ['CAPTURE DATE', 'DATE'] },
        CAPTURE_TIME: { aliases: ['CAPTURE TIME', 'TIME'], optional: true },
        BODY_LOCATION: { aliases: ['BODY LOCATION'], optional: true },
        MARKING_TYPE: { aliases: ['MARKING TYPE', 'TYPE'], optional: true },
        IDENTIFIER: { aliases: ['ID'], optional: true },
        PRIMARY_COLOUR: { aliases: ['PRIMARY COLOUR'], optional: true },
        SECONDARY_COLOUR: { aliases: ['SECONDARY COLOUR'], optional: true },
        DESCRIPTION: { aliases: ['COMMENT', 'COMMENTS', 'NOTES'], optional: true }
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
   * @returns {*} {Promise<CSVError[]>}
   */
  async importCSVWorksheet(): Promise<void> {
    const config = await this.getCSVConfig();

    const { errors, rows } = validateCSVWorksheet(this.worksheet, config);

    if (errors.length) {
      throw new CSVValidationError(CSV_ERROR_MESSAGE, errors);
    }

    const markings = rows.map((row) => ({
      critter_id: row.ALIAS, // ALIAS set to Critterbase critter_id
      capture_id: row.CAPTURE_DATE, // CAPTURE_DATE set to Critterbase capture_id
      body_location: row.BODY_LOCATION, // BODY_LOCATION set to Critterbase body_location_id
      marking_type: row.MARKING_TYPE,
      identifier: row.IDENTIFIER,
      primary_colour: row.PRIMARY_COLOUR,
      secondary_colour: row.SECONDARY_COLOUR,
      comment: row.DESCRIPTION
    }));

    defaultLog.debug({ label: 'import markings', markings });

    await this.surveyCritterService.critterbaseService.bulkCreate({ markings });
  }

  /**
   * Get the CSV configuration for Markings.
   *
   * @returns {Promise<CSVConfig<MarkingCSVStaticHeader>>} The CSV configuration
   */
  async getCSVConfig(): Promise<CSVConfig<MarkingCSVStaticHeader>> {
    const surveyAliasMap = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);
    const bodyLocationDictionary = await this._getBodyLocationDictionary(surveyAliasMap);

    const markingTypes = new Set(
      (await this.surveyCritterService.critterbaseService.getMarkingTypes()).map((type) => type.value.toLowerCase())
    );

    const colours = new Set(
      (await this.surveyCritterService.critterbaseService.getColours()).map((colour) => colour.value.toLowerCase())
    );

    this.utils.setStaticHeaderConfig('ALIAS', {
      validateCell: getMarkingAliasCellValidator(surveyAliasMap)
    });
    this.utils.setStaticHeaderConfig('CAPTURE_DATE', {
      validateCell: getMarkingCaptureDateCellValidator(surveyAliasMap, this.utils)
    });
    this.utils.setStaticHeaderConfig('CAPTURE_TIME', {
      validateCell: getTimeCellValidator(),
      setCellValue: getTimeCellSetter()
    });
    this.utils.setStaticHeaderConfig('BODY_LOCATION', {
      validateCell: getMarkingBodyLocationCellValidator(bodyLocationDictionary, this.utils)
    });
    this.utils.setStaticHeaderConfig('MARKING_TYPE', {
      validateCell: getMarkingTypeCellValidator(markingTypes)
    });
    this.utils.setStaticHeaderConfig('IDENTIFIER', {
      validateCell: getMarkingIdentifierCellValidator()
    });
    this.utils.setStaticHeaderConfig('PRIMARY_COLOUR', {
      validateCell: getMarkingColourCellValidator(colours)
    });
    this.utils.setStaticHeaderConfig('SECONDARY_COLOUR', {
      validateCell: getMarkingColourCellValidator(colours)
    });
    this.utils.setStaticHeaderConfig('DESCRIPTION', {
      validateCell: getDescriptionCellValidator()
    });

    // Return the final CSV config
    return this.utils.getConfig();
  }

  /**
   * Get a dictionary of critter alias -> body location -> body_location_id.
   *
   * @param {Map<string, ICritterDetailed>} surveyAliasMap - The survey alias map
   * @returns {Promise<NestedRecord<string>>} The body location dictionary
   */
  async _getBodyLocationDictionary(surveyAliasMap: Map<string, ICritterDetailed>): Promise<NestedRecord<string>> {
    const dictionary = new NestedRecord<string>();
    const rowAliases = this.utils.getUniqueCellValues('ALIAS').map((alias) => String(alias).toLowerCase());
    const tsnBodyLocationMap = new Map<number, Promise<IAsSelectLookup[]>>();

    for (const alias of rowAliases) {
      const critter = surveyAliasMap.get(alias);
      if (critter) {
        const tsnBodyLocations = await tsnBodyLocationMap.get(critter.itis_tsn);

        if (!tsnBodyLocations) {
          tsnBodyLocationMap.set(
            critter.itis_tsn,
            this.surveyCritterService.critterbaseService.getTaxonBodyLocations(String(critter.itis_tsn))
          );
        }

        tsnBodyLocations?.map((bodyLocation) => {
          dictionary.set({
            path: [alias, bodyLocation.value.toLowerCase()],
            value: bodyLocation.id
          });
        });
      }
    }

    return dictionary;
  }
}
