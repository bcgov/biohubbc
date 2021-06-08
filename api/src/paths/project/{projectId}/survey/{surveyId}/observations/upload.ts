'use strict';

import AdmZip from 'adm-zip';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import mime from 'mime';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { PostSurveyOccurrence } from '../../../../../../models/survey-occurrence';
import { postSurveyOccurrenceSQL } from '../../../../../../queries/survey/survey-occurrence-queries';
import { ICsvState, validateCSVFile } from '../../../../../../utils/csv/csv-validation';
import { CSVFile, CustomFile } from '../../../../../../utils/csv/custom-file';
import { DWCArchive } from '../../../../../../utils/csv/dwc/dwc-archive';
import { DWC_CLASS, getDWCCSVValidators, isDWCArchiveValid } from '../../../../../../utils/csv/dwc/dwc-validator';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/upload');

export const POST: Operation = [parseFiles(), validateDWC(), uploadDWC()];
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
      name: 'projectId',
      required: true
    },
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
      description: 'DWC response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              errors: {
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

function parseFiles(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'parseFiles', message: 'files.length', files: req?.files?.length });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param: projectId');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param: surveyId');
    }

    if (!req.files || !req.files.length) {
      // no media objects included
      throw new HTTP400('Missing upload data');
    }

    try {
      const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];

      const parsedFiles: (CSVFile | DWCArchive)[] = [];

      rawMediaArray.forEach((file: Express.Multer.File) => {
        const mimetype = mime.getType(file.originalname);

        if (mimetype === 'application/zip') {
          parsedFiles.push(parseDWCArchive(file));
        } else {
          const csvFile = new CSVFile(new CustomFile(file));
          parsedFiles.push(csvFile);
        }
      });

      // store the parsed files for use in subsequent steps
      req['parsedFiles'] = parsedFiles;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'validateDWC', message: 'error', error });
      throw error;
    }
  };
}

/**
 * Validate a Darwin Core csv file.
 *
 * @returns {RequestHandler}
 */
function validateDWC(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateDWC', message: 'files.length', files: req?.files?.length });

    const parsedFiles: (CSVFile | DWCArchive)[] = req['parsedFiles'];

    try {
      const response: ICsvState[] = [];

      parsedFiles.forEach((file: CSVFile | DWCArchive) => {
        if (file instanceof DWCArchive) {
          response.push(...isDWCArchiveValid(file as DWCArchive));
        }

        if (file instanceof CSVFile) {
          response.push(validateCSVFile(file as CSVFile, getDWCCSVValidators(DWC_CLASS.OCCURRENCE)).getState());
        }
      });

      if (hasErrors(response)) {
        // found errors in some csv files, return immediately
        return res.status(200).json(response);
      }

      // no errors found
      next();
    } catch (error) {
      defaultLog.debug({ label: 'validateDWC', message: 'error', error });
      throw error;
    }
  };
}

export function uploadDWC(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'uploadMedia', message: 'files.length', files: req?.files?.length });

    const connection = getDBConnection(req['keycloak_token']);

    const parsedFiles: (CSVFile | DWCArchive)[] = req['parsedFiles'];

    try {
      await connection.open();

      const dbPromises =
        parsedFiles.map((file: CSVFile | DWCArchive) => {
          if (file instanceof DWCArchive) {
            return uploadDWCArchiveOccurrences(Number(req.params.surveyId), file as DWCArchive, connection);
          }

          if (file instanceof CSVFile) {
            return uploadDWCOccurrences(Number(req.params.surveyId), file as CSVFile);
          }
        }) || [];

      await Promise.all(dbPromises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'uploadDWC', message: 'error', error });
      await connection.rollback();
      throw new HTTP400('Upload was not successful');
    } finally {
      connection.release();
    }
  };
}

// TODO needs improvement
export const uploadDWCArchiveOccurrences = async (surveyId: number, file: DWCArchive, connection: IDBConnection) => {
  const eventHeaders = file.event?.getHeaders();
  const eventRows = file.event?.getRows();

  const eventEventIdHeader = eventHeaders?.indexOf('eventID') as number;
  const eventGeodeticDatumHeader = eventHeaders?.indexOf('geodeticDatum') as number;
  const eventVerbatimCoordinatesHeader = eventHeaders?.indexOf('verbatimCoordinates') as number;

  const occurrenceHeaders = file.occurrence?.getHeaders();
  const occurrenceRows = file.occurrence?.getRows();

  const occurrenceEventIdHeader = occurrenceHeaders?.indexOf('eventID') as number;
  const associatedTaxaHeader = occurrenceHeaders?.indexOf('associatedTaxa') as number;
  const lifestageHeader = occurrenceHeaders?.indexOf('lifeStage') as number;

  return occurrenceRows?.map(async (row) => {
    const occurrenceEventId = row[occurrenceEventIdHeader];
    const associatedTaxa = row[associatedTaxaHeader];
    const lifestage = row[lifestageHeader];

    const data = { headers: occurrenceHeaders, rows: row };

    let geodeticDatum;
    let verbatimCoordinates;

    eventRows?.forEach((row) => {
      if (row[eventEventIdHeader] === occurrenceEventId) {
        geodeticDatum = row[eventGeodeticDatumHeader];
        verbatimCoordinates = row[eventVerbatimCoordinatesHeader];
      }
    });

    const occurrence = new PostSurveyOccurrence({
      associatedtaxa: associatedTaxa,
      lifestage: lifestage,
      data,
      geodeticDatum: geodeticDatum,
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

export const uploadDWCOccurrences = async (surveyId: number, file: CSVFile) => {
  return null;
};

export const parseDWCArchive = (zipFile: Express.Multer.File): DWCArchive => {
  const unzippedFile = new AdmZip(zipFile.buffer);
  const entries = unzippedFile.getEntries();

  const dwcArchive = new DWCArchive();

  entries.forEach((entry) => {
    if (entry.isDirectory) {
      return;
    }

    const csvFile = new CSVFile(new CustomFile(entry));

    if (/^event\.\w+$/.test(csvFile.fileName)) {
      dwcArchive.event = csvFile;
    }

    if (/^occurrence\.\w+$/.test(csvFile.fileName)) {
      dwcArchive.occurrence = csvFile;
    }

    if (/^measurementorfact\.\w+$/.test(csvFile.fileName)) {
      dwcArchive.measurementorfact = csvFile;
    }

    if (/^resourcerelationship\.\w+$/.test(csvFile.fileName)) {
      dwcArchive.resourcerelationship = csvFile;
    }

    if (/^meta\.\w+$/.test(csvFile.fileName)) {
      dwcArchive.meta = csvFile;
    }
  });

  return dwcArchive;
};

export const hasErrors = (csvStates: ICsvState[]): boolean => {
  if (!csvStates?.length) {
    return false;
  }

  for (const csvState of csvStates) {
    if (!csvState.isValid) {
      return true;
    }
  }

  return false;
};
