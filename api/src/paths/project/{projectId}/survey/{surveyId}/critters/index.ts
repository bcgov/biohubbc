import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { bulkCreateResponse, critterBulkRequestObject } from '../../../../../../openapi/schemas/critter';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
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
        type: 'integer'
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
        schema: critterBulkRequestObject
      }
    }
  },
  responses: {
    201: {
      description: 'Responds with counts of objects created in critterbase.',
      content: {
        'application/json': {
          schema: bulkCreateResponse
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

    const surveyService = new SurveyCritterService(connection);
    const critterbaseService = new CritterbaseService(user);
    try {
      await connection.open();
      const surveyCritters = await surveyService.getCrittersInSurvey(surveyId);

      // Exit early if surveyCritters list is empty
      if (!surveyCritters.length) {
        return res.status(200).json([]);
      }

      const critterIds = surveyCritters.map((critter) => String(critter.critterbase_critter_id));
      const result = await critterbaseService.filterCritters(
        { critter_ids: { body: critterIds, negate: false } },
        'detailed'
      );

      const critterMap = new Map();
      for (const item of result) {
        critterMap.set(item.critter_id, item);
      }

      for (const surveyCritter of surveyCritters) {
        if (critterMap.has(surveyCritter.critterbase_critter_id)) {
          critterMap.get(surveyCritter.critterbase_critter_id).survey_critter_id = surveyCritter.critter_id;
        }
      }
      return res.status(200).json([...critterMap.values()]);
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
    const surveyService = new SurveyCritterService(connection);
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
