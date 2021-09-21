import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getSubmissionFileFromS3, getSubmissionS3Key } from '../../paths/dwc/validate';
import { uploadBufferToS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { TransformationSchemaParser } from '../../utils/media/xlsx/transformation/transformation-schema-parser';
import { TargetFile } from '../../utils/media/xlsx/transformation/XLSXTransformation';
import { XLSXCSV } from '../../utils/media/xlsx/xlsx-file';
import { logRequest } from '../../utils/path-utils';
import { prepXLSX } from './validate';

const defaultLog = getLogger('paths/xlsx/transform');

export const POST: Operation = [
  logRequest('paths/xlsx/transform', 'POST'),
  getSubmissionS3Key(),
  getSubmissionFileFromS3(),
  prepXLSX(),
  persistParseErrors(),
  getTransformationSchema(),
  getTransformationRules(),
  transformXLSX(),
  persistTransformationResults()
];

POST.apiDoc = {
  description: 'Transforms an XLSX survey observation submission file into a Darwin Core Archive file',
  tags: ['survey', 'observation', 'xlsx'],
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
          required: ['occurrence_submission_id'],
          properties: {
            occurrence_submission_id: {
              description: 'A survey occurrence submission ID',
              type: 'number',
              example: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Transform XLSX survey observation submission OK'
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

export function persistParseErrors(): RequestHandler {
  return async (req, res, next) => {
    const parseError = req['parseError'];

    if (!parseError) {
      // no errors to persist, skip to next step
      return next();
    }

    // file is not parsable, don't continue to next step and return early
    return res.status(200).json();
  };
}

export function getTransformationSchema(): RequestHandler {
  return async (req, res, next) => {
    req['transformationSchema'] = {
      name: 'test file 1',
      files: [
        {
          name: 'Observations - Skeena',
          transformations: [
            {
              basic_transformer: {
                coreid: {
                  file: 'Observations - Skeena',
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint']
                },
                source: {
                  file: 'Observations - Skeena',
                  column: 'Yearlings Bulls'
                },
                target: {
                  file: 'occurrence',
                  column: 'individualCount'
                },
                extra: {
                  additional_targets: {
                    targets: [
                      {
                        file: 'occurrence',
                        column: 'Sex',
                        value: 'Male'
                      },
                      {
                        file: 'occurrence',
                        column: 'Lifestage',
                        value: 'Yearling'
                      }
                    ]
                  }
                },
                pivot: 'p1'
              }
            },
            {
              basic_transformer: {
                coreid: {
                  file: 'Observations - Skeena',
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint']
                },
                source: {
                  file: 'Observations - Skeena',
                  column: 'Mature Bulls'
                },
                target: {
                  file: 'occurrence',
                  column: 'individualCount'
                },
                extra: {
                  additional_targets: {
                    targets: [
                      {
                        file: 'occurrence',
                        column: 'Sex',
                        value: 'Male'
                      },
                      {
                        file: 'occurrence',
                        column: 'Lifestage',
                        value: 'Adult'
                      }
                    ]
                  }
                },
                pivot: 'p2'
              }
            },
            {
              basic_transformer: {
                coreid: {
                  file: 'Observations - Skeena',
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint']
                },
                source: {
                  file: 'Observations - Skeena',
                  column: 'Lone Cows'
                },
                target: {
                  file: 'occurrence',
                  column: 'individualCount'
                },
                extra: {
                  additional_targets: {
                    targets: [
                      {
                        file: 'occurrence',
                        column: 'Sex',
                        value: 'Female'
                      },
                      {
                        file: 'occurrence',
                        column: 'Lifestage',
                        value: 'Adult'
                      }
                    ]
                  }
                },
                pivot: 'p3'
              }
            },
            {
              basic_transformer: {
                coreid: {
                  file: 'Observations - Skeena',
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint']
                },
                source: {
                  file: 'Observations - Skeena',
                  column: 'Comments'
                },
                target: {
                  file: 'occurrence',
                  column: 'occurrenceRemarks'
                }
              }
            },
            {
              basic_transformer: {
                coreid: {
                  file: 'Observations - Skeena',
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint']
                },
                source: {
                  file: 'Observations - Skeena',
                  column: 'Species'
                },
                target: {
                  file: 'occurrence',
                  column: 'Taxon'
                }
              }
            }
          ]
        },
        {
          name: 'Effort & Site Conditions',
          transformations: [
            {
              basic_transformer: {
                coreid: {
                  file: 'Effort & Site Conditions',
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum']
                },
                source: {
                  file: 'Effort & Site Conditions',
                  column: 'Date'
                },
                target: {
                  file: 'event',
                  column: 'eventDate'
                }
              }
            },
            {
              basic_transformer: {
                coreid: {
                  file: 'Effort & Site Conditions',
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum']
                },
                source: {
                  file: 'Effort & Site Conditions',
                  column: 'Start Time 1'
                },
                target: {
                  file: 'event',
                  column: 'eventTime'
                }
              }
            }
          ]
        }
      ]
    };

    next();
  };
}

export function getTransformationRules(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getTransformationRules', message: 's3File' });

    try {
      const transformationSchema: JSON = req['transformationSchema'];

      const transformationSchemaParser = new TransformationSchemaParser(transformationSchema);

      req['transformationSchemaParser'] = transformationSchemaParser;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getTransformationRules', message: 'error', error });
      throw error;
    }
  };
}

function transformXLSX(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'transformXLSX', message: 'xlsx' });

    try {
      const xlsxCsv: XLSXCSV = req['xlsx'];

      const transformationSchemaParser: TransformationSchemaParser = req['transformationSchemaParser'];

      const xlsxTransformationTarget = xlsxCsv.transformToDWC(transformationSchemaParser);

      const files: TargetFile[] = xlsxTransformationTarget.files;

      const fileBuffers = files.map((file) => {
        const x = file.toBuffer(); //file.toCSV();
        console.log(file.fileName, '================================');
        console.log(x);
        console.log('================================');
        return {
          name: file.fileName,
          buffer: x
        };
      });

      req['fileBuffers'] = fileBuffers;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'transformXLSX', message: 'error', error });
      throw error;
    }
  };
}

export function persistTransformationResults(): RequestHandler {
  return async (req, res) => {
    const fileBuffers: { name: string; buffer: Buffer }[] = req['fileBuffers'];

    const promises = fileBuffers.map((record) =>
      uploadBufferToS3(record.buffer, 'text/csv', `testing_transformations/${record.name}.csv`)
    );

    await Promise.all(promises);

    return res.sendStatus(200);
  };
}
