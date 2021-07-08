import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { HTTP400 } from '../../errors/CustomError';
import { getLogger } from '../../utils/logger';
import { ICsvState } from '../../utils/media/csv/csv-file';
import { DWCArchive } from '../../utils/media/csv/dwc/dwc-archive-file';
import { isDWCArchiveValid } from '../../utils/media/csv/dwc/dwc-archive-validator';
import { IMediaState } from '../../utils/media/media-file';
import { parseUnknownMedia } from '../../utils/media/media-utils';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/dwc/validate');

export const POST: Operation = [logRequest('paths/dwc/validate', 'POST'), prepDWCArchive(), validateDWCArchive()];

POST.apiDoc = {
  description: 'Validate a Darwin Core archive file.',
  tags: ['dwc'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Darwin Core archive to validate.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              description: 'A Darwin Core archive zip file.',
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
  return async (req, res) => {
    defaultLog.debug({ label: 'validateDWCArchive', message: 'files.length', files: req?.files?.length });

    try {
      const dwcArchive: DWCArchive = req['dwcArchive'];

      const mediaState: IMediaState[] = dwcArchive.isValid();

      if (mediaState.some((item) => !item.isValid)) {
        return res.status(200).json(mediaState);
      }

      const csvState: ICsvState[] = isDWCArchiveValid(dwcArchive);

      return res.status(200).json(csvState);
    } catch (error) {
      defaultLog.debug({ label: 'validateDWCArchive', message: 'error', error });
      throw error;
    }
  };
}
