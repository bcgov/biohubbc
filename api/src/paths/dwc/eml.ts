import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
//import { HTTP400, HTTP500 } from '../../errors/CustomError';
import { HTTP400 } from '../../errors/CustomError';
import {
  getSurveyOccurrenceSubmissionSQL,
  getDataPackageSQL,
  getPublishedSurveyStatusSQL,
  getSurveySQL,
  getProjectSQL,
  getSurveyFundingSourceSQL,
  getGeometryBoundingBoxSQL,
  getGeometryPolygonSQL
} from '../../queries/dwc/dwc-queries';
// import { getFileFromS3, uploadBufferToS3 } from '../../utils/file-utils';
// import { parseS3File, parseUnknownZipFile } from '../../utils/media/media-utils';
// import { MediaFile } from '../../utils/media/media-file';
// import AdmZip from 'adm-zip';
import * as xml2js from 'xml2js';
import { getDbCharacterSystemMetaDataConstantSQL } from '../../queries/codes/db-constant-queries';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';

type Eml = { [k: string]: any };

const defaultLog = getLogger('paths/dwc/eml');

// const defaultEMLFileName = 'eml.xml';
// const defaultEMLMimeType = 'application/xml';
// const defaultArchiveMimeType = 'application/zip';

export const POST: Operation = [logRequest('paths/dwc/eml', 'POST'), getSurveyDataPackageEML(), sendResponse()];

POST.apiDoc = {
  description: 'Produces an Ecological Metadata Language (EML) extract for a target data package.',
  tags: ['eml', 'dwc'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Request body',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['data_package_id'],
          properties: {
            data_package_id: {
              description: 'A data package ID',
              type: 'number',
              example: 1
            },
            supplied_title: {
              description: 'A user supplied title',
              type: 'string',
              example: 'My dataset title'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Ecological Metadata Language (EML) extract production OK'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getSurveyDataPackageEML(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getSurveyDataPackageEML', message: 'params', files: req.body });

    const connection = getDBConnection(req['keycloak_token']);

    if (!req.body.data_package_id) {
      throw new HTTP400('Missing required body param `data_package_id`.');
    }

    try {
      await connection.open();

      // get required data
      const occurrenceSubmission = await getSurveyOccurrenceSubmission(req.body.data_package_id, connection);

      // get the EML data for the survey
      const dataPackageEML = await getDataPackageEML(req.body.data_package_id, connection, req.body.supplied_title);
      defaultLog.debug({ label: 'getSurveyDataPackageEML', message: 'dataPackageEML is ' + dataPackageEML });
      // TODO: remove
      // dataPackageEML = await getDataPackageEMLDB(req.body.data_package_id, connection, req.body.supplied_title);

      // get the archive file from s3
      if (!occurrenceSubmission.rows[0].output_key) {
        throw new HTTP400('No S3 target output key found');
      }
      // TODO: uncomment
      // const s3Key = occurrenceSubmission.rows[0].output_key;
      // const s3File = await getFileFromS3(s3Key);

      // if (!s3File) {
      //   throw new HTTP500('Failed to get file from S3');
      // }

      // // parse the archive file and add EML file
      // const archiveFile = parseS3File(s3File);
      // const mediaFiles = parseUnknownZipFile(archiveFile.buffer);
      // mediaFiles.push(
      //   //new MediaFile(defaultEMLFileName, defaultEMLMimeType, Buffer.from(dataPackageEML.rows[0].api_get_eml_data_package))
      //   new MediaFile(defaultEMLFileName, defaultEMLMimeType, Buffer.from(dataPackageEML))
      // );

      // // build the archive zip file
      // const dwcArchiveZip = new AdmZip();
      // mediaFiles.forEach((file) => dwcArchiveZip.addFile(file.fileName, file.buffer));

      // // upload archive to s3
      // await uploadBufferToS3(dwcArchiveZip.toBuffer(), defaultArchiveMimeType, s3Key);

      next();
    } catch (error) {
      defaultLog.error({ label: 'getSurveyDataPackageEML', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function sendResponse(): RequestHandler {
  return async (req, res) => {
    return res.status(200).send();
  };
}

/**
 * Get database application constants value.
 *
 * @param {number} dataPackageId
 * @param {IDBConnection} connection
 * @param {string} suppliedTitle
 * @return {*} {Promise<void>}
 */
export const getDataPackageEML = async (
  dataPackageId: number,
  connection: IDBConnection,
  suppliedTitle?: string
): Promise<any> => {
  defaultLog.debug({
    label: 'getDataPackageEML',
    message: 'params',
    dataPackageId,
    suppliedTitle
  });

  // get all required data
  const dataPackage = await getDataPackage(dataPackageId, connection);
  const occurrenceSubmission = await getSurveyOccurrenceSubmission(dataPackageId, connection);
  const publishedSurveyStatus = await getPublishedSurveyStatus(
    occurrenceSubmission.rows[0].occurrence_submission_id,
    connection
  );
  const survey = await getSurvey(occurrenceSubmission.rows[0].survey_id, connection);
  const project = await getProject(survey.rows[0].project_id, connection);
  const surveyFundingSource = await getSurveyFundingSource(survey.rows[0].survey_id, connection);
  const surveyBoundingBox = await getSurveyBoundingBox(survey.rows[0].survey_id, connection);
  const surveyPolygons = await getSurveyPolygons(survey.rows[0].survey_id, connection);
  // database constants
  const simsProviderURL = checkProvided(
    (await getDbCharacterSystemMetaDataConstant('PROVIDER_URL', connection)).rows[0].constant
  );
  const securityProviderURL = checkProvided(
    (await getDbCharacterSystemMetaDataConstant('SECURITY_PROVIDER_URL', connection)).rows[0].constant
  );
  const organizationFullName = checkProvided(
    (await getDbCharacterSystemMetaDataConstant('ORGANIZATION_NAME_FULL', connection)).rows[0].constant
  );
  const organizationURL = checkProvided(
    (await getDbCharacterSystemMetaDataConstant('ORGANIZATION_URL', connection)).rows[0].constant
  );
  const intellectualRights = checkProvided(
    (await getDbCharacterSystemMetaDataConstant('INTELLECTUAL_RIGHTS', connection)).rows[0].constant
  );

  // build eml object
  const eml: Eml = {
    'eml:eml': {
      $: {
        'xmlns:eml': 'https://eml.ecoinformatics.org/eml-2.2.0',
        'xmlns:xsi': 'http://www.xml-cml.org/schema/stmml-1.1',
        'xmlns:stmml': 'http://www.xml-cml.org/schema/stmml-1.1',
        'xsi:schemaLocation': 'https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd'
      }
    }
  };

  const emlRoot = eml['eml:eml'];

  emlRoot.$.packageId = 'urn:uuid:' + dataPackage.rows[0].uuid;
  emlRoot.$.system = simsProviderURL;

  emlRoot.access = { $: { order: 'allowFirst' } };
  emlRoot.access.allow = {};
  emlRoot.access.allow.principal = 'public';
  emlRoot.access.allow.permission = 'read';
  emlRoot.access.$.system = securityProviderURL;

  emlRoot.dataset = { $: { order: 'allowFirst' } };
  emlRoot.dataset.$.id = dataPackage.rows[0].uuid;

  if (suppliedTitle) {
    emlRoot.dataset.title = suppliedTitle;
  } else if (dataPackage) {
    emlRoot.dataset.title = dataPackage.rows[0].uuid;
  }

  emlRoot.dataset.creator = organizationFullName;

  emlRoot.dataset.metadataProvider = {};
  emlRoot.dataset.metadataProvider.organizationName = organizationFullName;
  emlRoot.dataset.metadataProvider.onlineUrl = organizationURL;

  // TODO determine if this can be called without a publish date and if so what value to use?
  emlRoot.dataset.pubDate = publishedSurveyStatus.rows[0].status_event_timestamp.toISOString().split('T')[0];

  emlRoot.dataset.language = 'english';

  emlRoot.dataset.intellectualRights = {};
  emlRoot.dataset.intellectualRights.para = intellectualRights;

  emlRoot.dataset.contact = {};
  if (project.rows[0].coordinator_public) {
    emlRoot.dataset.contact.individualName = {};
    emlRoot.dataset.contact.individualName.givenName = project.rows[0].coordinator_first_name;
    emlRoot.dataset.contact.individualName.surName = project.rows[0].coordinator_last_name;
    emlRoot.dataset.contact.organizationName = project.rows[0].coordinator_agency_name;
    emlRoot.dataset.contact.electronicMailAddress = project.rows[0].coordinator_email_address;
  } else {
    emlRoot.dataset.contact.organizationName = organizationFullName;
    emlRoot.dataset.contact.onlineUrl = organizationURL;
  }

  // both projects and surveys are represented as "projects" in EML
  // main EML "project" is the survey
  emlRoot.dataset.project = { $: { id: survey.rows[0].uuid, system: simsProviderURL } };
  emlRoot.dataset.project.title = survey.rows[0].name;
  emlRoot.dataset.project.personnel = {};
  if (project.rows[0].coordinator_public) {
    emlRoot.dataset.project.personnel.individualName = {};
    emlRoot.dataset.project.personnel.individualName.givenName = survey.rows[0].lead_first_name;
    emlRoot.dataset.project.personnel.individualName.surName = survey.rows[0].lead_last_name;
    emlRoot.dataset.project.personnel.organizationName = project.rows[0].coordinator_agency_name;
    emlRoot.dataset.project.personnel.role = 'pointOfContact';
  } else {
    emlRoot.dataset.project.personnel.organizationName = organizationFullName;
    emlRoot.dataset.project.personnel.onlineUrl = organizationURL;
    emlRoot.dataset.project.personnel.role = 'custodianSteward';
  }

  emlRoot.dataset.project.abstract = {};
  emlRoot.dataset.project.abstract.section = {};
  emlRoot.dataset.project.abstract.section.title = 'Objectives';
  emlRoot.dataset.project.abstract.section.para = survey.rows[0].objectives;

  if (surveyFundingSource.rowCount) {
    addFundingSourceEML(eml, emlRoot, surveyFundingSource);
  }

  emlRoot.dataset.project.studyAreaDescription = {};
  emlRoot.dataset.project.studyAreaDescription.coverage = {};
  emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage = {};
  emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage.geographicDescription = survey.rows[0]
    .location_description
    ? survey.rows[0].location_name + ' - ' + survey.rows[0].location_description
    : survey.rows[0].location_name;
  emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage.boundingCoordinates = {};
  emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage.boundingCoordinates.westBoundingCoordinate =
    surveyBoundingBox.rows[0].st_xmax;
  emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage.boundingCoordinates.eastBoundingCoordinate =
    surveyBoundingBox.rows[0].st_ymax;
  emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage.boundingCoordinates.northBoundingCoordinate =
    surveyBoundingBox.rows[0].st_xmin;
  emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage.boundingCoordinates.southBoundingCoordinate =
    surveyBoundingBox.rows[0].st_ymin;
  emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage.datasetGPolygon = [];
  for (const row of surveyPolygons.rows) {
    emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage.datasetGPolygon[row.polygon - 1] = {};
    emlRoot.dataset.project.studyAreaDescription.coverage.geographicCoverage.datasetGPolygon[
      row.polygon - 1
    ].datasetGPolygonOuterGRing = {};
  }

  // convert object to xml
  const builder = new xml2js.Builder();
  return builder.buildObject(eml);
};

/**
 * Return funding source eml.
 *
 * @param {Eml} eml
 * @return {Eml}
 */
export const addFundingSourceEML = (eml: Eml, emlRoot: any, fundingSourceRows: any): Eml => {
  emlRoot.dataset.project.funding = {};
  emlRoot.dataset.project.funding.section = {};
  emlRoot.dataset.project.funding.section.title = 'Funding Source';
  for (const row of fundingSourceRows.rows) {
    emlRoot.dataset.project.funding.section.para = row.funding_source_name;
    emlRoot.dataset.project.funding.section.section = {};
    emlRoot.dataset.project.funding.section.section.title = 'Investment Action Category';
    emlRoot.dataset.project.funding.section.section.para = row.investment_action_category_name;

    emlRoot.dataset.project.funding.section.section.section = [];
    emlRoot.dataset.project.funding.section.section.section[0] = {};
    emlRoot.dataset.project.funding.section.section.section[0].title = 'Funding Source Project ID';
    emlRoot.dataset.project.funding.section.section.section[0].para = row.project_funding_source_id;
    emlRoot.dataset.project.funding.section.section.section[1] = {};
    emlRoot.dataset.project.funding.section.section.section[1].title = 'Funding Amount';
    emlRoot.dataset.project.funding.section.section.section[1].para = row.funding_amount;
    emlRoot.dataset.project.funding.section.section.section[2] = {};
    emlRoot.dataset.project.funding.section.section.section[2].title = 'Funding Start Date';
    emlRoot.dataset.project.funding.section.section.section[2].para = new Date(row.funding_start_date)
      .toISOString()
      .split('T')[0];
    emlRoot.dataset.project.funding.section.section.section[3] = {};
    emlRoot.dataset.project.funding.section.section.section[3].title = 'Funding End Date';
    emlRoot.dataset.project.funding.section.section.section[3].para = new Date(row.funding_end_date)
      .toISOString()
      .split('T')[0];
  }

  return eml;
};

/**
 * Return default message if value not provided.
 *
 * @param {string} valueToCheck
 * @param {IDBConnection} connection
 * @return {string | number}
 */
export const checkProvided = (valueToCheck: string | number | null): string | number => {
  // the EML specification requires all fields have values
  // fail gracefully by providing standard message that data is not supplied
  const notSuppliedMessage = 'Not Supplied';

  if (valueToCheck === null) {
    return notSuppliedMessage;
  }

  return valueToCheck;
};

/**
 * Get database application constants value.
 *
 * @param {string} constantName
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getDbCharacterSystemMetaDataConstant = async (
  constantName: string,
  connection: IDBConnection
): Promise<any> => {
  const sqlStatement = getDbCharacterSystemMetaDataConstantSQL(constantName);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return response;
};

/**
 * Get occurrence submission record associated with data package ID.
 *
 * @param {number} data_package_id
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getSurveyOccurrenceSubmission = async (dataPackageId: number, connection: IDBConnection): Promise<any> => {
  if (!dataPackageId || !connection) {
    throw new HTTP400('Failed to build SQL update statement');
  }
  const sqlStatement = getSurveyOccurrenceSubmissionSQL(dataPackageId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || response.rowCount != 1) {
    throw new HTTP400('Failed to acquire distinct survey occurrence submission record');
  }

  return response;
};

/**
 * Get data package record associated with data package ID.
 *
 * @param {number} data_package_id
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getDataPackage = async (dataPackageId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = getDataPackageSQL(dataPackageId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to acquire data package record');
  }

  return response;
};

/**
 * Get data package record associated with data package ID.
 *
 * @param {number} data_package_id
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getPublishedSurveyStatus = async (
  occurrenceSubmissionId: number,
  connection: IDBConnection
): Promise<any> => {
  const sqlStatement = getPublishedSurveyStatusSQL(occurrenceSubmissionId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return response;
};

/**
 * Get survey record.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getSurvey = async (surveyId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = getSurveySQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return response;
};

/**
 * Get project record.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getProject = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = getProjectSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return response;
};

/**
 * Get funding source records.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getSurveyFundingSource = async (surveyId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = getSurveyFundingSourceSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return response;
};

/**
 * Get survey bounding box.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getSurveyBoundingBox = async (surveyId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = getGeometryBoundingBoxSQL(surveyId, 'survey_id', 'survey');

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return response;
};

/**
 * Get survey polygons.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*} {Promise<void>}
 */
 export const getSurveyPolygons = async (surveyId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = getGeometryPolygonSQL(surveyId, 'survey_id', 'survey');

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return response;
};

// TODO: remove
/**
 * Get EML associated with data package ID.
 *
 * @param {number} dataPackageId
 * @param {IDBConnection} connection
 * @param {string} suppliedTitle
 * @return {*} {Promise<void>}
 */
// export const getDataPackageEMLDB = async (
//   dataPackageId: number,
//   connection: IDBConnection,
//   suppliedTitle?: string
// ): Promise<any> => {
//   if (!dataPackageId || !connection) {
//     return null;
//   }
//   const sqlStatement = getDataPackageEMLSQL(dataPackageId, suppliedTitle);

//   if (!sqlStatement) {
//     throw new HTTP400('Failed to build SQL update statement');
//   }

//   const response = await connection.query(sqlStatement.text, sqlStatement.values);

//   if (!response || !response.rowCount) {
//     throw new HTTP400('Failed to acquire survey occurrence submission record');
//   }

//   return response;
// };
