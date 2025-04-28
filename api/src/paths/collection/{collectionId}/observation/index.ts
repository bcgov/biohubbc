import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { findObservationsSchema, observationsSupplementaryDataSchema } from '../../../../openapi/schemas/observation';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { CollectionService } from '../../../../services/collection-service';
import { getLogger } from '../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../utils/pagination';

const defaultLog = getLogger('/api/collection/{collectionId}/observation/index');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            SURVEY_PERMISSION.COORDINATOR,
            SURVEY_PERMISSION.COLLABORATOR,
            SURVEY_PERMISSION.OBSERVER
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
  getCollectionObservations()
];

GET.apiDoc = {
  description: 'Get all observations for the collection.',
  tags: ['observation'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'collectionId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },

    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Collection Observations get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['collectionObservations', 'supplementaryObservationData', 'pagination'],
            properties: {
              collectionObservations: findObservationsSchema,
              supplementaryObservationData: observationsSupplementaryDataSchema,
              pagination: paginationResponseSchema
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
 * This record maps observation table sampling site site ID columns to sampling data
 * columns that can be sorted on.
 *
 * TODO We should probably modify frontend functionality to make requests to sort on these
 * columns.
 */
const samplingSiteSortingColumnName: Record<string, string> = {
  collection_sample_site_id: 'collection_sample_site_name',
  method_technique_id: 'method_technique_name',
  collection_sample_period_id: 'collection_sample_period_start_datetime'
};

/**
 * Fetch all observations for a collection.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getCollectionObservations(): RequestHandler {
  return async (req, res) => {
    const collectionId = Number(req.params.collectionId);

    defaultLog.debug({ label: 'getCollectionObservations', collectionId });

    const paginationOptions = makePaginationOptionsFromRequest(req);
    if (paginationOptions.sort && samplingSiteSortingColumnName[paginationOptions.sort]) {
      paginationOptions.sort = samplingSiteSortingColumnName[paginationOptions.sort];
    }

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const collectionService = new CollectionService(connection);

      const observationData = await collectionService.getCollectionObservations(
        collectionId,
        ensureCompletePaginationOptions(paginationOptions)
      );

      await connection.commit();

      const observationCount = observationData.supplementaryObservationData.observationCount;

      return res.status(200).json({
        collectionObservations: observationData.surveyObservations,
        supplementaryObservationData: observationData.supplementaryObservationData,
        pagination: makePaginationResponse(observationCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getCollectionObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
