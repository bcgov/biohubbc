import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTPError, HTTPErrorType } from '../../../../../../../errors/http-error';
import { bulkUpdateResponse, critterBulkRequestObject } from '../../../../../../../openapi/schemas/critter';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { getBctwUser } from '../../../../../../../services/bctw-service/bctw-service';
import { CritterAttachmentService } from '../../../../../../../services/critter-attachment-service';
import { CritterbaseService, ICritterbaseUser } from '../../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters/{critterId}');

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

export function updateSurveyCritter(): RequestHandler {
  return async (req, res) => {
    const critterbaseCritterId = req.body.update.critter_id;

    const critterId = Number(req.params.critterId);

    const connection = getDBConnection(req.keycloak_token);
    try {
      await connection.open();
      const user = getBctwUser(req);

      if (!critterbaseCritterId) {
        throw new HTTPError(HTTPErrorType.BAD_REQUEST, 400, 'No external critter ID was found.');
      }

      const surveyService = new SurveyCritterService(connection);
      await surveyService.updateCritter(critterId, critterbaseCritterId);

      const critterbaseService = new CritterbaseService(user);

      let createResult, updateResult;

      if (req.body.update) {
        updateResult = await critterbaseService.updateCritter(req.body.update);
      }

      if (req.body.create) {
        createResult = await critterbaseService.createCritter(req.body.create);
      }

      await connection.commit();

      return res.status(200).json({ ...createResult, ...updateResult });
    } catch (error) {
      defaultLog.error({ label: 'updateSurveyCritter', message: 'error', error });
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
  getCrittersFromSurvey()
];

GET.apiDoc = {
  description: 'Gets a specific critter by its integer Critter Id',
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
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'integer'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Responds with a critter',
      content: {
        'application/json': {
          schema: { type: 'object' }
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

export function getCrittersFromSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const critterId = Number(req.params.critterId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const surveyService = new SurveyCritterService(connection);
      const critterbaseService = new CritterbaseService(user);
      const critterAttachmentService = new CritterAttachmentService(connection);

      const surveyCritter = await surveyService.getCritterById(surveyId, critterId);

      if (!surveyCritter) {
        return res.status(404).json({ error: `Critter with id ${critterId} not found.` });
      }

      // Get the attachments from SIMS table and the Critter from critterbase
      const [atttachments, critterbaseCritter] = await Promise.all([
        critterAttachmentService.findAllCritterAttachments(surveyCritter.critter_id),
        critterbaseService.getCritter(surveyCritter.critterbase_critter_id)
      ]);

      if (!critterbaseCritter || critterbaseCritter.length === 0) {
        return res.status(404).json({ error: `Critter ${surveyCritter.critterbase_critter_id} not found.` });
      }

      const critterMapped = {
        ...surveyCritter,
        ...critterbaseCritter,
        critterbase_critter_id: surveyCritter.critterbase_critter_id,
        critter_id: surveyCritter.critter_id,
        attachments: {
          capture_attachments: atttachments.captureAttachments
          // TODO: add mortality attachments
        }
      };

      return res.status(200).json(critterMapped);
    } catch (error) {
      defaultLog.error({ label: 'getCritter', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
