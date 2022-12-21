import jsonpatch, { Operation } from 'fast-json-patch';
import { JSONPath } from 'jsonpath-plus';
import xml2js from 'xml2js';
import { IDBConnection } from '../database/db';
import { DBService } from './db-service';
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
  data: Record<string, unknown> = {};

  _packageId: string | undefined;

  projectId: number;
  surveyIds: number[] | undefined = undefined;

  taxonomyService: TaxonomyService;

  xml2jsBuilder: xml2js.Builder;

  includeSensitiveData = false;

  constructor(options: { projectId: number; packageId?: string }, connection: IDBConnection) {
    super(connection);

    this._packageId = options.packageId;

    this.projectId = options.projectId;

    this.taxonomyService = new TaxonomyService();

    this.xml2jsBuilder = new xml2js.Builder({ renderOpts: { pretty: false } });
  }

  /**
   * Find all nodes that contain `taxonID` and update them to include additional taxonomic information.
   *
   * @param {Record<any, any>} jsonObject
   * @return {*}  {Promise<Record<any, any>>}
   * @memberof DwCService
   */
  async enrichTaxonIDs(jsonObject: Record<any, any>): Promise<Record<any, any>> {
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
}
