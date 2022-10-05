import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ValidationService } from '../../services/validation-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/dwc/validate');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.body.project_id),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  processDWCFile()
];

export const getValidateAPIDoc = (basicDescription: string, successDescription: string, tags: string[]) => {
  return {
    description: basicDescription,
    tags: tags,
    security: [
      {
        Bearer: []
      }
    ],
    requestBody: {
      description: 'Request body',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['project_id', 'occurrence_submission_id'],
            properties: {
              project_id: {
                type: 'number'
              },
              occurrence_submission_id: {
                description: 'A survey occurrence submission ID',
                type: 'number',
                example: 1
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: successDescription,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string'
                },
                reason: {
                  type: 'string'
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
};

POST.apiDoc = {
  ...getValidateAPIDoc(
    'Validates a Darwin Core (DWC) Archive survey observation submission.',
    'Validate Darwin Core (DWC) Archive survey observation submission OK',
    ['survey', 'observation', 'dwc']
  )
};

export function processDWCFile(): RequestHandler {
  return async (req, res, next) => {
    const submissionId = req.body.occurrence_submission_id
    if (!submissionId) {
      throw new HTTP400('Missing required paramter `occurrence field`')
    }
    
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open()

      const service = new ValidationService(connection)
      await service.processDWCFile(submissionId)

      await connection.commit()

      res.status(200).json({status: 'success'})
    } catch (error) {
      defaultLog.error({ label: 'xlsx process', message: 'error', error });
      await connection.rollback()
      throw error;
    } finally {
      console.log("Finally called")
      // creating a race condition 
      // await connection.release()
    }
  }
}
