import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP409 } from '../../../../../../../errors/http-error';
import { techniqueUpdateSchema, techniqueViewSchema } from '../../../../../../../openapi/schemas/technique';
import { ITechniquePutData } from '../../../../../../../repositories/technique-repository';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { AttractantService } from '../../../../../../../services/attractants-service';
import { SampleMethodService } from '../../../../../../../services/sample-method-service';
import { TechniqueAttributeService } from '../../../../../../../services/technique-attributes-service';
import { TechniqueService } from '../../../../../../../services/technique-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/technique/{techniqueId}/index');

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
      description: 'A method technique ID',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Delete technique OK.'
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
    409: {
      $ref: '#/components/responses/409'
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
    const methodTechniqueId = Number(req.params.techniqueId);
    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const sampleMethodService = new SampleMethodService(connection);

      const samplingMethodsCount = await sampleMethodService.getSampleMethodsCountForTechniqueIds([methodTechniqueId]);

      if (samplingMethodsCount > 0) {
        throw new HTTP409('Cannot delete a technique that is associated with a sampling site');
      }

      const techniqueService = new TechniqueService(connection);

      await techniqueService.deleteTechnique(surveyId, methodTechniqueId);

      await connection.commit();

      return res.status(200).send();
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
  updateTechnique()
];

PUT.apiDoc = {
  description: 'Update a technique',
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
      description: 'An array of method technique IDs',
      required: true
    }
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['technique'],
          additionalProperties: false,
          properties: {
            technique: techniqueUpdateSchema
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Technique updated OK.'
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
 * Update a technique, including its attributes and attractants.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function updateTechnique(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const methodTechniqueId = Number(req.params.techniqueId);
    const technique: ITechniquePutData = req.body.technique;
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const { attributes, attractants, ...techniqueRow } = technique;

      // Update the technique record
      const techniqueService = new TechniqueService(connection);
      await techniqueService.updateTechnique(surveyId, techniqueRow);

      // Update the technique's attributes and attractants
      const attractantsService = new AttractantService(connection);
      const techniqueAttributeService = new TechniqueAttributeService(connection);
      await Promise.all([
        // Update attractants
        attractantsService.updateTechniqueAttractants(surveyId, methodTechniqueId, attractants),
        // Update qualitative attributes
        techniqueAttributeService.insertUpdateDeleteQualitativeAttributesForTechnique(
          surveyId,
          methodTechniqueId,
          attributes.qualitative_attributes
        ),
        // Update quantitative attributes
        techniqueAttributeService.insertUpdateDeleteQuantitativeAttributesForTechnique(
          surveyId,
          methodTechniqueId,
          attributes.quantitative_attributes
        )
      ]);

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
    },
    {
      in: 'path',
      name: 'techniqueId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      description: 'An array of method technique IDs',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'A survey sample site',
      content: {
        'application/json': {
          schema: techniqueViewSchema
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
 * Get a single technique by Id.
 *
 * @returns {RequestHandler}
 */
export function getTechniqueById(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const methodTechniqueId = Number(req.params.techniqueId);
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const techniqueService = new TechniqueService(connection);
      const sampleSite = await techniqueService.getTechniqueById(surveyId, methodTechniqueId);

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
