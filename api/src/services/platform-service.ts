import AdmZip from 'adm-zip';
import axios from 'axios';
import jsonpatch, { Operation } from 'fast-json-patch';
import FormData from 'form-data';
import { JSONPath } from 'jsonpath-plus';
import { URL } from 'url';
import { HTTP400 } from '../errors/http-error';
import { getFileFromS3 } from '../utils/file-utils';
import { DBService } from './db-service';
import { EmlService } from './eml-service';
import { KeycloakService } from './keycloak-service';
import { SurveyService } from './survey-service';
import { TaxonomyService } from './taxonomy-service';

export interface IDwCADataset {
  archiveFile: {
    /**
     * A Darwin Core Archive (DwCA) zip file.
     */
    data: Buffer;
    /**
     * The name of the archive file.
     */
    fileName: string;
    /**
     * The mime type, should be `application/zip` or similar.
     */
    mimeType: string;
  };
  /**
   * A UUID that uniquely identifies this DwCA dataset.
   */
  dataPackageId: string;
}

export class PlatformService extends DBService {
  BACKBONE_INTAKE_ENABLED = process.env.BACKBONE_INTAKE_ENABLED === 'true' || false;
  BACKBONE_API_HOST = process.env.BACKBONE_API_HOST;
  BACKBONE_INTAKE_PATH = process.env.BACKBONE_INTAKE_PATH || '/api/dwc/submission/intake';

  /**
   * Submit a Darwin Core Archive (DwCA) data package, that only contains the project/survey metadata, to the BioHub
   * Platform Backbone.
   *
   * Why submit only metadata? It is beneficial to submit the metadata as early as possible, so that the project/survey
   * is discoverable by users of BioHub, even if the project/survey has not yet completed or not all inventory data has
   * been submitted.
   *
   * Note: Does nothing if `process.env.BACKBONE_INTAKE_ENABLED` is not `true`.
   *
   * @param {number} projectId
   * @return {*}
   * @memberof PlatformService
   */
  async submitDwCAMetadataPackage(projectId: number) {
    if (!this.BACKBONE_INTAKE_ENABLED) {
      return;
    }

    const emlService = new EmlService({ projectId: projectId }, this.connection);

    const emlString = await emlService.buildProjectEml();

    const dwcArchiveZip = new AdmZip();
    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));

    const dwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: 'DwCA.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId
    };

    return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
  }

  /**
   * Submit a Darwin Core Archive (DwCA) data package, that contains both project/survey metadata and survey occurrence
   * data, to the BioHub Platform Backbone.
   *
   * Note: Does nothing if `process.env.BACKBONE_INTAKE_ENABLED` is not `true`.
   *
   * @param {number} projectId
   * @return {*}
   * @memberof PlatformService
   */
  async submitDwCADataPackage(projectId: number) {
    if (!this.BACKBONE_INTAKE_ENABLED) {
      return;
    }

    const emlService = new EmlService({ projectId: projectId }, this.connection);

    const emlString = await emlService.buildProjectEml();

    const dwcArchiveZip = new AdmZip();
    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));
    // TODO fetch and add DwCA data files to archive

    const dwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: 'DwCA.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId
    };

    return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
  }

  /**
   * Submit a new Darwin Core Archive (DwCA) data package to the BioHub Platform Backbone.
   *
   * @param {IDwCADataset} dwcaDataset
   * @return {*}  {Promise<{ data_package_id: string }>}
   * @memberof PlatformService
   */
  async _submitDwCADatasetToBioHubBackbone(dwcaDataset: IDwCADataset): Promise<{ data_package_id: string }> {
    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakToken();

    const formData = new FormData();

    formData.append('media', dwcaDataset.archiveFile.data, {
      filename: dwcaDataset.archiveFile.fileName,
      contentType: dwcaDataset.archiveFile.mimeType
    });

    formData.append('data_package_id', dwcaDataset.dataPackageId);

    const backboneIntakeUrl = new URL(this.BACKBONE_INTAKE_PATH, this.BACKBONE_API_HOST).href;

    const { data } = await axios.post<{ data_package_id: string }>(backboneIntakeUrl, formData.getBuffer(), {
      headers: {
        authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    return data;
  }

  /**
   * Upload Survey/Project/Observation data to Backbone
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}
   * @memberof PlatformService
   */
  async uploadSurveyDataToBioHub(projectId: number, surveyId: number) {
    if (!this.BACKBONE_INTAKE_ENABLED) {
      return;
    }

    const surveyService = new SurveyService(this.connection);
    const surveyData = await surveyService.getLatestSurveyOccurrenceSubmission(surveyId);

    console.log('**************************************');
    console.log('surveyData:', surveyData);

    const jsonObject = surveyData.darwin_core_source;

    console.log(jsonObject);

    // const term = JSONPath({ path: '$..taxonId', json: jsonObject });

    // console.log('******** term ********: ', term);

    //const paths = jsonpath.paths(jsonObject, '$..taxonId');

    //console.log('******** paths  ********: ', paths);

    //const nodes = jsonpath.nodes(jsonObject, '$..taxonId');

    //console.log('******** nodes  ********: ', nodes);

    // const pathsToPatch: string[] = JSONPath({
    //   json: hierarchicalRowObjects,
    //   path: `$${'._children[*]'.repeat(distanceToRoot - 1)}._children[?(@._childKeys.indexOf("${
    //     rowObjectsItem._parentKey
    //   }") != -1)]`,
    //   resultType: 'pointer'
    // });

    // const patchOperations: Operation[] = pathsToPatch.map((pathToPatch) => {
    //   return { op: 'add', path: `${pathToPatch}/_children/`, value: rowObjectsItem };
    // });

    // jsonpatch.applyPatch(hierarchicalRowObjects, patchOperations);

    const taxonomyService = new TaxonomyService();

    console.log('jsonObject:', jsonObject);

    //step 1: get the path of the code that needs to be changed

    const json_path_with_details = JSONPath({ path: '$..[taxonId]^', json: jsonObject, resultType: 'all' });

    console.log('json_path_with_details', json_path_with_details);

    //step 2:  get the scientific name from elastic search

    json_path_with_details.map(async (item: any) => {
      console.log('***************** each item **************');
      console.log(item);
      console.log('taxonId: ', item.value['taxonId']);

      const scientific_name_array = await taxonomyService.getScientificNameBySpeciesCode(item.value['taxonId']);

      const scientific_name_object_to_be_inserted = scientific_name_array[0];
      console.log('scientific_name is : ', scientific_name_object_to_be_inserted);

      console.log('-------------------------------------------------------------------');

      let someObject = { firstName: 'Albert', contactDetails: { phoneNumbers: [] } };

      console.log('document before patch', someObject);
      const patch: Operation[] = [
        //{ op: 'replace', path: '/firstName', value: 'Joachim' },
        { op: 'add', path: '/lastName', value: 'Wester' },
        { op: 'add', path: '/contactDetails/phoneNumbers/0', value: { number: '555-123' } },
        { op: 'add', path: '/lastName', value: { number: '555-123', scientific: 'science name' } }
      ];
      someObject = jsonpatch.applyPatch(someObject, patch).newDocument;

      console.log('document after patch applies: ', someObject);

      console.log('-------------------------------------------------------------------');
    });

    //step 3:  insert the scientific name in the same spot.

    // const callback = async (item: any, type: any, payload: any) => {
    //   console.log('item:', item);
    //   console.log('type:', type);
    //   console.log('payload:', payload);
    //   const scientific_name = await taxonomyService.getScientificNameBySpeciesCode(item.taxonId);

    //   console.log('payload.parent:', payload.parent);

    //   item['scientific_name'] = scientific_name[0].scientific_name;

    //   // jsonObject[payload.parentProperty] = item;

    //   console.log('item:', item);
    //   console.log('jsonObject:', jsonObject);

    //   return jsonObject;
    // };

    // const updateJsonObject = async () => {
    //   let newJson;

    //   const json_path = await JSONPath('$..[taxonId]^', jsonObject, callback, undefined);

    //   // const findTaxon = await JSONPath({
    //   //   path: '$..[taxonId]^',
    //   //   json: jsonObject,

    //   // });

    //   console.log('json_paths:', json_path);

    //   return newJson;
    // };

    // const newResponse = await taxonomyService.getScientificNameBySpeciesCode(term[0].toString());

    // console.log('new response: ', newResponse);

    //jsonObject = { ...jsonObject, scientific_name: newResponse[0].scientific_name };

    // console.log('updatedJsonObject: ', jsonObject);

    if (!surveyData.output_key) {
      throw new HTTP400('no s3Key found');
    }
    const s3File = await getFileFromS3(surveyData.output_key);

    if (!s3File) {
      throw new HTTP400('no s3File found');
    }
    const dwcArchiveZip = new AdmZip(s3File.Body as Buffer);

    const emlService = new EmlService({ projectId: projectId }, this.connection);
    const emlString = await emlService.buildProjectEml();

    if (!emlString) {
      throw new HTTP400('emlString failed to build');
    }

    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));

    const dwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: 'DwCA.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId
    };

    return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
  }
}
