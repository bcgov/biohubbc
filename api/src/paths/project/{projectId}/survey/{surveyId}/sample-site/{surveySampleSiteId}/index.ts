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
                    required: ['method_lookup_id', 'description', 'sample_periods', 'method_response_metric_id'],
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
                      sample_periods: {
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
                      },
                      method_response_metric_id: {
                        type: 'integer',
                        minimum: 1
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
      defaultLog.error({ label: 'updateSampleLocationMethodPeriod', message: 'error', error });
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

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
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
  getSurveySampleLocationRecords()
];

GET.apiDoc = {
  description: 'Get all survey sample sites.',
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
    }
  ],
  responses: {
    200: {
      description: 'List of survey sample sites.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              sampleSites: {
                type: 'object',
                additionalProperties: false,
                required: ['survey_sample_site_id', 'survey_id', 'name', 'description', 'geojson'],
                properties: {
                  survey_sample_site_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  survey_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  name: {
                    type: 'string',
                    maxLength: 50
                  },
                  description: {
                    type: 'string',
                    maxLength: 250
                  },
                  geojson: {
                    ...(GeoJSONFeature as object)
                  },
                  sample_methods: {
                    type: 'array',
                    required: [
                      'survey_sample_method_id',
                      'survey_sample_site_id',
                      'method_lookup_id',
                      'method_response_metric_id',
                      'sample_periods'
                    ],
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        survey_sample_method_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        survey_sample_site_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        method_lookup_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        description: {
                          type: 'string',
                          maxLength: 250
                        },
                        sample_periods: {
                          type: 'array',
                          required: [
                            'survey_sample_period_id',
                            'survey_sample_method_id',
                            'start_date',
                            'start_time',
                            'end_date',
                            'end_time'
                          ],
                          items: {
                            type: 'object',
                            additionalProperties: false,
                            properties: {
                              survey_sample_period_id: {
                                type: 'integer',
                                minimum: 1
                              },
                              survey_sample_method_id: {
                                type: 'integer',
                                minimum: 1
                              },
                              start_date: {
                                type: 'string'
                              },
                              start_time: {
                                type: 'string',
                                nullable: true
                              },
                              end_date: {
                                type: 'string'
                              },
                              end_time: {
                                type: 'string',
                                nullable: true
                              }
                            }
                          }
                        },
                        method_response_metric_id: { type: 'integer', minimum: 1 }
                      }
                    }
                  },
                  sample_blocks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['survey_sample_block_id', 'survey_sample_site_id', 'survey_block_id'],
                      properties: {
                        survey_sample_block_id: {
                          type: 'number'
                        },
                        survey_sample_site_id: {
                          type: 'number'
                        },
                        survey_block_id: {
                          type: 'number'
                        },
                        name: {
                          type: 'string'
                        },
                        description: {
                          type: 'string'
                        }
                      }
                    }
                  },
                  sample_stratums: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['survey_sample_stratum_id', 'survey_sample_site_id', 'survey_stratum_id'],
                      properties: {
                        survey_sample_stratum_id: {
                          type: 'number'
                        },
                        survey_sample_site_id: {
                          type: 'number'
                        },
                        survey_stratum_id: {
                          type: 'number'
                        },
                        name: {
                          type: 'string'
                        },
                        description: {
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
      }
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

/**
 * Get a single survey sample site by Id
 *
 * @returns {RequestHandler}
 */
export function getSurveySampleLocationRecords(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const surveySampleSiteId = Number(req.params.surveySampleSiteId);

      const sampleLocationService = new SampleLocationService(connection);
      const sampleSite = await sampleLocationService.getSurveySampleLocationBySiteId(surveyId, surveySampleSiteId);

      await connection.commit();

      return res.status(200).json(sampleSite);
    } catch (error) {
      defaultLog.error({ label: 'getSurveySampleLocationRecords', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
