import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400, HTTP500} from '../../errors/CustomError';
import { getDataPackageEMLSQL, getSurveyOccurrenceSubmissionSQL } from '../../queries/dwc/dwc-queries';
import { getFileFromS3, uploadBufferToS3 } from '../../utils/file-utils';
import { parseS3File, parseUnknownZipFile } from '../../utils/media/media-utils';
import { MediaFile } from '../../utils/media/media-file';
import AdmZip from 'adm-zip';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/dwc/eml');

export const POST: Operation = [
  logRequest('paths/dwc/eml', 'POST'),
  getSurveyDataPackageEML(),
  sendResponse()
];

export const getOccurrenceSubmissionEMLDoc = (basicDescription: string, successDescription: string, tags: string[]) => {
  return {
    description: basicDescription,
    tags: tags,
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
        description: successDescription,
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
};

POST.apiDoc = {
  ...getOccurrenceSubmissionEMLDoc(
    'Produces an Ecological Metadata Language (EML) extract for a target data package.',
    'Ecological Metadata Language (EML) extract production OK',
    ['eml', 'dwc']
  )
};

export function getSurveyDataPackageEML(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getSurveyDataPackageEML', message: 'params', files: req.body });

    const connection = getDBConnection(req['keycloak_token']);

    if (!req.body.data_package_id) {
      throw new HTTP400('Missing required body param `data_package_id`.');
    }

    try {
      const sqlStatementOccurrenceSubmission = getSurveyOccurrenceSubmissionSQL(req.body.data_package_id);
      const sqlStatementDataPackageEML = getDataPackageEMLSQL(req.body.data_package_id, req.body.supplied_title);

      if (!sqlStatementOccurrenceSubmission) {
        throw new HTTP400('Failed to build occurrence submission SQL get statement');
      }
      if (!sqlStatementDataPackageEML) {
        throw new HTTP400('Failed to build data package EML SQL get statement');
      }

      await connection.open();

      // get the occurrence submission data
      const responseOccurrenceSubmission = await connection.query(sqlStatementOccurrenceSubmission.text, sqlStatementOccurrenceSubmission.values);

      if (!responseOccurrenceSubmission || !responseOccurrenceSubmission.rows.length) {
        throw new HTTP400('Failed to get occurrence submission data');
      }
      if (responseOccurrenceSubmission.rowCount > 1) {
        throw new HTTP400('Data package ID returned more than one survey');
       }

      // get the EML data for the survey
      const responseDataPackageEML = await connection.query(sqlStatementDataPackageEML.text, sqlStatementDataPackageEML.values);

      if (!responseDataPackageEML|| !responseDataPackageEML.rows.length) {
        throw new HTTP400('Failed to get data package EML');
      }

      // get the archive file from s3
      const s3Key = responseOccurrenceSubmission.rows[0].output_key + responseOccurrenceSubmission.rows[0].output_file_name;
      const s3File = await getFileFromS3(s3Key);

      if (!s3File) {
        throw new HTTP500('Failed to get file from S3');
      }

      // parse the archive file and add EML file
      const archiveFile = parseS3File(s3File);
      const mediaFiles = parseUnknownZipFile(archiveFile.buffer);
      mediaFiles.push(new MediaFile('eml.xml', 'application/xml', Buffer.from(responseDataPackageEML.rows[0].api_get_eml_data_package)));

      // build the archive zip file
      const dwcArchiveZip = new AdmZip();
      mediaFiles.forEach((file) => dwcArchiveZip.addFile(file.fileName, file.buffer));

      // upload archive to s3
      await uploadBufferToS3(dwcArchiveZip.toBuffer(), 'application/zip', s3Key);

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

