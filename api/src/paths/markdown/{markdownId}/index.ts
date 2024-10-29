import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { MarkdownService } from '../../../services/markdown-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/markdown/{markdownId}/index');

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
  scoreMarkdown()
];

POST.apiDoc = {
  description: 'Submits a score for a markdown record',
  tags: ['markdown'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'markdownId',
      description: 'Primary key of a markdown record to submit a score for',
      schema: {
        type: 'integer'
      }
    }
  ],
  requestBody: {
    description: 'Score for a markdown record.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['score'],
          properties: {
            score: { type: 'number', description: 'Score to add to the markdown record', enum: [-1, 1] }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Markdown score response object.'
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
 * Get markdown for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function scoreMarkdown(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'scoreMarkdown' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const markdownId = Number(req.params.markdownId);
      const score = req.body.score;

      const markdownService = new MarkdownService(connection);

      // Increase or decrease the score of a markdown record
      await markdownService.updateScore(markdownId, systemUserId, score);

      // Record that the user has scored the markdown record
      await markdownService.insertUserParticipation(markdownId, systemUserId);

      await connection.commit();

      return res.status(200).json();
    } catch (error) {
      defaultLog.error({ label: 'getObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
