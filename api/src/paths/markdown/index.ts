import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { markdownSchema } from '../../openapi/schemas/markdown';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { MarkdownService } from '../../services/markdown-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/markdown/index');

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
  getMarkdownByTypeName()
];

GET.apiDoc = {
  description: 'Gets a markdown record to display in a help dialog.',
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
      description: 'The name of a markdown type to retrieve the latest markdown record for',
      required: true,
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'Markdown response object.',
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
 * Get the latest markdown text for a given markdown type
 *
 * @returns {RequestHandler}
 */
export function getMarkdownByTypeName(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getMarkdownByTypeName' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const markdownTypeName = req.query.typeName as string;

      const markdownService = new MarkdownService(connection);

      const markdown = await markdownService.getMarkdownByTypeName({
        markdown_type_name: markdownTypeName,
        system_user_id: systemUserId
      });

      await connection.commit();

      return res.status(200).json({ markdown });
    } catch (error) {
      defaultLog.error({ label: 'getMarkdown', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
