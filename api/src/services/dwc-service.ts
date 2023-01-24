import jsonpatch, { Operation } from 'fast-json-patch';
import { JSONPath } from 'jsonpath-plus';
import { IDBConnection } from '../database/db';
import { parseUTMString, utmToLatLng } from '../utils/spatial-utils';
import { DBService } from './db-service';
import { OccurrenceService } from './occurrence-service';
import { TaxonomyService } from './taxonomy-service';
/**
 * Service to produce DWC data for a project.
 *
 * @see https://eml.ecoinformatics.org for EML specification
 * @see https://knb.ecoinformatics.org/emlparser/ for an online EML validator.
 * @export
 * @class EmlService
 * @extends {DBService}
 */
export class DwCService extends DBService {
  constructor(connection: IDBConnection) {
    super(connection);
  }

  /**
   * Find all nodes that contain `taxonID` and update them to include additional taxonomic information.
   *
   * @param {string} jsonObject
   * @return {*}  {Promise<string>}
   * @memberof DwCService
   */
  async decorateTaxonIDs(jsonObject: Record<any, any>): Promise<Record<any, any>> {
    const taxonomyService = new TaxonomyService();

    // Find and return all nodes that contain `taxonID`
    const pathsToPatch = JSONPath({ path: '$..[taxonID]^', json: jsonObject, resultType: 'all' });

    const patchOperations: Operation[] = [];

    // Build patch operations
    await Promise.all(
      pathsToPatch.map(async (item: any) => {
        const enrichedData = await taxonomyService.getEnrichedDataForSpeciesCode(item.value['taxonID']);

        if (!enrichedData) {
          // No matching taxon information found for provided taxonID code
          return;
        }

        const taxonIdPatch: Operation = {
          op: 'replace',
          path: item.pointer + '/taxonID',
          value: item.value['taxonID']
        };

        const scientificNamePatch: Operation = {
          op: 'add',
          path: item.pointer + '/scientificName',
          value: enrichedData?.scientificName
        };

        const vernacularNamePatch: Operation = {
          op: 'add',
          path: item.pointer + '/vernacularName',
          value: enrichedData?.englishName
        };

        patchOperations.push(taxonIdPatch, scientificNamePatch, vernacularNamePatch);
      })
    );

    // Apply patch operations
    return jsonpatch.applyPatch(jsonObject, patchOperations).newDocument;
  }

  /**
   * Run all Decoration functions on DWCA Source Data
   *
   * @param {number} occurrenceSubmissionId
   * @return {*}  {Promise<boolean>}
   * @memberof DwCService
   */
  async decorateDWCASourceData(occurrenceSubmissionId: number): Promise<boolean> {
    const occurrenceService = new OccurrenceService(this.connection);

    const submission = await occurrenceService.getOccurrenceSubmission(occurrenceSubmissionId);
    const jsonObject = submission.darwin_core_source;

    let newJson = await this.decorateLatLong(jsonObject);
    newJson = await this.decorateTaxonIDs(newJson);

    const response = await occurrenceService.updateDWCSourceForOccurrenceSubmission(
      occurrenceSubmissionId,
      JSON.stringify(newJson)
    );

    return !!response;
  }

  /**
   * Decorate Lat Long details for Location data
   *
   * @param {string} jsonObject
   * @return {*}  {Promise<string>}
   * @memberof DwCService
   */
  async decorateLatLong(jsonObject: Record<any, any>): Promise<Record<any, any>> {
    const pathsToPatch = JSONPath({
      path: '$..[verbatimCoordinates]^',
      json: jsonObject,
      resultType: 'all'
    });

    const patchOperations: Operation[] = [];

    pathsToPatch.forEach(async (item: any) => {
      if (
        Object.prototype.hasOwnProperty.call(item.value, 'decimalLatitude') &&
        Object.prototype.hasOwnProperty.call(item.value, 'decimalLongitude')
      ) {
        if (!!item.value['decimalLatitude'] && !!item.value['decimalLongitude']) {
          return;
        }
      }

      const verbatimCoordinates = parseUTMString(item.value['verbatimCoordinates']);

      if (!verbatimCoordinates) {
        return;
      }

      const latLongValues = utmToLatLng(verbatimCoordinates);

      const decimalLatitudePatch: Operation = {
        op: 'add',
        path: item.pointer + '/decimalLatitude',
        value: latLongValues.latitude
      };

      const decimalLongitudePatch: Operation = {
        op: 'add',
        path: item.pointer + '/decimalLongitude',
        value: latLongValues.longitude
      };

      patchOperations.push(decimalLatitudePatch, decimalLongitudePatch);
    });

    return jsonpatch.applyPatch(jsonObject, patchOperations).newDocument;
  }
}
