import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
//import { HTTP400, HTTP500 } from '../../errors/CustomError';
import { HTTP400 } from '../../errors/CustomError';
import {
  getSurveyOccurrenceSubmissionSQL,
  getDataPackageSQL,
  getPublishedSurveyStatusSQL
} from '../../queries/dwc/dwc-queries';
// import { getFileFromS3, uploadBufferToS3 } from '../../utils/file-utils';
// import { parseS3File, parseUnknownZipFile } from '../../utils/media/media-utils';
// import { MediaFile } from '../../utils/media/media-file';
// import AdmZip from 'adm-zip';
import * as xml2js from 'xml2js';
import { getDbCharacterSystemMetaDataConstantSQL } from '../../queries/codes/db-constant-queries';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';

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

  // the EML specification requires all fields with values
  // fail gracefully by providing standard message that data is not supplied
  const notSuppliedMessage = 'Not Supplied';

  // get all required data
  const dataPackage = await getDataPackage(dataPackageId, connection);
  const occurrenceSubmission = await getSurveyOccurrenceSubmission(dataPackageId, connection);
  const publishedSurveyStatus = await getPublishedSurveyStatus(
    occurrenceSubmission.rows[0].occurrence_submission_id,
    connection
  );
  // database constants
  const simsProviderURL = await getDbCharacterSystemMetaDataConstant('PROVIDER_URL', connection);
  const securityProviderURL = await getDbCharacterSystemMetaDataConstant('SECURITY_PROVIDER_URL', connection);
  const organizationFullName = await getDbCharacterSystemMetaDataConstant('ORGANIZATION_NAME_FULL', connection);
  const organizationURL = await getDbCharacterSystemMetaDataConstant('ORGANIZATION_URL', connection);
  const intellectualRights = await getDbCharacterSystemMetaDataConstant('INTELLECTUAL_RIGHTS', connection);

  // build eml object
  const eml: { [k: string]: any } = {
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
  emlRoot.$.system = simsProviderURL.rows[0].constant ? simsProviderURL.rows[0].constant : notSuppliedMessage;
  //eml.access
  emlRoot.access = { $: { order: 'allowFirst' } };
  emlRoot.access.allow = {};
  emlRoot.access.allow.principal = 'public';
  emlRoot.access.allow.permission = 'read';
  emlRoot.access.$.system = securityProviderURL.rows[0].constant
    ? securityProviderURL.rows[0].constant
    : notSuppliedMessage;

  //eml.dataset
  emlRoot.dataset = { $: { order: 'allowFirst' } };
  emlRoot.dataset.$.id = dataPackage.rows[0].uuid;
  //eml.dataset.title
  if (suppliedTitle) {
    emlRoot.dataset.title = suppliedTitle;
  } else if (dataPackage) {
    emlRoot.dataset.title = dataPackage.rows[0].uuid;
  }
  //eml.dataset.creator
  emlRoot.dataset.creator = organizationFullName.rows[0].constant
    ? organizationFullName.rows[0].constant
    : notSuppliedMessage;
  //eml.dataset.metadataProvider
  emlRoot.dataset.metadataProvider = {};
  emlRoot.dataset.metadataProvider.organizationName = organizationFullName.rows[0].constant
    ? organizationFullName.rows[0].constant
    : notSuppliedMessage;
  emlRoot.dataset.metadataProvider.onlineUrl = organizationURL.rows[0].constant
    ? organizationURL.rows[0].constant
    : notSuppliedMessage;
  //eml.dataset.pubDate
  // TODO determine if this can be called without a publish date and if so what value to use?
  emlRoot.dataset.pubDate = publishedSurveyStatus.rows[0].status_event_timestamp.toISOString().split('T')[0];
  //eml.dataset.language
  emlRoot.dataset.language = 'english';
  //eml.dataset.intellectualRights
  emlRoot.dataset.intellectualRights = intellectualRights.rows[0].constant;

  // convert object to xml
  const builder = new xml2js.Builder();
  return builder.buildObject(eml);
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
