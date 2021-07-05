import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { HTTP400 } from '../../errors/CustomError';
import { getLogger } from '../../utils/logger';
import { ICsvState, XLSXCSV } from '../../utils/media/csv/csv-file';
import { isSPITemplateValid } from '../../utils/media/csv/spi/spi-validator';
import { IMediaState } from '../../utils/media/media-file';
import { parseUnknownMedia } from '../../utils/media/media-utils';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/project');

export const POST: Operation = [logRequest('paths/spi/transform', 'POST'), prepSPITemplate(), validateSPITemplate()];

POST.apiDoc = {
  description: 'Validate a SPI template into Darwin Core.',
  tags: ['spi'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'SPI excel template file(s) to validate into Darwin Core.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              description: 'A SPI excel template',
              type: 'string',
              format: 'binary'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'SPI response object.',
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

/**
 * Prepare a raw SPI template for valdiation.
 * Call the next step if no errors encountered, otherwise return errors.
 *
 * @return {*}  {RequestHandler}
 */
function prepSPITemplate(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'prepSPITemplate', message: 'prepSPITemplate' });

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

      // mediaFiles[0].mediaValidation.

      if (!mediaFiles || !mediaFiles.length) {
        const response: ICsvState[] = [
          {
            fileName: rawMediaFile.originalname,
            fileErrors: ['Not a compatible Excel Workbook. Unable to parse file.'],
            isValid: false
          }
        ];

        return res.status(200).json(response);
      }

      if (mediaFiles.length > 1) {
        const response: ICsvState[] = [
          {
            fileName: rawMediaFile.originalname,
            fileErrors: ['Not a compatible Excel Workbook. Multiple files found when one expected.'],
            isValid: false
          }
        ];

        return res.status(200).json(response);
      }

      const mediaFile = mediaFiles[0];

      const xlsxCSV = new XLSXCSV(mediaFile);

      const mediaState: IMediaState[] = xlsxCSV.isValid();

      if (mediaState.some((item) => !item.isValid)) {
        return res.status(200).json(mediaState);
      }

      req['xlsxCSV'] = xlsxCSV;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'prepSPITemplate', message: 'error', error });
      throw error;
    }
  };
}

/**
 * Validate a SPI excel file contains no errors.
 * Call the next step if no errors found, otherwise return errors.
 *
 * @returns {RequestHandler}
 */
function validateSPITemplate(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'validateSPITemplate', message: 'validateSPI' });

    try {
      const xlsxCSV: XLSXCSV = req['xlsxCSV'];

      const validationResults: ICsvState[] = isSPITemplateValid(xlsxCSV);

      return res.status(200).json(validationResults);
    } catch (error) {
      defaultLog.debug({ label: 'validateSPITemplate', message: 'error', error });
      throw error;
    }
  };
}
