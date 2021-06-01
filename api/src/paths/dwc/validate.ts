import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { HTTP400 } from '../../errors/CustomError';
import { isFileValid } from '../../utils/csv-validator';
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
                    fileErrors: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    },
                    headerErrors: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
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

const getValidHeaders = () => {
  return ['first_name', 'last_name', 'date-time', 'species'];
};

const getRequiredHeaders = () => {
  return ['first_name', 'last_name', 'date-time', 'species', 'count', 'location', 'elevation'];
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

      let response;

      rawMediaArray.forEach((file: Express.Multer.File) => {
        response = isFileValid(file, {
          requiredHeaders: getValidHeaders(),
          validHeaders: getRequiredHeaders()
        });
      });

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.debug({ label: 'validateDWC', message: 'error', error });
      throw error;
    }
  };
}
