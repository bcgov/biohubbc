import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { COLLECTION_ROLE, SURVEY_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { ICreateCollectionSurveyRequest } from '../../../../models/collection';
import { GetCollectionSchema } from '../../../../openapi/schemas/collection';
import { CreateCollectionSurveySchema } from '../../../../openapi/schemas/collection-survey';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { CollectionService } from '../../../../services/collection-service';
import { CollectionSurveyService } from '../../../../services/collection-survey-service';
import { defaultLog } from '../sample-site';

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validCollectionRoles: [COLLECTION_ROLE.ADMIN, COLLECTION_ROLE.MEMBER],
          collectionId: Number(req.params.surveyId),
          discriminator: 'CollectionRole'
        }
      ]
    };
  }),
  addSurveyToCollections()
];

POST.apiDoc = {
  description: 'Adds a survey to existing collections',
  tags: ['collections'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Collection survey create request object.',
    required: true,
    content: {
      'application/json': {
        schema: CreateCollectionSurveySchema
      }
    }
  },
  responses: {
    201: {
      description: 'Collection create response object.'
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
 * Add a survey to existing collections
 *
 * @returns {RequestHandler}
 */
export function addSurveyToCollections(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'addSurveyToCollections' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionSurveyService = new CollectionSurveyService(connection);

      const data = req.body as ICreateCollectionSurveyRequest;

      await collectionSurveyService.addSurveyToMultipleCollections(data);

      await connection.commit();

      return res.status(201).json();
    } catch (error) {
      defaultLog.error({ label: 'addSurveyToCollections', message: 'error', error });
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
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validCollectionRoles: [COLLECTION_ROLE.ADMIN, COLLECTION_ROLE.MEMBER],
          collectionId: Number(req.params.surveyId),
          discriminator: 'CollectionRole'
        }
      ]
    };
  }),
  getCollectionsBySurveyId()
];

GET.apiDoc = {
  description: "Gets a list of collections based on the user's permissions and filter criteria.",
  tags: ['collections'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      required: true,
      schema: {
        type: 'integer',
        description: 'Primary key of the survey to get collections for'
      }
    }
  ],
  responses: {
    200: {
      description: 'Survey collections response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['collections'],
            properties: {
              collections: {
                type: 'array',
                items: GetCollectionSchema,
                description: 'The list of collections that the survey belongs to'
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

/**
 * Get collections that the given survey belongs to
 *
 * @returns {RequestHandler}
 */
export function getCollectionsBySurveyId(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getCollectionsBySurveyId' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);

      const collectionService = new CollectionService(connection);

      const collections = await collectionService.getCollectionsBySurveyId(surveyId);

      await connection.commit();

      return res.status(200).json({ collections });
    } catch (error) {
      defaultLog.error({ label: 'getCollectionsBySurveyId', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
