import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getSubmissionFileFromS3, getSubmissionS3Key } from '../../paths/dwc/validate';
import { uploadBufferToS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { TransformationSchemaParser } from '../../utils/media/xlsx/transformation/transformation-schema-parser';
import { XLSXTransformation } from '../../utils/media/xlsx/transformation/xlsx-transformation';
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
    // TODO store this schema in the database
    req['transformationSchema'] = {
      name: 'test file 1',
      flatten: [
        { fileName: 'Effort & Site Conditions', uniqueId: ['Survey Area', 'Sampling Unit ID', 'Stratum'] },
        {
          fileName: 'Observations - Skeena',
          uniqueId: ['Waypoint'],
          parent: { fileName: 'Effort & Site Conditions', uniqueId: ['Survey Area', 'Sampling Unit ID', 'Stratum'] }
        },
        {
          fileName: 'UTM_LatLong',
          uniqueId: ['Waypoint'],
          parent: { fileName: 'Observations - Skeena', uniqueId: ['Waypoint'] }
        }
      ],
      transformations: [
        {
          fileTransformations: [
            {
              fileName: 'event',
              fields: {
                id: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
                  separator: ':'
                },
                eventID: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
                  separator: ':'
                },
                eventDate: {
                  columns: ['Date']
                },
                verbatimCoordinates: {
                  columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
                }
              }
            },
            {
              fileName: 'occurrence',
              conditionalFields: ['individualCount'],
              fields: {
                occurrenceID: {
                  columns: ['Waypoint'],
                  unique: 'occ'
                },
                individualCount: {
                  columns: ['Mature Bulls']
                },
                taxon: {
                  columns: ['Species']
                },
                lifestage: {
                  value: 'Adult'
                },
                sex: {
                  value: 'Male'
                },
                occurrenceRemarks: {
                  columns: ['Observation Comments']
                }
              }
            }
          ]
        },
        {
          fileTransformations: [
            {
              fileName: 'event',
              fields: {
                id: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
                  separator: ':'
                },
                eventID: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
                  separator: ':'
                },
                eventDate: {
                  columns: ['Date']
                },
                verbatimCoordinates: {
                  columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
                }
              }
            },
            {
              fileName: 'occurrence',
              conditionalFields: ['individualCount'],
              fields: {
                occurrenceID: {
                  columns: ['Waypoint'],
                  unique: 'occ'
                },
                individualCount: {
                  columns: ['Yearlings Bulls']
                },
                taxon: {
                  columns: ['Species']
                },
                lifestage: {
                  value: 'Yearling'
                },
                sex: {
                  value: 'Male'
                },
                occurrenceRemarks: {
                  columns: ['Observation Comments']
                }
              }
            }
          ]
        },
        {
          fileTransformations: [
            {
              fileName: 'event',
              fields: {
                id: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
                  separator: ':'
                },
                eventID: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
                  separator: ':'
                },
                eventDate: {
                  columns: ['Date']
                },
                verbatimCoordinates: {
                  columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
                }
              }
            },
            {
              fileName: 'occurrence',
              conditionalFields: ['individualCount'],
              fields: {
                occurrenceID: {
                  columns: ['Waypoint'],
                  unique: 'occ'
                },
                individualCount: {
                  columns: ['Lone Cows']
                },
                taxon: {
                  columns: ['Species']
                },
                lifestage: {
                  value: 'Adult'
                },
                sex: {
                  value: 'Female'
                },
                occurrenceRemarks: {
                  columns: ['Observation Comments']
                }
              }
            }
          ]
        },
        {
          fileTransformations: [
            {
              fileName: 'event',
              fields: {
                id: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
                  separator: ':'
                },
                eventID: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
                  separator: ':'
                },
                eventDate: {
                  columns: ['Date']
                },
                verbatimCoordinates: {
                  columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
                }
              }
            },
            {
              fileName: 'occurrence',
              conditionalFields: ['individualCount'],
              fields: {
                occurrenceID: {
                  columns: ['Waypoint'],
                  unique: 'occ'
                },
                individualCount: {
                  columns: ['Unclassified Bulls']
                },
                taxon: {
                  columns: ['Species']
                },
                lifestage: {
                  value: 'unknown'
                },
                sex: {
                  value: 'Male'
                },
                occurrenceRemarks: {
                  columns: ['Observation Comments']
                }
              }
            }
          ]
        },
        {
          fileTransformations: [
            {
              fileName: 'event',
              fields: {
                id: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
                  separator: ':'
                },
                eventID: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
                  separator: ':'
                },
                eventDate: {
                  columns: ['Date']
                },
                verbatimCoordinates: {
                  columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
                }
              }
            },
            {
              fileName: 'occurrence',
              conditionalFields: ['individualCount'],
              fields: {
                occurrenceID: {
                  columns: ['Waypoint'],
                  unique: 'occ'
                },
                individualCount: {
                  columns: ['Cow W/1 calf']
                },
                taxon: {
                  columns: ['Species']
                },
                lifestage: {
                  value: 'Adult'
                },
                sex: {
                  value: 'Female'
                },
                occurrenceRemarks: {
                  columns: ['Observation Comments']
                }
              }
            }
          ]
        },
        {
          fileTransformations: [
            {
              fileName: 'event',
              fields: {
                id: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
                  separator: ':'
                },
                eventID: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
                  separator: ':'
                },
                eventDate: {
                  columns: ['Date']
                },
                verbatimCoordinates: {
                  columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
                }
              }
            },
            {
              fileName: 'occurrence',
              conditionalFields: ['individualCount'],
              fields: {
                occurrenceID: {
                  columns: ['Waypoint'],
                  unique: 'occ'
                },
                individualCount: {
                  columns: ['Cow W/2 calves']
                },
                taxon: {
                  columns: ['Species']
                },
                lifestage: {
                  value: 'Adult'
                },
                sex: {
                  value: 'Female'
                },
                occurrenceRemarks: {
                  columns: ['Observation Comments']
                }
              }
            }
          ]
        },
        {
          fileTransformations: [
            {
              fileName: 'event',
              fields: {
                id: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
                  separator: ':'
                },
                eventID: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
                  separator: ':'
                },
                eventDate: {
                  columns: ['Date']
                },
                verbatimCoordinates: {
                  columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
                }
              }
            },
            {
              fileName: 'occurrence',
              conditionalFields: ['individualCount'],
              fields: {
                occurrenceID: {
                  columns: ['Waypoint'],
                  unique: 'occ'
                },
                individualCount: {
                  columns: ['Lone calf']
                },
                taxon: {
                  columns: ['Species']
                },
                lifestage: {
                  value: 'Yearling'
                },
                sex: {
                  value: 'unknown'
                },
                occurrenceRemarks: {
                  columns: ['Observation Comments']
                }
              }
            }
          ]
        },
        {
          fileTransformations: [
            {
              fileName: 'event',
              fields: {
                id: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum', 'Waypoint'],
                  separator: ':'
                },
                eventID: {
                  columns: ['Survey Area', 'Sampling Unit ID', 'Stratum'],
                  separator: ':'
                },
                eventDate: {
                  columns: ['Date']
                },
                verbatimCoordinates: {
                  columns: ['Site UTM Zone', 'Site Easting', 'Site Northing']
                }
              }
            },
            {
              fileName: 'occurrence',
              conditionalFields: ['individualCount'],
              fields: {
                occurrenceID: {
                  columns: ['Waypoint'],
                  unique: 'occ'
                },
                individualCount: {
                  columns: ['Unclassified']
                },
                taxon: {
                  columns: ['Species']
                },
                lifestage: {
                  value: 'unknown'
                },
                sex: {
                  value: 'unknown'
                },
                occurrenceRemarks: {
                  columns: ['Observation Comments']
                }
              }
            }
          ]
        }
      ],
      parse: [
        {
          fileName: 'event',
          columns: ['id', 'eventID', 'eventDate', 'verbatimCoordinates']
        },
        {
          fileName: 'occurrence',
          conditionalFields: ['individualCount'],
          columns: ['id', 'occurrenceID', 'individualCount', 'taxon', 'lifestage', 'sex', 'occurrenceRemarks']
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

      const xlsxTransformation = new XLSXTransformation(transformationSchemaParser, xlsxCsv);

      const transformedData = xlsxTransformation.transform();

      const worksheets = xlsxTransformation.dataToSheet(transformedData);

      const fileBuffers = Object.entries(worksheets).map(([fileName, worksheet]) => {
        return {
          name: fileName,
          buffer: xlsxCsv.worksheetToBuffer(worksheet)
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
