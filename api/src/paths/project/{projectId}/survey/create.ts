import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/CustomError';
import { PostSurveyObject, PostSurveyProprietorData } from '../../../../models/survey-create';
import { surveyCreatePostRequestObject, surveyIdResponseObject } from '../../../../openapi/schemas/survey';
import {
  insertSurveyFundingSourceSQL,
  postAncillarySpeciesSQL,
  postFocalSpeciesSQL,
  postNewSurveyPermitSQL,
  postSurveyProprietorSQL,
  postSurveySQL
} from '../../../../queries/survey/survey-create-queries';
import { putNewSurveyPermitNumberSQL } from '../../../../queries/survey/survey-update-queries';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/create');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  createSurvey()
];

POST.apiDoc = {
  description: 'Create a new Survey.',
  tags: ['survey'],
  security: [
    {
      Bearer: []
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
      description: 'Survey response object.',
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
 * Creates a new survey record.
 *
 * @returns {RequestHandler}
 */
export function createSurvey(): RequestHandler {
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

    const projectId = Number(req.params.projectId);
    const connection = getDBConnection(req['keycloak_token']);
    const sanitizedPostSurveyData = (req.body && new PostSurveyObject(req.body)) || null;

    if (!sanitizedPostSurveyData) {
      throw new HTTP400('Missing survey data');
    }

    try {
      const postSurveySQLStatement = postSurveySQL(projectId, sanitizedPostSurveyData);

      if (!postSurveySQLStatement) {
        throw new HTTP400('Failed to build survey SQL insert statement');
      }

      let surveyId: number;

      try {
        await connection.open();

        // Handle survey details
        const createSurveyResponse = await connection.query(postSurveySQLStatement.text, postSurveySQLStatement.values);

        const surveyResult =
          (createSurveyResponse && createSurveyResponse.rows && createSurveyResponse.rows[0]) || null;

        if (!surveyResult || !surveyResult.id) {
          throw new HTTP400('Failed to insert survey data');
        }

        surveyId = surveyResult.id;

        const promises: Promise<any>[] = [];

        // Handle focal species associated to this survey
        promises.push(
          Promise.all(
            sanitizedPostSurveyData.focal_species.map((speciesId: number) =>
              insertFocalSpecies(speciesId, surveyId, connection)
            )
          )
        );

        // Handle ancillary species associated to this survey
        promises.push(
          Promise.all(
            sanitizedPostSurveyData.ancillary_species.map((speciesId: number) =>
              insertAncillarySpecies(speciesId, surveyId, connection)
            )
          )
        );

        // Handle inserting any permit associated to this survey
        if (sanitizedPostSurveyData.permit_number) {
          promises.push(
            insertSurveyPermit(
              sanitizedPostSurveyData.permit_number,
              sanitizedPostSurveyData.permit_type,
              projectId,
              surveyId,
              connection
            )
          );
        }

        // Handle inserting any funding sources associated to this survey
        promises.push(
          Promise.all(
            sanitizedPostSurveyData.funding_sources.map((fsId: number) =>
              insertSurveyFundingSource(fsId, surveyId, connection)
            )
          )
        );

        // Handle survey proprietor data
        sanitizedPostSurveyData.survey_proprietor &&
          promises.push(insertSurveyProprietor(sanitizedPostSurveyData.survey_proprietor, surveyId, connection));

        await Promise.all(promises);

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }

      return res.status(200).json({ id: surveyId });
    } catch (error) {
      defaultLog.error({ label: 'createSurvey', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const insertFocalSpecies = async (
  focal_species_id: number,
  survey_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postFocalSpeciesSQL(focal_species_id, survey_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);
  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert focal species data');
  }

  return result.id;
};

export const insertAncillarySpecies = async (
  ancillary_species_id: number,
  survey_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postAncillarySpeciesSQL(ancillary_species_id, survey_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);
  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert ancillary species data');
  }

  return result.id;
};

export const insertSurveyProprietor = async (
  survey_proprietor: PostSurveyProprietorData,
  survey_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postSurveyProprietorSQL(survey_id, survey_proprietor);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);
  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert survey proprietor data');
  }

  return result.id;
};

export const insertSurveyPermit = async (
  permitNumber: string,
  permitType: string | null,
  projectId: number,
  surveyId: number,
  connection: IDBConnection
): Promise<void> => {
  let sqlStatement;

  if (!permitType) {
    sqlStatement = putNewSurveyPermitNumberSQL(surveyId, permitNumber);
  } else {
    const systemUserId = connection.systemUserId();

    sqlStatement = postNewSurveyPermitSQL(systemUserId, projectId, surveyId, permitNumber, permitType);
  }

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement for insertSurveyPermit');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to insert survey permit number data');
  }
};

export const insertSurveyFundingSource = async (
  funding_source_id: number,
  survey_id: number,
  connection: IDBConnection
): Promise<void> => {
  const sqlStatement = insertSurveyFundingSourceSQL(survey_id, funding_source_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement for insertSurveyFundingSource');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to insert survey funding source data');
  }
};
