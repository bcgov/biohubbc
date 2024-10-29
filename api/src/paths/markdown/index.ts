import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { markdownSchema } from '../../openapi/schemas/markdown';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { MarkdownService } from '../../services/markdown-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/observation/index');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getMarkdown()
];

GET.apiDoc = {
  description: "Gets a markdown record to display in a help dialog",
  tags: ['markdown'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'typeName',
      description: 'Name of a markdown_type record',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    }
  ],
  responses: {
    200: {
      description: 'Observation response object.',
      content: {
        'application/json': {
          schema: markdownSchema
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
 * Get markdown for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function getMarkdown(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getObservations' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const markdownTypeName = (req.query.typeName as string) ?? '';

      const markdownService = new MarkdownService(connection);

      const markdown = await markdownService.getMarkdownByTypeName({
        markdown_type_name: markdownTypeName,
        system_user_id: systemUserId
      });

      await connection.commit();

      return res.status(200).json({ markdown });
    } catch (error) {
      defaultLog.error({ label: 'getObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
