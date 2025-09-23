import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { COLLECTION_ROLE, SURVEY_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import {
  findObservationsSchema,
  insertObservationSchema,
  observationsSupplementaryDataSchema
} from '../../../../openapi/schemas/observation';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../../openapi/schemas/pagination';
import { InsertSurveyObservation } from '../../../../repositories/observation-repository/observation-repository.interface';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../services/observation-services/observation-service';
import { getLogger } from '../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../utils/pagination';

const defaultLog = getLogger('/api/survey/{surveyId}/observation');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validCollectionRoles: [COLLECTION_ROLE.ADMIN, COLLECTION_ROLE.MEMBER],
          collectionId: Number(req.params.surveyId),
          discriminator: 'CollectionRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyObservations()
];

export const POST: Operation = [
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
  postObservations()
];

GET.apiDoc = {
  description: 'Get all observations for the survey.',
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
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Survey Observations get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['surveyObservations', 'supplementaryObservationData', 'pagination'],
            properties: {
              surveyObservations: findObservationsSchema,
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

POST.apiDoc = {
  description: 'Insert survey observation records.',
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
      required: true
    }
  ],
  requestBody: {
    description: 'Survey observation record data',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            surveyObservations: {
              description: 'Survey observation records.',
              type: 'array',
              items: insertObservationSchema,
              minItems: 1
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Create observations OK'
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
  survey_sample_site_id: 'survey_sample_site_name',
  method_technique_id: 'method_technique_name',
  survey_sample_period_id: 'survey_sample_period_start_datetime'
};

/**
 * Fetch all observations for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    defaultLog.debug({ label: 'getSurveyObservations', surveyId });

    const paginationOptions = makePaginationOptionsFromRequest(req);
    if (paginationOptions.sort && samplingSiteSortingColumnName[paginationOptions.sort]) {
      paginationOptions.sort = samplingSiteSortingColumnName[paginationOptions.sort];
    }

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const observationData =
        await observationService.getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(
          [surveyId],
          ensureCompletePaginationOptions(paginationOptions)
        );

      await connection.commit();

      const observationCount = observationData.supplementaryObservationData.observationCount;

      return res.status(200).json({
        surveyObservations: observationData.surveyObservations,
        supplementaryObservationData: observationData.supplementaryObservationData,
        pagination: makePaginationResponse(observationCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Inserts new observation records.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function postObservations(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);
      const insertSurveyObservationObjects: InsertSurveyObservation[] = req.body.surveyObservations;

      defaultLog.debug({ label: 'postObservation', surveyId });

      await connection.open();

      const observationService = new ObservationService(connection);

      await observationService.insertObservations(surveyId, insertSurveyObservationObjects);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'postObservation', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
