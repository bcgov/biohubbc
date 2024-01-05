import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { OccurrenceService } from '../../services/occurrence-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/dwc/metadata');

export const GET: Operation = [getSpatialMetadataBySubmissionSpatialComponentIds()];

GET.apiDoc = {
  description: 'Retrieves spatial component metadata based on submission spatial component id',
  tags: ['spatial'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      description: 'spatial component submission ids',
      in: 'query',
      name: 'submissionSpatialComponentIds',
      schema: {
        type: 'array',
        items: {
          type: 'number',
          minimum: 1
        }
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Spatial metadata response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
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
 * Retrieves dataset metadata from Elastic Search.
 *
 * @returns {RequestHandler}
 */
export function getSpatialMetadataBySubmissionSpatialComponentIds(): RequestHandler {
  return async (req, res) => {
    const submissionSpatialComponentIds = ((req.query.submissionSpatialComponentIds || []) as string[]).map(Number);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const occurrenceService = new OccurrenceService(connection);

      const response = await occurrenceService.findSpatialMetadataBySubmissionSpatialComponentIds(
        submissionSpatialComponentIds
      );

      await connection.commit();

      res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSpatialMetadataBySubmissionSpatialComponentIds', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
