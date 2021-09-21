import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { GetSurveyProprietorData } from '../../../../../models/survey-view-update';
import { GetViewSurveyDetailsData } from '../../../../../models/survey-view';
import { surveyViewGetResponseObject } from '../../../../../openapi/schemas/survey';
import { getSurveyForViewSQL } from '../../../../../queries/survey/survey-view-queries';
import { getSurveyProprietorForUpdateSQL } from '../../../../../queries/survey/survey-view-update-queries';
import { getLogger } from '../../../../../utils/logger';
import { logRequest } from '../../../../../utils/path-utils';
import {
  getOccurrenceGeometrySQL,
  getOccurrenceSubmissionIdsSQL
} from '../../../../../queries/occurrence/occurrence-view-queries';
import { GetOccurrenceGeometriesData } from '../../../../../models/occurrence-view';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/view');

export const GET: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/view', 'GET'),
  getSurveyForView()
];

GET.apiDoc = {
  description: 'Get a project survey, for view-only purposes.',
  tags: ['survey'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey with matching surveyId.',
      content: {
        'application/json': {
          schema: {
            ...(surveyViewGetResponseObject as object)
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
      $ref: '#/components/responses/401'
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
 * Get a survey by projectId and surveyId.
 *
 * @returns {RequestHandler}
 */
export function getSurveyForView(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveySQLStatement = getSurveyForViewSQL(Number(req.params.surveyId));
      const getSurveyProprietorSQLStatement = getSurveyProprietorForUpdateSQL(Number(req.params.surveyId));
      const getOccurrenceSubmissionIdsSQLStatement = getOccurrenceSubmissionIdsSQL(Number(req.params.surveyId));

      if (!getSurveySQLStatement || !getSurveyProprietorSQLStatement || !getOccurrenceSubmissionIdsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const [surveyData, surveyProprietorData, occurrenceSubmssionIdsData] = await Promise.all([
        await connection.query(getSurveySQLStatement.text, getSurveySQLStatement.values),
        await connection.query(getSurveyProprietorSQLStatement.text, getSurveyProprietorSQLStatement.values),
        await connection.query(
          getOccurrenceSubmissionIdsSQLStatement.text,
          getOccurrenceSubmissionIdsSQLStatement.values
        )
      ]);

      const getOccurrenceSubmissionIdsData = (occurrenceSubmssionIdsData && occurrenceSubmssionIdsData.rows) || [];

      const occurrenceGeometriesPromises: Promise<any>[] = [];

      occurrenceGeometriesPromises.push(
        Promise.all(
          getOccurrenceSubmissionIdsData.map((occurrenceSubmissionIdData: any) =>
            getOccurrenceGeometry(occurrenceSubmissionIdData.id, connection)
          )
        )
      );

      const occurrenceGeometriesResult = await Promise.all(occurrenceGeometriesPromises);

      if (!occurrenceGeometriesResult[0].length || !occurrenceGeometriesResult[0][0].length) {
        throw new HTTP400('Failed to get occurrence geometry data');
      }

      const occurrenceGeometries = occurrenceGeometriesResult[0][0];

      await connection.commit();

      const getSurveyData = (surveyData && surveyData.rows && new GetViewSurveyDetailsData(surveyData.rows)) || null;

      const getSurveyProprietorData =
        (surveyProprietorData &&
          surveyProprietorData.rows &&
          surveyProprietorData.rows[0] &&
          new GetSurveyProprietorData(surveyProprietorData.rows[0])) ||
        null;

      const result = {
        survey_details: getSurveyData,
        survey_proprietor: getSurveyProprietorData,
        occurrence_geometries: occurrenceGeometries
      };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getSurveyForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getOccurrenceGeometry = async (
  occurrenceSubmissionId: number,
  connection: IDBConnection
): Promise<any> => {
  const sqlStatement = getOccurrenceGeometrySQL(occurrenceSubmissionId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get occurrence geometry statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && new GetOccurrenceGeometriesData(response.rows)) || null;

  if (!result || !result.occurrenceGeometries) {
    throw new HTTP400('Failed to get occurrence geometry data');
  }

  return result.occurrenceGeometries;
};
