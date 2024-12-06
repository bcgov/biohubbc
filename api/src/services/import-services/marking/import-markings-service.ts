import { WorkSheet } from 'xlsx';
import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { validateCSVWorksheet } from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVHeaderConfig } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getDescriptionCellValidator,
  getStateCellSetter,
  getTimeCellSetter,
  getTimeCellValidator
} from '../../../utils/csv-utils/csv-header-configs';
import { getLogger } from '../../../utils/logger';
import { NestedRecord } from '../../../utils/nested-record';
import { ICritterDetailed } from '../../critterbase-service';
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

export class ImportMarkingsService extends DBService {
  worksheet: WorkSheet;
  surveyId: number;

  surveyCritterService: SurveyCritterService;
  utils: CSVConfigUtils<MarkingCSVStaticHeader>;

  surveyCritterAliasMapCache?: Map<string, ICritterDetailed>;

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
        CAPTURE_DATE: { aliases: ['CAPTURE DATE'] },
        CAPTURE_TIME: {
          aliases: ['CAPTURE TIME'],
          validateCell: getTimeCellValidator(),
          setCellValue: getTimeCellSetter()
        },
        BODY_LOCATION: { aliases: ['BODY LOCATION'] },
        MARKING_TYPE: { aliases: ['MARKING TYPE'] },
        IDENTIFIER: { aliases: ['ID'], validateCell: getMarkingIdentifierCellValidator() },
        PRIMARY_COLOUR: { aliases: ['PRIMARY COLOUR'] },
        SECONDARY_COLOUR: { aliases: ['SECONDARY COLOUR'] },
        DESCRIPTION: { aliases: ['COMMENT', 'COMMENTS', 'NOTES'], validateCell: getDescriptionCellValidator() }
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
   * @returns {*} {Promise<void>}
   */
  async importCSVWorksheet(): Promise<void> {
    const config = await this.getCSVConfig();

    const { errors, rows } = validateCSVWorksheet(this.worksheet, config);

    if (errors.length) {
      throw new ApiGeneralError('Failed to validate CSV', errors);
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

  async getCSVConfig(): Promise<CSVConfig<MarkingCSVStaticHeader>> {
    const [
      aliasHeaderConfig,
      captureHeaderConfig,
      colourHeaderConfig,
      bodyLocationHeaderConfig,
      markingTypeHeaderConfig
    ] = await Promise.all([
      this._getAliasHeaderConfig(),
      this._getCaptureDateHeaderConfig(),
      this._getColourHeaderConfig(),
      this._getBodyLocationHeaderConfig(),
      this._getMarkingTypeHeaderConfig()
    ]);

    this.utils.setStaticHeaderConfig('ALIAS', aliasHeaderConfig);
    this.utils.setStaticHeaderConfig('CAPTURE_DATE', captureHeaderConfig);
    this.utils.setStaticHeaderConfig('BODY_LOCATION', bodyLocationHeaderConfig);
    this.utils.setStaticHeaderConfig('MARKING_TYPE', markingTypeHeaderConfig);
    this.utils.setStaticHeaderConfig('PRIMARY_COLOUR', colourHeaderConfig);
    this.utils.setStaticHeaderConfig('SECONDARY_COLOUR', colourHeaderConfig);

    return this.utils.getConfig();
  }

  async _getSurveyCritterAliasMap(): Promise<Map<string, ICritterDetailed>> {
    // Cache the survey critter alias map
    if (!this.surveyCritterAliasMapCache) {
      this.surveyCritterAliasMapCache = await this.surveyCritterService.getSurveyCritterAliasMap(this.surveyId);
    }

    return this.surveyCritterAliasMapCache;
  }

  async _getAliasHeaderConfig(): Promise<CSVHeaderConfig> {
    const surveyAliasMap = await this._getSurveyCritterAliasMap();

    return {
      validateCell: getMarkingAliasCellValidator(surveyAliasMap),
      setCellValue: getStateCellSetter()
    };
  }

  async _getCaptureDateHeaderConfig(): Promise<CSVHeaderConfig> {
    const surveyAliasMap = await this._getSurveyCritterAliasMap();

    return {
      validateCell: getMarkingCaptureDateCellValidator(surveyAliasMap, this.utils),
      setCellValue: getStateCellSetter()
    };
  }

  async _getMarkingTypeHeaderConfig(): Promise<CSVHeaderConfig> {
    const markingTypes = await this.surveyCritterService.critterbaseService.getMarkingTypes();
    const markingTypesSet = new Set(markingTypes.map((type) => type.value.toLowerCase()));

    return {
      validateCell: getMarkingTypeCellValidator(markingTypesSet)
    };
  }

  async _getBodyLocationDictionary(): Promise<NestedRecord<string>> {
    const dictionary = new NestedRecord<string>();
    const uniqueTsns = new Set<number>();

    const surveyAliasMap = await this._getSurveyCritterAliasMap();
    const rowAliases = this.utils.getUniqueCellValues('ALIAS');
    const critters = new Set<ICritterDetailed>();

    // Get unique critters and their tsns
    for (const alias of rowAliases) {
      const critter = surveyAliasMap.get(String(alias).toLowerCase());
      if (critter) {
        uniqueTsns.add(critter.itis_tsn);
        critters.add(critter);
      }
    }

    // Fetch body locations for each unique tsn
    const bodyLocationsArrays = await Promise.all(
      Array.from(uniqueTsns).map((tsn) =>
        this.surveyCritterService.critterbaseService.getTaxonBodyLocations(String(tsn))
      )
    );

    // Create a dictionary of critter_id -> body location -> body_location_id
    for (let i = 0; i < critters.size; i++) {
      const critter = Array.from(critters)[i];
      const bodyLocations = bodyLocationsArrays[i];

      for (const bodyLocation of bodyLocations) {
        dictionary.set({ path: [critter.animal_id as string, bodyLocation.value], value: bodyLocation.id });
      }
    }

    return dictionary;
  }

  async _getBodyLocationHeaderConfig(): Promise<CSVHeaderConfig> {
    const dictionary = await this._getBodyLocationDictionary();

    return {
      validateCell: getMarkingBodyLocationCellValidator(dictionary, this.utils),
      setCellValue: getStateCellSetter()
    };
  }

  async _getColourHeaderConfig(): Promise<CSVHeaderConfig> {
    const colours = await this.surveyCritterService.critterbaseService.getColours();
    const coloursSet = new Set(colours.map((colour) => colour.value.toLowerCase()));

    return {
      validateCell: getMarkingColourCellValidator(coloursSet)
    };
  }
}
