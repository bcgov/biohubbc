import jsonpatch, { Operation } from 'fast-json-patch';
import { JSONPath } from 'jsonpath-plus';
import { IDBConnection } from '../database/db';
import { parseUTMString, utmToLatLng } from '../utils/spatial-utils';
import { DBService } from './db-service';

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
