import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { GeoJSONFeature } from '../../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../../services/survey-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/update/get');

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
  getSurveyForUpdate()
];

GET.apiDoc = {
  description: 'Get a project survey, for update purposes.',
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
            required: ['surveyData'],
            properties: {
              surveyData: {
                type: 'object',
                required: [
                  'survey_details',
                  'species',
                  'permit',
                  'funding_sources',
                  'proprietor',
                  'purpose_and_methodology',
                  'locations',
                  'participants'
                ],
                properties: {
                  survey_details: {
                    description: 'Survey Details',
                    type: 'object',
                    required: ['survey_name', 'start_date', 'survey_types', 'revision_count'],
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
                        },
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
                      'survey_data_proprietary',
                      'proprietor_type_name',
                      'proprietary_data_category',
                      'first_nations_name',
                      'first_nations_id',
                      'category_rationale',
                      'proprietor_name',
                      'disa_required'
                    ],
                    properties: {
                      survey_data_proprietary: {
                        type: 'string'
                      },
                      proprietor_type_name: {
                        type: 'string',
                        nullable: true
                      },
                      disa_required: {
                        type: 'string'
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
                        type: 'string',
                        nullable: true
                      },
                      proprietary_data_category: {
                        type: 'number',
                        nullable: true
                      },
                      category_rationale: {
                        type: 'string',
                        nullable: true
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
                  participants: {
                    description: 'Survey participants Details',
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['survey_participation_id', 'system_user_id', 'survey_job_id', 'survey_job_name'],
                      properties: {
                        survey_participation_id: {
                          type: 'number',
                          minimum: 1
                        },
                        system_user_id: {
                          type: 'number',
                          minimum: 1
                        },
                        survey_job_id: {
                          type: 'number',
                          minimum: 1
                        },
                        survey_job_name: {
                          type: 'string'
                        }
                      }
                    }
                  },
                  blocks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['survey_block_id', 'name', 'description'],
                      properties: {
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
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export function getSurveyForUpdate(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveyObject = await surveyService.getSurveyById(surveyId);

      let proprietor: any = surveyObject.proprietor;

      if (surveyObject.proprietor?.proprietor_type_id) {
        proprietor['survey_data_proprietary'] = 'true';
        proprietor['proprietary_data_category'] = surveyObject.proprietor?.proprietor_type_id;
        proprietor['first_nations_id'] =
          surveyObject.proprietor?.first_nations_id !== null ? surveyObject.proprietor?.first_nations_id : 0;
        proprietor['disa_required'] = surveyObject.proprietor?.disa_required === true ? 'true' : 'false';
      } else {
        proprietor = {
          survey_data_proprietary: 'false',
          proprietor_type_name: '',
          proprietary_data_category: 0,
          first_nations_name: '',
          first_nations_id: 0,
          category_rationale: '',
          proprietor_name: '',
          disa_required: 'false'
        };
      }

      const surveyData = {
        ...surveyObject,
        proprietor: proprietor,
        agreements: {
          sedis_procedures_accepted: 'true',
          foippa_requirements_accepted: 'true'
        }
      };

      await connection.commit();

      return res.status(200).json({ surveyData: surveyData });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
