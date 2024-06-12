import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { techniqueDetailsSchema } from '../../../../../../../openapi/schemas/technique';
import { ITechniquePostData } from '../../../../../../../repositories/technique-repository';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { AttractantService } from '../../../../../../../services/attractants-service';
import { TechniqueAttributeService } from '../../../../../../../services/technique-attributes-service';
import { TechniqueService } from '../../../../../../../services/technique-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/technique/{techniqueId}/index');

export const DELETE: Operation = [
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
  deleteTechnique()
];

DELETE.apiDoc = {
  description: 'Delete a technique from a Survey.',
  tags: ['technique'],
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
      name: 'techniqueId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Boolean true value representing successful deletion.',
      content: {
        'application/json': {
          schema: {
            title: 'Technique delete response',
            type: 'boolean'
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
 * Delete a technique from a Survey
 *
 * @returns {RequestHandler}
 */
export function deleteTechnique(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    if (!req.params.techniqueId) {
      throw new HTTP400('Missing required param `techniqueId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const techniqueId = Number(req.params.techniqueId);
      const surveyId = Number(req.params.surveyId);

      const techniqueService = new TechniqueService(connection);

      // Delete the technique
      const method_technique_id = await techniqueService.deleteTechnique(surveyId, techniqueId);

      await connection.commit();

      return res.status(200).json(Boolean(method_technique_id));
    } catch (error) {
      defaultLog.error({ label: 'getSurveyTechniques', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

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
  updateTechnique()
];

PUT.apiDoc = {
  description: 'Update a technique',
  tags: ['project', 'survey'],
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
      name: 'techniqueId',
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
          required: ['technique'],
          properties: {
            technique: techniqueDetailsSchema
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Sample site added OK.'
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

export function updateTechnique(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.techniqueId) {
      throw new HTTP400('Missing required path param `techniqueId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const techniqueService = new TechniqueService(connection);
      const attractantsService = new AttractantService(connection);
      const techniqueAttributeService = new TechniqueAttributeService(connection);

      const surveyId = Number(req.params.surveyId);
      const techniqueId = Number(req.params.techniqueId);

      const technique: ITechniquePostData = req.body.technique;

      const { attributes, attractants, ...techniqueRow } = technique;

      // Update the technique table
      await techniqueService.updateTechnique(surveyId, techniqueId, techniqueRow);

      const promises = [];

      // Update attractants
      promises.push(attractantsService.updateTechniqueAttractants(techniqueId, attractants, surveyId));

      // Update qualitative attributes. This step deletes attributes and inserts new attributes.
      promises.push(
        techniqueAttributeService.updateDeleteQualitativeAttributesForTechnique(
          surveyId,
          techniqueId,
          attributes.qualitative_attributes
        )
      );

      // Update quantitative attributes. This step deletes attributes and inserts new attributes.
      promises.push(
        techniqueAttributeService.updateDeleteQuantitativeAttributesForTechnique(
          surveyId,
          techniqueId,
          attributes.quantitative_attributes
        )
      );

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateTechnique', message: 'error', error });
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
  getTechniqueById()
];

GET.apiDoc = {
  description: 'Get a technique by ID.',
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
      description: 'A survey sample site',
      content: {
        'application/json': {
          schema: techniqueDetailsSchema
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
export function getTechniqueById(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }
    if (!req.params.techniqueId) {
      throw new HTTP400('Missing required param `techniqueId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const techniqueId = Number(req.params.techniqueId);

      const techniqueService = new TechniqueService(connection);
      const sampleSite = await techniqueService.getTechniqueById(surveyId, techniqueId);

      await connection.commit();

      return res.status(200).json(sampleSite);
    } catch (error) {
      defaultLog.error({ label: 'getTechniqueById', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
