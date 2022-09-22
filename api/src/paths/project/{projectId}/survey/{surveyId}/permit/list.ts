import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { IPermitModel } from '../../../../../../repositories/permit-repository';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { PermitService } from '../../../../../../services/permit-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/permits/list');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  listSurveyPermits()
];

GET.apiDoc = {
  description: 'Fetches a list of permits for a survey.',
  tags: ['permits'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Permits get response array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Survey permit Get Response Object',
              type: 'object',
              required: [
                'permit_id',
                'number',
                'type',
                'create_date',
                'create_user',
                'update_date',
                'update_user',
                'revision_count'
              ],
              properties: {
                permit_id: {
                  type: 'integer',
                  minimum: 1
                },
                number: {
                  type: 'string'
                },
                type: {
                  type: 'string'
                },
                create_date: {
                  oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                  description: 'ISO 8601 date string for the permit create_date'
                },
                create_user: {
                  type: 'integer',
                  nullable: true
                },
                update_date: {
                  oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                  description: 'ISO 8601 date string for the permit update_date',
                  nullable: true
                },
                update_user: {
                  type: 'integer',
                  nullable: true
                },
                revision_count: {
                  type: 'integer',
                  nullable: true
                }
              }
            },
            description: 'Permits applicable for the survey'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function listSurveyPermits(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const permitService = new PermitService(connection);

      const permits: IPermitModel[] = await permitService.getPermitBySurveyId(surveyId);

      await connection.commit();

      res.status(200).json(permits);
    } catch (error) {
      defaultLog.error({ label: 'listSurveyPermits', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
