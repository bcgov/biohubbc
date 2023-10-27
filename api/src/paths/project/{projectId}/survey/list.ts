import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/http-error';
import { GeoJSONFeature } from '../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../services/survey-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/list');

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
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyList()
];

GET.apiDoc = {
  description: 'Get all Surveys.',
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
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey list response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
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
                    'proprietor',
                    'purpose_and_methodology',
                    'locations'
                  ],
                  properties: {
                    survey_details: {
                      description: 'Survey Details',
                      type: 'object',
                      required: ['survey_name', 'survey_types', 'revision_count'],
                      properties: {
                        survey_name: {
                          type: 'string'
                        },
                        start_date: {
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                          description: 'ISO 8601 date string for the funding end_date',
                          nullable: true
                        },
                        end_date: {
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                          nullable: true,
                          description: 'ISO 8601 date string for the funding end_date'
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
                      required: [
                        'focal_species',
                        'focal_species_names',
                        'ancillary_species',
                        'ancillary_species_names'
                      ],
                      properties: {
                        ancillary_species: {
                          nullable: true,
                          type: 'array',
                          items: {
                            type: 'number'
                          }
                        },
                        ancillary_species_names: {
                          nullable: true,
                          type: 'array',
                          items: {
                            type: 'string'
                          }
                        },
                        focal_species: {
                          type: 'array',
                          items: {
                            type: 'number'
                          }
                        },
                        focal_species_names: {
                          type: 'array',
                          items: {
                            type: 'string'
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
                    purpose_and_methodology: {
                      description: 'Survey Details',
                      type: 'object',
                      required: [
                        'additional_details',
                        'intended_outcome_id',
                        'ecological_season_id',
                        'vantage_code_ids',
                        'revision_count'
                      ],
                      properties: {
                        field_method_id: {
                          type: 'number',
                          nullable: true
                        },
                        additional_details: {
                          type: 'string',
                          nullable: true
                        },
                        intended_outcome_id: {
                          type: 'number',
                          nullable: true
                        },
                        ecological_season_id: {
                          type: 'number',
                          nullable: true
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
                    }
                  }
                },
                surveySupplementaryData: {
                  type: 'object',
                  required: ['publishStatus'],
                  properties: {
                    publishStatus: {
                      type: 'string',
                      enum: ['NO_DATA', 'UNSUBMITTED', 'SUBMITTED']
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
 * Get all surveys.
 *
 * @returns {RequestHandler}
 */
export function getSurveyList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveyIdsResponse = await surveyService.getSurveyIdsByProjectId(Number(req.params.projectId));

      const surveyIds = surveyIdsResponse.map((item: { id: any }) => item.id);

      const surveys = await Promise.all(
        surveyIds.map(async (surveyId) => {
          const survey = await surveyService.getSurveyById(surveyId);
          const surveyPublishStatus = await surveyService.surveyPublishStatus(surveyId);

          return {
            surveyData: survey,
            surveySupplementaryData: { publishStatus: surveyPublishStatus }
          };
        })
      );

      await connection.commit();

      return res.status(200).json(surveys);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
