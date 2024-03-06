import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTPError, HTTPErrorType } from '../../../../../../errors/http-error';
import { bulkUpdateResponse, critterBulkRequestObject } from '../../../../../../openapi/schemas/critter';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters/{critterId}');
export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  removeCritterFromSurvey()
];

export const PATCH: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  updateSurveyCritter()
];

DELETE.apiDoc = {
  description: 'Removes association of this critter to this survey.',
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
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'string'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Critter was removed from survey'
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

PATCH.apiDoc = {
  description: 'Patches a critter in critterbase, also capable of deleting relevant rows if marked with _delete.',
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
    description: 'Critterbase bulk patch request object',
    content: {
      'application/json': {
        schema: critterBulkRequestObject
      }
    }
  },
  responses: {
    200: {
      description: 'Responds with counts of objects created in critterbase.',
      content: {
        'application/json': {
          schema: bulkUpdateResponse
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

export function removeCritterFromSurvey(): RequestHandler {
  return async (req, res) => {
    const critterId = Number(req.params.critterId);
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);
    const surveyCritterService = new SurveyCritterService(connection);

    try {
      await connection.open();

      const result = await surveyCritterService.removeCritterFromSurvey(surveyId, critterId);
      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'removeCritterFromSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function updateSurveyCritter(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const critterId = Number(req.params.critterId);
    const connection = getDBConnection(req['keycloak_token']);
    const surveyService = new SurveyCritterService(connection);
    const cb = new CritterbaseService(user);
    try {
      await connection.open();
      const critterbaseCritterId = req.body.update.critter_id;
      if (!critterbaseCritterId) {
        throw new HTTPError(HTTPErrorType.BAD_REQUEST, 400, 'No external critter ID was found.');
      }
      await surveyService.updateCritter(critterId, critterbaseCritterId);
      let createResult, updateResult;
      if (req.body.update) {
        updateResult = await cb.updateCritter(req.body.update);
      }
      if (req.body.create) {
        createResult = await cb.createCritter(req.body.create);
      }
      await connection.commit();
      return res.status(200).json({ ...createResult, ...updateResult });
    } catch (error) {
      defaultLog.error({ label: 'updateCritter', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
