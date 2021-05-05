import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection} from '../../../../database/db';
import { HTTP400 } from '../../../../errors/CustomError';
import { PostSurveyData } from '../../../../models/survey-create';
import { surveyCreatePostRequestObject, surveyIdResponseObject } from '../../../../openapi/schemas/survey';
import {
  postSurveySQL,

} from '../../../../queries/survey/survey-create-queries';
import { getLogger } from '../../../../utils/logger';
import { logRequest } from '../../../../utils/path-utils';

const defaultLog = getLogger('paths/project');

export const POST: Operation = [logRequest('paths/project/{projectId}/survey/create', 'POST'), createSurvey()];

POST.apiDoc = {
  description: 'Create a new Survey.',
  tags: ['survey'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Survey post request object.',
    content: {
      'application/json': {
        schema: {
          ...(surveyCreatePostRequestObject as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            ...(surveyIdResponseObject as object)
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
 * Creates a new project record.
 *
 * @returns {RequestHandler}
 */
function createSurvey(): RequestHandler {
  return async (req, res) => {

    defaultLog.debug({
      label: 'Add a survey to a project',
      message: 'params and body',
      'req.params': req.params,
      'req.body': req.body
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }
    const connection = getDBConnection(req['keycloak_token']);
    const sanitizedPostSurveyData = req.body && new PostSurveyData(req.body);
    if (!sanitizedPostSurveyData) {
      throw new HTTP400('Missing funding source data');
    }

    try {

      const postSurveySQLStatement = postSurveySQL(
        Number(req.params.projectId),
        sanitizedPostSurveyData
      );

      if (!postSurveySQLStatement) {
        throw new HTTP400('Failed to build SQL insert statement');
      }

      let surveyId: number;

      try {
        await connection.open();

        // Handle survey details
        const createSurveyResponse = await connection.query(
          postSurveySQLStatement.text,
          postSurveySQLStatement.values
        );

        const surveyResult =
          (createSurveyResponse && createSurveyResponse.rows && createSurveyResponse.rows[0]) || null;

        if (!surveyResult || !surveyResult.id) {
          throw new HTTP400('Failed to insert a survey');
        }

        surveyId = surveyResult.id;

        const promises: Promise<any>[] = [];

        // Handle  species
        // promises.push(
        //   Promise.all(
        //     sanitizedSurveyPostData.species.focal_species.map((focalSpecies: string) =>
        //       insertFocalSpecies(focalSpecies, projectId, connection)
        //     )
        //   )
        // );


        await Promise.all(promises);

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }

      return res.status(200).json({ id: surveyId });
    } catch (error) {
      defaultLog.debug({ label: 'createSurvey', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

// export const insertFocalSpecies = async (
//   focal_species: string,
//   project_id: number,
//   connection: IDBConnection
// ): Promise<number> => {
//   const sqlStatement = postFocalSpeciesSQL(focal_species, project_id);

//   if (!sqlStatement) {
//     throw new HTTP400('Failed to build SQL insert statement');
//   }

//   const response = await connection.query(sqlStatement.text, sqlStatement.values);

//   const result = (response && response.rows && response.rows[0]) || null;

//   if (!result || !result.id) {
//     throw new HTTP400('Failed to insert project focal species data');
//   }

//   return result.id;
// };
