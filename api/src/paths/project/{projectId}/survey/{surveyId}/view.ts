import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { GeoJSONFeature } from '../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../services/survey-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/view');

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
  getSurvey()
];

GET.apiDoc = {
  description: 'Get a project survey, for view-only purposes.',
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
      description: 'Survey with matching surveyId and projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey get response object, for view purposes',
            type: 'object',
            required: ['surveyData', 'surveySupplementaryData'],
            properties: {
              surveyData: {
                type: 'object',
                required: [
                  'survey_details',
                  'species',
                  'permit',
                  'funding_sources',
                  'partnerships',
                  'proprietor',
                  'purpose_and_methodology',
                  'locations',
                  'site_selection'
                ],
                properties: {
                  survey_details: {
                    description: 'Survey Details',
                    type: 'object',
                    required: ['survey_name', 'start_date', 'survey_types', 'status', 'revision_count'],
                    properties: {
                      survey_name: {
                        type: 'string'
                      },
                      start_date: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        description: 'ISO 8601 date string for the funding end_date'
                      },
                      end_date: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        nullable: true,
                        description: 'ISO 8601 date string for the funding end_date'
                      },
                      status: {
                        type: 'number'
                      },
                      survey_types: {
                        type: 'array',
                        items: {
                          type: 'integer',
                          minimum: 1
                        }
                      },
                      revision_count: {
                        type: 'number'
                      }
                    }
                  },
                  species: {
                    description: 'Survey Species',
                    type: 'object',
                    required: ['focal_species', 'ancillary_species'],
                    properties: {
                      ancillary_species: {
                        nullable: true,
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['tsn', 'commonName', 'scientificName'],
                          properties: {
                            tsn: {
                              type: 'integer'
                            },
                            commonName: {
                              type: 'string',
                              nullable: true
                            },
                            scientificName: {
                              type: 'string'
                            }
                          }
                        }
                      },
                      focal_species: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['tsn', 'commonName', 'scientificName'],
                          properties: {
                            tsn: {
                              type: 'integer'
                            },
                            commonName: {
                              type: 'string',
                              nullable: true
                            },
                            scientificName: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  },
                  permit: {
                    description: 'Survey Permit',
                    type: 'object',
                    properties: {
                      permits: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['permit_id', 'permit_number', 'permit_type'],
                          properties: {
                            permit_id: {
                              type: 'number',
                              minimum: 1
                            },
                            permit_number: {
                              type: 'string'
                            },
                            permit_type: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  },
                  funding_sources: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: [
                        'survey_funding_source_id',
                        'survey_id',
                        'funding_source_id',
                        'amount',
                        'revision_count'
                      ],
                      properties: {
                        survey_funding_source_id: {
                          type: 'number',
                          minimum: 1
                        },
                        survey_id: {
                          type: 'number',
                          minimum: 1
                        },
                        funding_source_id: {
                          type: 'number',
                          minimum: 1
                        },
                        funding_source_name: {
                          type: 'string'
                        },
                        amount: {
                          type: 'number'
                        },
                        revision_count: {
                          type: 'number'
                        }
                      }
                    }
                  },
                  partnerships: {
                    title: 'Survey partnerships',
                    type: 'object',
                    required: ['indigenous_partnerships', 'stakeholder_partnerships'],
                    properties: {
                      indigenous_partnerships: {
                        type: 'array',
                        items: {
                          type: 'integer',
                          minimum: 1
                        }
                      },
                      stakeholder_partnerships: {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      }
                    }
                  },
                  purpose_and_methodology: {
                    description: 'Survey Details',
                    type: 'object',
                    required: ['additional_details', 'intended_outcome_ids', 'vantage_code_ids', 'revision_count'],
                    properties: {
                      additional_details: {
                        type: 'string',
                        nullable: true
                      },
                      intended_outcome_ids: {
                        type: 'array',
                        items: {
                          type: 'number'
                        }
                      },
                      vantage_code_ids: {
                        type: 'array',
                        items: {
                          type: 'number'
                        }
                      }
                    }
                  },
                  proprietor: {
                    description: 'Survey Proprietor Details',
                    type: 'object',
                    nullable: true,
                    required: [
                      'category_rationale',
                      'disa_required',
                      'first_nations_id',
                      'first_nations_name',
                      'proprietor_name',
                      'proprietor_type_id',
                      'proprietor_type_name'
                    ],
                    properties: {
                      category_rationale: {
                        type: 'string'
                      },
                      disa_required: {
                        type: 'boolean'
                      },
                      first_nations_id: {
                        type: 'number',
                        nullable: true
                      },
                      first_nations_name: {
                        type: 'string',
                        nullable: true
                      },
                      proprietor_name: {
                        type: 'string'
                      },
                      proprietor_type_id: {
                        type: 'number'
                      },
                      proprietor_type_name: {
                        type: 'string'
                      }
                    }
                  },
                  locations: {
                    description: 'Survey location data',
                    type: 'array',
                    items: {
                      type: 'object',
                      required: [
                        'survey_location_id',
                        'name',
                        'description',
                        'geometry',
                        'geography',
                        'geojson',
                        'revision_count'
                      ],
                      properties: {
                        survey_location_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        name: {
                          type: 'string',
                          maxLength: 100
                        },
                        description: {
                          type: 'string',
                          maxLength: 250
                        },
                        geometry: {
                          type: 'string',
                          nullable: true
                        },
                        geography: {
                          type: 'string'
                        },
                        geojson: {
                          type: 'array',
                          items: {
                            ...(GeoJSONFeature as object)
                          }
                        },
                        revision_count: {
                          type: 'integer',
                          minimum: 0
                        }
                      }
                    }
                  },
                  site_selection: {
                    type: 'object',
                    required: ['strategies', 'stratums'],
                    properties: {
                      strategies: {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      },
                      stratums: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['name', 'description'],
                          properties: {
                            name: {
                              type: 'string'
                            },
                            description: {
                              type: 'string',
                              nullable: true
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
                      required: ['name', 'description', 'sample_block_count'],
                      properties: {
                        name: {
                          type: 'string'
                        },
                        description: {
                          type: 'string',
                          nullable: true
                        },
                        sample_block_count: {
                          type: 'number'
                        }
                      }
                    }
                  }
                }
              },
              surveySupplementaryData: {
                description: 'Survey supplementary data',
                type: 'object',
                required: ['survey_metadata_publish'],
                properties: {
                  survey_metadata_publish: {
                    description: 'Survey metadata publish record',
                    type: 'object',
                    nullable: true,
                    required: [
                      'survey_metadata_publish_id',
                      'survey_id',
                      'event_timestamp',
                      'submission_uuid',
                      'create_date',
                      'create_user',
                      'update_date',
                      'update_user',
                      'revision_count'
                    ],
                    properties: {
                      survey_metadata_publish_id: {
                        type: 'integer',
                        minimum: 1
                      },
                      survey_id: {
                        type: 'integer',
                        minimum: 1
                      },
                      event_timestamp: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        description: 'ISO 8601 date string for the project start date'
                      },
                      submission_uuid: {
                        type: 'string',
                        format: 'uuid'
                      },
                      create_date: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        description: 'ISO 8601 date string for the project start date'
                      },
                      create_user: {
                        type: 'integer',
                        minimum: 1
                      },
                      update_date: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        description: 'ISO 8601 date string for the project start date',
                        nullable: true
                      },
                      update_user: {
                        type: 'integer',
                        minimum: 1,
                        nullable: true
                      },
                      revision_count: {
                        type: 'integer',
                        minimum: 0
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

export function getSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveyData = await surveyService.getSurveyById(surveyId);

      // @TODO safe to delete survey supplementary data code?
      const surveySupplementaryData = await surveyService.getSurveySupplementaryDataById(Number(req.params.surveyId));

      await connection.commit();

      return res.status(200).json({ surveyData: surveyData, surveySupplementaryData: surveySupplementaryData });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
