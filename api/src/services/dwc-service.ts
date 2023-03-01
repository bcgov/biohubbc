import jsonpatch, { Operation } from 'fast-json-patch';
import { JSONPath } from 'jsonpath-plus';
import { IDBConnection } from '../database/db';
import { parseUTMString, utmToLatLng } from '../utils/spatial-utils';
import { DBService } from './db-service';
import { IEnrichedTaxonomyData, TaxonomyService } from './taxonomy-service';
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
   * Creates a set of all taxon IDs from the provided object
   *
   * @param {any} patchToPatch
   * @return {*}  {Set<string>}
   * @memberof DwCService
   */
  collectTaxonIDs(pathsToPatch: any): Set<string> {
    const taxonSet = new Set<string>();
    pathsToPatch.forEach((item: any) => {
      taxonSet.add(item.value['taxonID']);
    });
    return taxonSet;
  }

  /**
   * Calls elastic search taxonomy service with the given set of taxon codes
   *
   * @param {Set<string>} set A set of taxon IDs
   * @return {*}  {Promise<Map<string, IEnrichedTaxonomyData>>}
   * @memberof DwCService
   */
  async getEnrichedDataForSpeciesSet(set: Set<string>): Promise<Map<string, IEnrichedTaxonomyData>> {
    const taxonomyService = new TaxonomyService();
    const taxonLibrary: Map<string, IEnrichedTaxonomyData> = new Map();
    set.forEach(async (item) => {
      const data = await taxonomyService.getEnrichedDataForSpeciesCode(item);
      // skip null returns
      if (data) {
        taxonLibrary.set(item, data);
      }
    });

    return taxonLibrary;
  }

  /**
   * Find all nodes that contain `taxonID` and update them to include additional taxonomic information.
   *
   * @param {string} jsonObject
   * @return {*}  {Promise<string>}
   * @memberof DwCService
   */
  async decorateTaxonIDs(jsonObject: Record<any, any>): Promise<Record<any, any>> {
    // Find and return all nodes that contain `taxonID`
    const pathsToPatch = JSONPath({ path: '$..[taxonID]^', json: jsonObject, resultType: 'all' });

    // Collect all unique taxon IDs
    const taxonIds = this.collectTaxonIDs(pathsToPatch);

    // Make a request for each unique taxon ID
    // TODO this approach assumes that every not every row will have a unique taxon ID
    // TODO investigate elastic search batch calls
    const taxonData = await this.getEnrichedDataForSpeciesSet(taxonIds);

    const patchOperations: Operation[] = [];

    // Build patch operations
    await Promise.all(
      pathsToPatch.map(async (item: any) => {
        const enrichedData = taxonData.get(item.value['taxonID']);

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
   * Decorates the DwC json object
   *
   * @param {Record<any, any>} jsonObject
   * @return {*}  {Promise<Record<any, any>>}
   * @memberof DwCService
   */
  async decorateDwCJSON(jsonObject: Record<any, any>): Promise<Record<any, any>> {
    const latlongDec = await this.decorateLatLong(jsonObject);

    const taxonDec = await this.decorateTaxonIDs(latlongDec);

    return taxonDec;
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
          return jsonObject;
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
