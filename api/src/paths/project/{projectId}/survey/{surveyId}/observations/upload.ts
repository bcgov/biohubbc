import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { PostSurveyOccurrence } from '../../../../../../models/survey-occurrence';
import { postSurveyOccurrenceSQL } from '../../../../../../queries/survey/survey-occurrence-queries';
import { getLogger } from '../../../../../../utils/logger';
import { ICsvState } from '../../../../../../utils/media/csv/csv-file';
import { DWCArchive } from '../../../../../../utils/media/csv/dwc/dwc-archive-file';
import { isDWCArchiveValid } from '../../../../../../utils/media/csv/dwc/dwc-archive-validator';
import { IMediaState } from '../../../../../../utils/media/media-file';
import { parseUnknownMedia } from '../../../../../../utils/media/media-utils';
import { logRequest } from '../../../../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/observations/upload');

export const POST: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/observations/upload', 'POST'),
  prepDWCArchive(),
  validateDWCArchive(),
  uploadDWCArchive()
];

POST.apiDoc = {
  description: 'Upload and validate a Darwin Core archive or occurrence csv file.',
  tags: ['dwc'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      required: true
    }
  ],
  requestBody: {
    description: 'Darwin Core csv file(s) to validate.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              type: 'array',
              description: 'An array of Darwin Core files to validate',
              items: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Darwin Core Archive response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              errors: {
                oneOf: [
                  {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        fileName: {
                          type: 'string'
                        },
                        fileErrors: {
                          type: 'array',
                          items: {
                            type: 'string'
                          }
                        },
                        isValid: {
                          type: 'boolean'
                        }
                      }
                    }
                  },
                  {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        fileName: {
                          type: 'string'
                        },
                        fileErrors: {
                          type: 'array',
                          items: {
                            type: 'string'
                          }
                        },
                        headerErrors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              type: {
                                type: 'string'
                              },
                              code: {
                                type: 'string'
                              },
                              message: {
                                type: 'string'
                              },
                              col: {
                                oneOf: [
                                  {
                                    type: 'string'
                                  },
                                  {
                                    type: 'number'
                                  }
                                ]
                              }
                            }
                          }
                        },
                        rowErrors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              type: {
                                type: 'string'
                              },
                              code: {
                                type: 'string'
                              },
                              message: {
                                type: 'string'
                              },
                              row: {
                                type: 'number'
                              }
                            }
                          }
                        },
                        isValid: {
                          type: 'boolean'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
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

function prepDWCArchive(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'prepDWCArchive', message: 'files.length', files: req?.files?.length });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param: surveyId');
    }

    if (!req.files || !req.files.length) {
      // no media objects included
      throw new HTTP400('Missing upload data');
    }

    if (req.files.length !== 1) {
      // no media objects included
      throw new HTTP400('Too many files uploaded, expected 1.');
    }

    try {
      const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];

      const rawMediaFile = rawMediaArray[0];

      const mediaFiles = parseUnknownMedia(rawMediaFile);

      const dwcArchive = new DWCArchive(mediaFiles);

      req['dwcArchive'] = dwcArchive;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'prepDWCArchive', message: 'error', error });
      throw error;
    }
  };
}

/**
 * Validate a Darwin Core csv file.
 *
 * @returns {RequestHandler}
 */
function validateDWCArchive(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateDWCArchive', message: 'files.length', files: req?.files?.length });

    try {
      const dwcArchive: DWCArchive = req['dwcArchive'];

      const mediaState: IMediaState[] = dwcArchive.isValid();

      if (mediaState.some((item) => !item.isValid)) {
        return res.status(200).json(mediaState);
      }

      const csvState: ICsvState[] = isDWCArchiveValid(dwcArchive);

      if (csvState.some((item) => !item.isValid)) {
        return res.status(200).json(mediaState);
      }

      next();
    } catch (error) {
      defaultLog.debug({ label: 'validateDWCArchive', message: 'error', error });
      throw error;
    }
  };
}

export function uploadDWCArchive(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'uploadDWCArchive', message: 'files.length', files: req?.files?.length });

    const connection = getDBConnection(req['keycloak_token']);

    const dwcArchive: DWCArchive = req['dwcArchive'];

    try {
      await connection.open();

      await uploadDWCArchiveOccurrences(Number(req.params.surveyId), dwcArchive, connection);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'uploadDWCArchive', message: 'error', error });
      await connection.rollback();
      throw new HTTP400('Upload was not successful');
    } finally {
      connection.release();
    }
  };
}

// TODO needs improvement
export const uploadDWCArchiveOccurrences = async (surveyId: number, file: DWCArchive, connection: IDBConnection) => {
  const eventHeaders = file.worksheets.event?.getHeaders();
  const eventRows = file.worksheets.event?.getRows();

  const eventEventIdHeader = eventHeaders?.indexOf('eventID') as number;
  const eventVerbatimCoordinatesHeader = eventHeaders?.indexOf('verbatimCoordinates') as number;

  const occurrenceHeaders = file.worksheets.occurrence?.getHeaders();
  const occurrenceRows = file.worksheets.occurrence?.getRows();

  const occurrenceEventIdHeader = occurrenceHeaders?.indexOf('eventID') as number;
  const associatedTaxaHeader = occurrenceHeaders?.indexOf('associatedTaxa') as number;
  const lifestageHeader = occurrenceHeaders?.indexOf('lifeStage') as number;

  return occurrenceRows?.map(async (row) => {
    const occurrenceEventId = row[occurrenceEventIdHeader];
    const associatedTaxa = row[associatedTaxaHeader];
    const lifestage = row[lifestageHeader];

    const data = { headers: occurrenceHeaders, rows: row };

    let verbatimCoordinates;

    eventRows?.forEach((row) => {
      if (row[eventEventIdHeader] === occurrenceEventId) {
        verbatimCoordinates = row[eventVerbatimCoordinatesHeader];
      }
    });

    const occurrence = new PostSurveyOccurrence({
      associatedtaxa: associatedTaxa,
      lifestage: lifestage,
      data,
      verbatimCoordinates: verbatimCoordinates
    });

    const sqlStatement = postSurveyOccurrenceSQL(surveyId, occurrence);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL post statement');
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert survey occurrence data');
    }
  });
};
