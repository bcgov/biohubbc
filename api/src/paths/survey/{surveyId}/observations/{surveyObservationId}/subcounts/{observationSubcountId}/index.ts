import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SubCountService } from '../../../../../../../services/subcount-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger(
  '/api/survey/{surveyId}/observation/{surveyObservationId}/subcounts/{observationSubcountId}'
);

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteObservationSubcount()
];

DELETE.apiDoc = {
  description:
    'Delete an observation subcount record. Will delete the parent observation record if it is the last subcount record.',
  tags: ['observation'],
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
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyObservationId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'observationSubcountId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Delete OK.'
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
 * Delete an observation subcount record.
 *
 * Will delete the parent observation record if it is the last subcount record as
 * all survey observation records must have at least one subcount record.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteObservationSubcount(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const observationSubcountId = Number(req.params.observationSubcountId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const subCountService = new SubCountService(connection);

      const observationData = await subCountService.deleteObservationSubcount(surveyId, observationSubcountId);

      await connection.commit();

      return res.status(200).json(observationData);
    } catch (error) {
      defaultLog.error({ label: 'deleteObservationSubcount', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
