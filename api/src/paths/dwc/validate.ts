import AdmZip from 'adm-zip';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import mime from 'mime';
import { SYSTEM_ROLE } from '../../constants/roles';
import { HTTP400 } from '../../errors/CustomError';
import { ICsvState, validateCSVFile } from '../../utils/csv/csv-validation';
import { CSVFile, CustomFile } from '../../utils/csv/custom-file';
import { DWCArchive } from '../../utils/csv/dwc/dwc-archive';
import { DWC_CLASS, getDWCCSVValidators, isDWCArchiveValid } from '../../utils/csv/dwc/dwc-validator';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/project');

export const POST: Operation = [logRequest('paths/project', 'POST'), validateDWC()];

POST.apiDoc = {
  description: 'Validate a Darwin Core file.',
  tags: ['dwc'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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

/**
 * Validate a Darwin Core csv file.
 *
 * @returns {RequestHandler}
 */
function validateDWC(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'validateDWC', message: 'files.length', files: req?.files?.length });

    if (!req.files || !req.files.length) {
      // no media objects included
      throw new HTTP400('Missing upload data');
    }

    try {
      const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];

      const response: ICsvState[] = [];

      rawMediaArray.forEach((file: Express.Multer.File) => {
        const mimetype = mime.getType(file.originalname);

        if (mimetype === 'application/zip') {
          const dwcArchive = parseDWCArchive(file);
          response.push(...isDWCArchiveValid(dwcArchive));
          return;
        }

        const csvFile = new CSVFile(new CustomFile(file));
        response.push(validateCSVFile(csvFile, getDWCCSVValidators(DWC_CLASS.OCCURRENCE)).getState());
      });

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.debug({ label: 'validateDWC', message: 'error', error });
      throw error;
    }
  };
}

export function parseDWCArchive(zipFile: Express.Multer.File): DWCArchive {
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
}
