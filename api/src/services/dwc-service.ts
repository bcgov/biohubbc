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

  async enrichTaxonIDs(jsonObject: Record<any, any>): Promise<Record<any, any>> {
    const taxonomyService = new TaxonomyService();

    const json_path_with_details = JSONPath({ path: '$..[taxonID]^', json: jsonObject, resultType: 'all' });

    const patcharray: Operation[] = await Promise.all(
      json_path_with_details.map(async (item: any) => {
        const enriched_data = await taxonomyService.getEnrichedDataForSpeciesCode(item.value['taxonID']);

        const patch: Operation = {
          op: 'add',
          path: item.pointer,
          value: {
            taxonID: item.value['taxonID'],
            scientificName: enriched_data?.scientific_name,
            vernacularName: enriched_data?.english_name
          }
        };

        return patch;
      })
    );

    jsonObject = jsonpatch.applyPatch(jsonObject, patcharray).newDocument;

    return jsonObject;
  }
}
