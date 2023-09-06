import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../../../../services/critterbase-service';
import { SurveyService } from '../../../../../../services/survey-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters');
export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  addCritterToSurvey()
];

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  getCrittersFromSurvey()
];

GET.apiDoc = {
  description: 'Get all critters under this survey.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'query',
      name: 'format',
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'Responds with critters under this survey.',
      content: {
        'application/json': {
          schema: {
            title: 'Bulk creation response object',
            type: 'array',
            items: {
              title: 'Default critter response',
              type: 'object'
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

POST.apiDoc = {
  description:
    'Creates a new critter in critterbase, and if successful, adds the a link to the critter_id under this survey.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Critterbase bulk creation request object',
    content: {
      'application/json': {
        schema: {
          title: 'Bulk post request object',
          type: 'object',
          properties: {
            critters: {
              title: 'critters',
              type: 'array',
              items: {
                title: 'critter',
                type: 'object'
              }
            },
            captures: {
              title: 'captures',
              type: 'array',
              items: {
                title: 'capture',
                type: 'object'
              }
            },
            collections: {
              title: 'collection units',
              type: 'array',
              items: {
                title: 'collection unit',
                type: 'object'
              }
            },
            markings: {
              title: 'markings',
              type: 'array',
              items: {
                title: 'marking',
                type: 'object'
              }
            },
            locations: {
              title: 'locations',
              type: 'array',
              items: {
                title: 'location',
                type: 'object'
              }
            },
            mortalities: {
              title: 'locations',
              type: 'array',
              items: {
                title: 'location',
                type: 'object'
              }
            },
            qualitative_measurements: {
              title: 'qualitative measurements',
              type: 'array',
              items: {
                title: 'qualitative measurement',
                type: 'object'
              }
            },
            quantitative_measurements: {
              title: 'quantitative measurements',
              type: 'array',
              items: {
                title: 'quantitative measurement',
                type: 'object'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Responds with counts of objects created in critterbase.',
      content: {
        'application/json': {
          schema: {
            title: 'Bulk creation response object',
            type: 'object'
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

export function getCrittersFromSurvey(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req['keycloak_token']);
    const cb = new CritterbaseService(user);
    const surveyService = new SurveyService(connection);
    try {
      await connection.open();
      const surveyCritters = await surveyService.getCrittersInSurvey(surveyId);
      const critterIds = surveyCritters.map((a: any) => String(a.critterbase_critter_id));
      if (!critterIds.length) {
        return res.status(200).json([]); // This is to catch some unintended behavior in this critterbase endpoint. TODO: Patch Critterbase to handle this correctly.
      }
      const result = await cb.filterCritters({ critter_ids: { body: critterIds, negate: false } }, 'detailed');

      for (const bhCritter of surveyCritters) {
        //This loop is obviously inefficient but probably inconsequential unless people are adding 100+ critters one by one to a survey.
        const cbCritter = result.find((a: any) => a.critter_id === bhCritter.critterbase_critter_id);
        if (cbCritter) {
          cbCritter.survey_critter_id = bhCritter.critter_id;
        }
      }

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'createCritter', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function addCritterToSurvey(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req['keycloak_token']);
    const surveyService = new SurveyService(connection);
    const cb = new CritterbaseService(user);
    try {
      await connection.open();
      await surveyService.addCritterToSurvey(surveyId, req.body.critter_id);
      const result = await cb.createCritter(req.body);
      await connection.commit();
      return res.status(201).json(result);
    } catch (error) {
      defaultLog.error({ label: 'createCritter', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
