import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../../../database/db';
import { ICreateCollectionSurveyRequest } from '../../../../../../models/collection';
import { CreateCollectionSurveySchema } from '../../../../../../openapi/schemas/collection-survey';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { CollectionSurveyService } from '../../../../../../services/collection-survey-service';
import { defaultLog } from '../sample-site';

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
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
