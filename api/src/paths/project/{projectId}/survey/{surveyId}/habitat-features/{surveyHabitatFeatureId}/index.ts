import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import {
  SurveyHabitatFeaturesSupplementaryDataSchema,
  SurveyHabitatFeatureWithTaxonsAndSamplingSchema,
  UpdateHabitatFeatureSchema
} from '../../../../../../../openapi/schemas/survey-habitat-feature';
import { UpdateSurveyHabitatFeature } from '../../../../../../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SurveyHabitatFeatureService } from '../../../../../../../services/habitat-feature-services/survey-habitat-feature-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/habitat-features/{surveyHabitatFeatureId}');

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
  putSurveyHabitatFeature()
];

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
  getSurveyHabitatFeature()
];

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
  deleteSurveyHabitatFeature()
];

PUT.apiDoc = {
  description: 'Update an existing survey habitat feature record, for a survey.',
  tags: ['habitat-feature'],
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
      name: 'surveyHabitatFeatureId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Survey habitat feature record data',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            surveyHabitatFeature: UpdateHabitatFeatureSchema
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Update OK'
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

GET.apiDoc = {
  description: 'Get an existing survey habitat feature record for a survey.',
  tags: ['habitat-feature'],
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
      name: 'surveyHabitatFeatureId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey habitat feature get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['surveyHabitatFeature'],
            properties: {
              surveyHabitatFeature: SurveyHabitatFeatureWithTaxonsAndSamplingSchema,
              supplementaryData: SurveyHabitatFeaturesSupplementaryDataSchema
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

DELETE.apiDoc = {
  description: 'Delete an existing survey habitat feature record, for a survey.',
  tags: ['habitat-feature'],
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
      name: 'surveyHabitatFeatureId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    204: {
      description: 'Update OK'
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
 * Update an existing survey habitat feature record, for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function putSurveyHabitatFeature(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveyHabitatFeatureId = Number(req.params.surveyHabitatFeatureId);

    defaultLog.debug({ label: 'putSurveyHabitatFeature', surveyId, surveyHabitatFeatureId });

    const updateSurveyHabitatFeatureObject: UpdateSurveyHabitatFeature = req.body.surveyHabitatFeature;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyHabitatFeatureService = new SurveyHabitatFeatureService(connection);

      await surveyHabitatFeatureService.updateSurveyHabitatFeature(
        surveyId,
        surveyHabitatFeatureId,
        updateSurveyHabitatFeatureObject
      );

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'putSurveyHabitatFeature', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Get an existing survey habitat feature record for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyHabitatFeature(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveyHabitatFeatureId = Number(req.params.surveyHabitatFeatureId);

    defaultLog.debug({ label: 'getSurveyHabitatFeature', surveyId, surveyHabitatFeatureId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyHabitatFeatureService = new SurveyHabitatFeatureService(connection);

      const surveyHabitatFeatureResponse = await surveyHabitatFeatureService.getSurveyHabitatFeature(
        surveyId,
        surveyHabitatFeatureId
      );

      await connection.commit();

      const response = {
        surveyHabitatFeature: surveyHabitatFeatureResponse
      };

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyHabitatFeature', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Delete an existing survey habitat feature record, for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteSurveyHabitatFeature(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveyHabitatFeatureId = Number(req.params.surveyHabitatFeatureId);

    defaultLog.debug({ label: 'deleteSurveyHabitatFeature', surveyId, surveyHabitatFeatureId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyHabitatFeatureService = new SurveyHabitatFeatureService(connection);

      await surveyHabitatFeatureService.deleteSurveyHabitatFeature(surveyId, surveyHabitatFeatureId);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveyHabitatFeature', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
