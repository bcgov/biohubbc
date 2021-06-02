import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400, HTTP409 } from '../../../../../errors/CustomError';
import { PutSurveyDetailsData, PutSurveyProprietorData } from '../../../../../models/survey-update';
import { GetSurveyDetailsData, GetSurveyProprietorData } from '../../../../../models/survey-view-update';
import {
  surveyIdResponseObject,
  surveyUpdateGetResponseObject,
  surveyUpdatePutRequestObject
} from '../../../../../openapi/schemas/survey';
import {
  getSurveyDetailsForUpdateSQL,
  getSurveyProprietorForUpdateSQL
} from '../../../../../queries/survey/survey-view-update-queries';
import { putSurveyDetailsSQL, putSurveyProprietorSQL } from '../../../../../queries/survey/survey-update-queries';
import {
  deleteFocalSpeciesSQL,
  deleteAncillarySpeciesSQL,
  deleteSurveyProprietorSQL
} from '../../../../../queries/survey/survey-delete-queries';
import { getLogger } from '../../../../../utils/logger';
import { logRequest } from '../../../../../utils/path-utils';
import { insertAncillarySpecies, insertFocalSpecies } from '../create';
import { postSurveyProprietorSQL } from '../../../../../queries/survey/survey-create-queries';
import { PostSurveyProprietorData } from '../../../../../models/survey-create';

export interface IUpdateSurvey {
  survey_details: object | null;
  survey_proprietor: object | null;
}

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/update');

export const GET: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/update', 'GET'),
  getSurveyForUpdate()
];

export const PUT: Operation = [logRequest('paths/project/{projectId}/survey/{surveyId}/update', 'PUT'), updateSurvey()];

export enum GET_SURVEY_ENTITIES {
  survey_details = 'survey_details',
  survey_proprietor = 'survey_proprietor'
}

export const getAllSurveyEntities = (): string[] => Object.values(GET_SURVEY_ENTITIES);

GET.apiDoc = {
  description: 'Get a project survey, for update purposes.',
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
    },
    {
      in: 'query',
      name: 'entity',
      schema: {
        type: 'array',
        items: {
          type: 'string',
          enum: getAllSurveyEntities()
        }
      }
    }
  ],
  responses: {
    200: {
      description: 'Survey with matching surveyId.',
      content: {
        'application/json': {
          schema: {
            ...(surveyUpdateGetResponseObject as object)
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

PUT.apiDoc = {
  description: 'Update a survey.',
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
  requestBody: {
    description: 'Survey put request object.',
    content: {
      'application/json': {
        schema: {
          ...(surveyUpdatePutRequestObject as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Survey with matching surveyId.',
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

export interface IGetSurveyForUpdate {
  survey_details: GetSurveyDetailsData | null;
  survey_proprietor: GetSurveyProprietorData | null;
}

/**
 * Get a survey by projectId and surveyId.
 *
 * @returns {RequestHandler}
 */
export function getSurveyForUpdate(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const surveyId = Number(req.params.surveyId);

      const entities: string[] = (req.query?.entity as string[]) || getAllSurveyEntities();

      if (!surveyId) {
        throw new HTTP400('Missing required path parameter: surveyId');
      }

      await connection.open();

      const results: IGetSurveyForUpdate = {
        survey_details: null,
        survey_proprietor: null
      };

      const promises: Promise<any>[] = [];

      if (entities.includes(GET_SURVEY_ENTITIES.survey_details)) {
        promises.push(
          getSurveyDetailsData(surveyId, connection).then((value) => {
            results.survey_details = value;
          })
        );
      }

      if (entities.includes(GET_SURVEY_ENTITIES.survey_proprietor)) {
        promises.push(
          getSurveyProprietorData(surveyId, connection).then((value) => {
            results.survey_proprietor = value;
          })
        );
      }

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send(results);
    } catch (error) {
      defaultLog.debug({ label: 'getSurveyForUpdate', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getSurveyDetailsData = async (
  surveyId: number,
  connection: IDBConnection
): Promise<GetSurveyDetailsData> => {
  const sqlStatement = getSurveyDetailsForUpdateSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build survey details SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && new GetSurveyDetailsData(response.rows)) || null;

  if (!result) {
    throw new HTTP400('Failed to get project survey details data');
  }

  return result;
};

export const getSurveyProprietorData = async (
  surveyId: number,
  connection: IDBConnection
): Promise<GetSurveyProprietorData | null> => {
  const sqlStatement = getSurveyProprietorForUpdateSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build survey proprietor SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result =
    (response && response.rows && response.rows[0] && new GetSurveyProprietorData(response.rows[0])) || null;

  if (!result) {
    throw new HTTP400('Failed to get project survey proprietor data');
  }

  return result;
};

/**
 * Update a survey.
 *
 * @returns {RequestHandler}
 */
export function updateSurvey(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);
      const surveyId = Number(req.params.surveyId);

      const entities: IUpdateSurvey = req.body;

      if (!projectId) {
        throw new HTTP400('Missing required path parameter: projectId');
      }

      if (!surveyId) {
        throw new HTTP400('Missing required path parameter: surveyId');
      }

      if (!entities) {
        throw new HTTP400('Missing required request body');
      }

      await connection.open();

      const promises: Promise<any>[] = [];

      if (entities.survey_details) {
        promises.push(updateSurveyDetailsData(projectId, surveyId, entities, connection));
      }

      if (entities.survey_proprietor) {
        promises.push(updateSurveyProprietorData(surveyId, entities, connection));
      }

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'updateSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const updateSurveyDetailsData = async (
  projectId: number,
  surveyId: number,
  data: IUpdateSurvey,
  connection: IDBConnection
): Promise<void> => {
  const putDetailsData = new PutSurveyDetailsData(data);

  const revision_count = putDetailsData.revision_count ?? null;

  if (!revision_count && revision_count !== 0) {
    throw new HTTP400('Failed to parse request body');
  }

  const updateSurveySQLStatement = putSurveyDetailsSQL(projectId, surveyId, putDetailsData, revision_count);

  if (!updateSurveySQLStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const result = await connection.query(updateSurveySQLStatement.text, updateSurveySQLStatement.values);

  if (!result || !result.rowCount) {
    throw new HTTP409('Failed to update stale survey data');
  }

  const sqlDeleteFocalSpeciesStatement = deleteFocalSpeciesSQL(surveyId);
  const sqlDeleteAncillarySpeciesStatement = deleteAncillarySpeciesSQL(surveyId);

  if (!sqlDeleteFocalSpeciesStatement || !sqlDeleteAncillarySpeciesStatement) {
    throw new HTTP400('Failed to build SQL delete statement');
  }

  const deleteFocalSpeciesPromises = connection.query(
    sqlDeleteFocalSpeciesStatement.text,
    sqlDeleteFocalSpeciesStatement.values
  );

  const deleteAncillarySpeciesPromises = connection.query(
    sqlDeleteAncillarySpeciesStatement.text,
    sqlDeleteAncillarySpeciesStatement.values
  );

  const [deleteFocalSpeciesResult, deleteAncillarySpeciesResult] = await Promise.all([
    deleteFocalSpeciesPromises,
    deleteAncillarySpeciesPromises
  ]);

  if (!deleteFocalSpeciesResult) {
    throw new HTTP409('Failed to delete survey focal species data');
  }

  if (!deleteAncillarySpeciesResult) {
    throw new HTTP409('Failed to delete survey ancillary species data');
  }

  const insertFocalSpeciesPromises =
    putDetailsData.focal_species.map((focalSpeciesId: number) =>
      insertFocalSpecies(focalSpeciesId, surveyId, connection)
    ) || [];

  const insertAncillarySpeciesPromises =
    putDetailsData.ancillary_species.map((ancillarySpeciesId: number) =>
      insertAncillarySpecies(ancillarySpeciesId, surveyId, connection)
    ) || [];

  await Promise.all([...insertFocalSpeciesPromises, ...insertAncillarySpeciesPromises]);
};

export const updateSurveyProprietorData = async (
  surveyId: number,
  entities: IUpdateSurvey,
  connection: IDBConnection
): Promise<void> => {
  const putProprietorData = new PutSurveyProprietorData(entities.survey_proprietor);
  const isProprietary = putProprietorData.survey_data_proprietary;
  const wasProprietary = putProprietorData.id > 0 || false;

  let sqlStatement = null;

  if (!wasProprietary && !isProprietary) {
    // 1. did not have proprietor data; still not requiring proprietor data
    // do nothing
    return;
  } else if (wasProprietary && !isProprietary) {
    // 2. did have proprietor data; no longer requires proprietor data
    // delete old record
    sqlStatement = deleteSurveyProprietorSQL(surveyId, putProprietorData.id);
  } else if (!wasProprietary && isProprietary) {
    // 3. did not have proprietor data; now requires proprietor data
    // insert new record
    sqlStatement = postSurveyProprietorSQL(surveyId, new PostSurveyProprietorData(entities.survey_proprietor));
  } else {
    // 4. did have proprietor data; updating proprietor data
    // update existing record
    sqlStatement = putSurveyProprietorSQL(surveyId, putProprietorData);
  }

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  const result = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!result || !result.rowCount) {
    throw new HTTP409('Failed to update survey proprietor data');
  }
};
