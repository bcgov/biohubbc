import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { EmlService } from '../../services/eml-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/export/eml');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.query.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getProjectEml()
];

GET.apiDoc = {
  description: 'Produces an Ecological Metadata Language (EML) extract for a target data package.',
  tags: ['eml', 'dwc'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'query',
      name: 'surveyId',
      schema: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 1
        }
      },
      description: 'Specify which surveys to include in the EML. Defaults to all surveys if none specified.'
    },
    {
      in: 'query',
      name: 'includeSensitive',
      schema: {
        type: 'string',
        enum: ['true', 'false'],
        default: 'false'
      },
      description: 'Specify if sensitive metadata should be included in the EML. Defaults to false if not specified.'
    }
  ],
  responses: {
    200: {
      description: 'Ecological Metadata Language (EML) extract production OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['eml'],
            properties: {
              eml: {
                type: 'string',
                description: 'Project EML data in XML format'
              }
            }
          },
          encoding: {
            eml: {
              contentType: 'application/xml; charset=utf-8'
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

export function getProjectEml(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.query.projectId);

    const surveyIds = (req.query.surveyId as string[] | undefined)?.map((item) => Number(item));

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const emlService = new EmlService({ projectId: projectId }, connection);

      const xmlData = await emlService.buildProjectEml({
        includeSensitiveData: req.query.includeSensitive === 'true' || false,
        surveyIds: surveyIds
      });

      await connection.commit();

      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      res.attachment(`project_${projectId}_eml.xml`);
      res.contentType('application/xml');

      return res.status(200).json({ eml: xmlData });
    } catch (error) {
      defaultLog.error({ label: 'getProjectEml', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
