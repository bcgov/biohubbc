import { Readable } from 'stream';
import { IDBConnection } from '../../../database/db';
import { getLogger } from '../../../utils/logger';
import { CritterbaseService, IMortalityLocationsData, IMortalityMarkingsData } from '../../critterbase-service';
import { DBService } from '../../db-service';
import { SurveyCritterService } from '../../survey-critter-service';
import { ExportDataStreamOptions, ExportStrategy, ExportStrategyConfig } from '../export-strategy';
import { parseTimestampString } from '../export-utils';

const defaultLog = getLogger('services/export-animal-strategy');

export type ExportAnimalConfig = {
  surveyId: number;
  isUserAdmin: boolean;
};

interface ICaptureExport {
  capture_date?: string;
  capture_time?: string;
  capture_location: {
    latitude?: string;
    longitude?: string;
  };
}
interface IMarkingExport {
  taxon_marking_body_location: string;
  primary_colour: string;
  secondary_colour: string;
  marking_type: string;
}

interface ICaptureMarkingsExport {
  capture_id: string;
  markings: IMarkingExport[];
}

interface IMortalityExport {
  mortality_id: string;
}

/**
 * Provides functionality for exporting animal data.
 *
 * @export
 * @class ExportAnimalStrategy
 * @extends {DBService}
 * @implements {ExportStrategy}
 */
export class ExportAnimalStrategy extends DBService implements ExportStrategy {
  config: ExportAnimalConfig;

  constructor(config: ExportAnimalConfig, connection: IDBConnection) {
    super(connection);

    this.config = config;
  }

  /**
   * Get the export strategy configuration for the animal data.
   *
   * @return {*}  {Promise<ExportStrategyConfig>}
   * @memberof ExportAnimalStrategy
   */
  async getExportStrategyConfig(): Promise<ExportStrategyConfig> {
    try {
      return {
        streams: [
          {
            stream: this._getAnimalStream,
            fileName: 'animal.csv',
            csvHeader: ['Animal ID', 'ITIS TSN', 'Species', 'Comment'].join(','),
            collectionCategories: await this._getCollectionCategoriesList()
          },
          {
            stream: this._getCapturesStream,
            fileName: 'captures.csv',
            csvHeader: ['Animal ID', 'Date', 'Time', 'Latitude', 'Longitude'].join(',')
          },
          {
            stream: this._getMortalitiesStream,
            fileName: 'mortalities.csv',
            csvHeader: ['Animal ID', 'Date', 'Time', 'Latitude', 'Longitude'].join(',')
          },
          {
            stream: this._getMarkingsStream,
            fileName: 'markings.csv',
            csvHeader: [
              'Animal ID',
              'Capture ID',
              'Mortality ID',
              'Body position',
              'Primary colour',
              'Secondary colour',
              'Marking type'
            ].join(',')
          }
        ]
      };
    } catch (error) {
      defaultLog.error({
        label: 'getExportStrategyConfig',
        message: 'Error generating export strategy config.',
        error
      });

      throw error;
    }
  }

  /**
   * Build and return the lookup mortality markings map with all pertinent uuids for the survey
   *
   * @async
   * @returns {Map<string, string>}
   * @memberof ExportAnimalStrategy
   */
  _getMortalityMarkingsMap = async () => {
    const surveyCritterService = new SurveyCritterService(this.connection);

    const crittersSurvey = await surveyCritterService.findCritters(
      this.config.isUserAdmin,
      this.connection.systemUserId(),
      {
        survey_ids: [this.config.surveyId]
      }
    );

    // extract list of critter ids
    const critterbaseCritterIds: string[] = crittersSurvey.map((critter) => critter.critterbase_critter_id);

    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    const mortalityMarkingsMap = await critterbaseService.getMortalityMarkingsByMultipleCritterIds(
      critterbaseCritterIds
    );

    return mortalityMarkingsMap;
  };

  /**
   * Build and return the lookup mortality locations map with all pertinent uuids for the survey
   *
   * @async
   * @returns {Map<string, string>}
   * @memberof ExportAnimalStrategy
   */
  _getMortalitiesLocationMap = async () => {
    const surveyCritterService = new SurveyCritterService(this.connection);

    const crittersSurvey = await surveyCritterService.findCritters(
      this.config.isUserAdmin,
      this.connection.systemUserId(),
      {
        survey_ids: [this.config.surveyId]
      }
    );
    // extract list of critter ids
    const critterIds: string[] = crittersSurvey.map((critter) => critter.critterbase_critter_id);

    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    const mortalityLocationsMap = await critterbaseService.getMortalityLocationsByMultipleCritterIds(critterIds);

    return mortalityLocationsMap;
  };

  /**
   * Build and return the lookup collection categories map with all definitions for the survey
   *
   * @async
   * @returns {string[]}
   * @memberof ExportAnimalStrategy
   */
  _getCollectionCategoriesList = async () => {
    const surveyCritterService = new SurveyCritterService(this.connection);
    // Fetch all collection categories definitions from Critterbase for all survey tsn numbers
    const response = await surveyCritterService.findCritters(this.config.isUserAdmin, this.connection.systemUserId(), {
      survey_ids: [this.config.surveyId]
    });

    const uniqueItisTsn = [...new Set(response.map((item) => item.itis_tsn))];

    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });
    const categoryNames = await critterbaseService.getUniqueCategoryNamesForTsnList(uniqueItisTsn);

    return categoryNames;
  };

  /**
   * Build and return the animal data stream.
   *
   * @param {ExportDataStreamOptions} _options
   * @memberof ExportAnimalStrategy
   */
  _getAnimalStream = (_options: ExportDataStreamOptions): Readable => {
    const surveyCritterService = new SurveyCritterService(this.connection);

    const isUserAdmin = this.config.isUserAdmin;
    const systemUserId = this.connection.systemUserId();
    const filterFields = {
      survey_ids: [this.config.surveyId]
    };

    const stream = new Readable({
      objectMode: true,
      read() {
        surveyCritterService
          .findCrittersDetails(isUserAdmin, systemUserId, filterFields)
          .then((critter) => {
            for (const item of critter) {
              this.push(ExportAnimalStrategy.animalCsvTransformation(item));
            }

            // Signal the end of the stream
            this.push(null);
          })
          .catch((error) => {
            this.emit('error', error);
          });
      }
    });

    return stream;
  };

  /**
   * Build and return the captures data stream.
   *
   * @param {ExportDataStreamOptions} _options
   * @memberof ExportAnimalStrategy
   */
  _getCapturesStream = (_options: ExportDataStreamOptions): Readable => {
    const surveyCritterService = new SurveyCritterService(this.connection);

    const isUserAdmin = this.config.isUserAdmin;
    const systemUserId = this.connection.systemUserId();
    const filterFields = {
      survey_ids: [this.config.surveyId]
    };

    const stream = new Readable({
      objectMode: true,
      read() {
        surveyCritterService
          .findCrittersDetails(isUserAdmin, systemUserId, filterFields)
          .then((critter) => {
            for (const item of critter) {
              this.push(ExportAnimalStrategy.capturesCsvTransformation(item));
            }

            // Signal the end of the stream
            this.push(null);
          })
          .catch((error) => {
            this.emit('error', error);
          });
      }
    });

    return stream;
  };

  /**
   * Build and return the mortalities data stream.
   *
   * @param {ExportDataStreamOptions} _options
   * @memberof ExportAnimalStrategy
   */
  _getMortalitiesStream = (_options: ExportDataStreamOptions): Readable => {
    const surveyCritterService = new SurveyCritterService(this.connection);

    const isUserAdmin = this.config.isUserAdmin;
    const systemUserId = this.connection.systemUserId();
    const filterFields = {
      survey_ids: [this.config.surveyId]
    };

    const mortalitiesLocationsMapPromise = this._getMortalitiesLocationMap();

    const stream = new Readable({
      objectMode: true,
      read() {
        // Use mortalityLocationsMap once the promise resolves
        mortalitiesLocationsMapPromise
          .then((mortalityLocationsMap) => {
            // Handle the critter details retrieval after mortalityMarkingsMap promise is resolved
            surveyCritterService
              .findCrittersDetails(isUserAdmin, systemUserId, filterFields)
              .then((critter) => {
                for (const item of critter) {
                  this.push(ExportAnimalStrategy.mortalitiesCsvTransformation(item, mortalityLocationsMap));
                }

                // Signal the end of the stream
                this.push(null);
              })
              .catch((error) => {
                this.emit('error', error);
              });
          })
          .catch((error) => {
            this.emit('error', error);
          });
      }
    });

    return stream;
  };

  /**
   * Build and return the markings data stream.
   *
   * @param {ExportDataStreamOptions} _options
   * @memberof ExportAnimalStrategy
   */
  _getMarkingsStream = (_options: ExportDataStreamOptions): Readable => {
    const surveyCritterService = new SurveyCritterService(this.connection);

    const isUserAdmin = this.config.isUserAdmin;
    const systemUserId = this.connection.systemUserId();
    const filterFields = {
      survey_ids: [this.config.surveyId]
    };

    const mortalityMarkingsMapPromise = this._getMortalityMarkingsMap();

    const stream = new Readable({
      objectMode: true,
      read() {
        // Use mortalityMarkingsMap once the promise resolves
        mortalityMarkingsMapPromise
          .then((mortalityMarkingsMap) => {
            // Handle the critter details retrieval after mortalityMarkingsMap promise is resolved
            surveyCritterService
              .findCrittersDetails(isUserAdmin, systemUserId, filterFields)
              .then((critter) => {
                for (const item of critter) {
                  this.push(ExportAnimalStrategy.markingsCsvTransformation(item, mortalityMarkingsMap));
                }

                // Signal the end of the stream
                this.push(null);
              })
              .catch((error) => {
                this.emit('error', error);
              });
          })
          .catch((error) => {
            this.emit('error', error);
          });
      }
    });

    return stream;
  };

  /**
   * Transform stream result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @returns {string}
   * @memberof ExportAnimalStrategy
   */
  static readonly animalCsvTransformation = (item: Record<string, any>): string => {
    // Use map to get all unit_names from collection_units
    const unitNames: string[] = item.collection_units.map((unit: { unit_name: string }) => `"${unit.unit_name}"`);

    return [
      item.animal_id, // this is the Nickname
      item.itis_tsn,
      `"${item.itis_scientific_name ?? ''}"`,
      `"${item.critter_comment ?? ''}"`,
      ...unitNames
    ].join(',');
  };

  /**
   * Transform stream captures result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @returns {string}
   * @memberof ExportAnimalStrategy
   */
  static readonly capturesCsvTransformation = (item: Record<string, any>): string => {
    if (!item.captures?.length) {
      return ''; // nothing to write out, no captures
    }
    // Create an array to hold the CSV lines
    const csvLines = item.captures.map((capture: ICaptureExport) => {
      return [
        item.animal_id,
        capture.capture_date ?? '',
        capture.capture_time ?? '',
        capture.capture_location.latitude ?? '',
        capture.capture_location.longitude ?? ''
      ].join(',');
    });

    return csvLines.join('\r\n');
  };

  /**
   * Transform stream mortalities result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @returns {string}
   * @memberof ExportAnimalStrategy
   */
  static readonly mortalitiesCsvTransformation = (
    item: Record<string, any>,
    mortalityLocationsMap?: Map<string, IMortalityLocationsData>
  ): string => {
    if (item.mortality.length <= 0) {
      return ''; // nothing to write out, no mortalities
    }

    let csvLines = ''; // Using a StringBuilder as it is faster than an array

    item.mortality.forEach((mortalityItem: { mortality_id: string; mortality_timestamp: string }) => {
      let dateStr = '';
      let timeStr = '';

      ({ dateStr, timeStr } = parseTimestampString(mortalityItem.mortality_timestamp));
      // Look up the mortality_id in the map to get the associated location
      const locationData = mortalityLocationsMap?.get(mortalityItem.mortality_id);

      if (locationData) {
        csvLines = `${item.animal_id},${dateStr},${timeStr},${locationData.latitude},${locationData.longitude}\r\n`;
      }
    });

    return csvLines.trim(); // Remove the last \r\n
  };

  /**
   * Transform stream markings result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @param {?Map<string, IMortalityMarkingsData[]>} [mortalityMarkingsMap]
   * @returns {string}
   * @memberof ExportAnimalStrategy
   */
  static readonly markingsCsvTransformation = (
    item: Record<string, any>,
    mortalityMarkingsMap?: Map<string, IMortalityMarkingsData[]>
  ): string => {
    if (item.captures.length <= 0 && item.mortality.length <= 0) {
      return ''; // nothing to write out, no captures and no mortalities
    }

    let csvLine = ''; // Using a StringBuilder as it is faster than an array
    const animalId = item.animal_id;

    // Iterate through captures
    item.captures.forEach((capture: ICaptureMarkingsExport) => {
      const captureId = capture.capture_id;
      // If there are markings, generate a row for each marking
      if (capture.markings.length > 0) {
        capture.markings.forEach((marking: IMarkingExport) => {
          csvLine += `${animalId},${captureId},,${marking.taxon_marking_body_location},${
            marking.primary_colour ?? ''
          },${marking.secondary_colour ?? ''},${marking.marking_type}\r\n`;
        });
      }
    });

    // Now loop through the mortality array and add mortality_id to each row
    item.mortality.forEach((mortality: IMortalityExport) => {
      // Use map to get all markings for specific mortality
      const mortalityMarkings = mortalityMarkingsMap ? mortalityMarkingsMap.get(mortality.mortality_id) : null;
      if (!mortalityMarkings?.length) {
        csvLine += `${animalId},,${mortality.mortality_id},,,,\r\n`;
        return;
      }
      // If markings exist, loop through them and generate CSV lines
      mortalityMarkings.forEach((marking) => {
        csvLine += `${animalId},,${mortality.mortality_id},${marking.body_location},${marking.primary_colour ?? ''},${
          marking.secondary_colour ?? ''
        },${marking.marking_type}\r\n`;
      });
    });

    return csvLine.trim(); // Remove the last \r\n
  };
}
