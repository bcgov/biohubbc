import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { GeoJSONFeature } from '../../../../../../../openapi/schemas/geoJson';
import { UpdateSampleLocationRecord } from '../../../../../../../repositories/sample-location-repository';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../../services/observation-service';
import { SampleLocationService } from '../../../../../../../services/sample-location-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/sample-site/{surveySampleSiteId}');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  updateSurveySampleSite()
];

PUT.apiDoc = {
  description: 'update survey sample site',
  tags: ['survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveySampleSiteId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['sampleSite'],
          properties: {
            sampleSite: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'description', 'methods', 'survey_sample_sites'],
              properties: {
                survey_id: {
                  type: 'integer'
                },
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string'
                },
                geojson: {
                  ...(GeoJSONFeature as object)
                },
                methods: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['description', 'periods'],
                    properties: {
                      survey_sample_site_id: {
                        type: 'integer',
                        nullable: true
                      },
                      survey_sample_method_id: {
                        type: 'integer',
                        nullable: true
                      },
                      method_lookup_id: {
                        type: 'integer',
                        minimum: 1,
                        nullable: true
                      },
                      description: {
                        type: 'string'
                      },
                      periods: {
                        type: 'array',
                        minItems: 1,
                        items: {
                          type: 'object',
                          additionalProperties: false,
                          required: ['start_date', 'end_date'],
                          properties: {
                            survey_sample_period_id: {
                              type: 'integer',
                              nullable: true
                            },
                            survey_sample_method_id: {
                              type: 'integer',
                              nullable: true
                            },
                            method_lookup_id: {
                              type: 'integer',
                              nullable: true
                            },
                            start_date: {
                              type: 'string'
                            },
                            end_date: {
                              type: 'string'
                            },
                            start_time: {
                              type: 'string',
                              nullable: true
                            },
                            end_time: {
                              type: 'string',
                              nullable: true
                            }
                          }
                        }
                      }
                    }
                  }
                },
                blocks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['survey_block_id'],
                    properties: {
                      survey_block_id: {
                        type: 'number'
                      }
                    }
                  }
                },
                stratums: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['survey_stratum_id'],
                    properties: {
                      survey_stratum_id: {
                        type: 'number'
                      }
                    }
                  }
                },
                survey_sample_sites: {
                  type: 'array',
                  items: GeoJSONFeature as object
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Sample site updated OK.'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function updateSurveySampleSite(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.surveySampleSiteId) {
      throw new HTTP400('Missing required path param `surveySampleSiteId`');
    }

    if (!req.body.sampleSite) {
      throw new HTTP400('Missing required body param `sampleSite`');
    }

    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const sampleSite: UpdateSampleLocationRecord = {
        ...req.body.sampleSite,
        survey_id: Number(req.params.surveyId),
        survey_sample_site_id: Number(req.params.surveySampleSiteId)
      };

      await connection.open();

      const sampleLocationService = new SampleLocationService(connection);

      await sampleLocationService.updateSampleLocationMethodPeriod(surveyId, sampleSite);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSurveySampleSite', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteSurveySampleSiteRecord()
];

DELETE.apiDoc = {
  description: 'Delete a survey sample site.',
  tags: ['survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveySampleSiteId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    204: {
      description: 'Delete survey sample site OK'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function deleteSurveySampleSiteRecord(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveySampleSiteId = Number(req.params.surveySampleSiteId);

    if (!surveySampleSiteId) {
      throw new HTTP400('Missing required param `surveySampleSiteId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);
      const samplingSiteObservationsCount = await observationService.getObservationsCountBySampleSiteIds(surveyId, [
        surveySampleSiteId
      ]);

      if (samplingSiteObservationsCount > 0) {
        throw new HTTP400('Cannot delete a sample site that is associated with an observation');
      }

      const sampleLocationService = new SampleLocationService(connection);

      await sampleLocationService.deleteSampleSiteRecord(surveyId, surveySampleSiteId);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveySampleSiteRecord', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
