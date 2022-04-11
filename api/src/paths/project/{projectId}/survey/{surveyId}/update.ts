import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400, HTTP409, HTTP500 } from '../../../../../errors/custom-error';
import { PostSurveyProprietorData } from '../../../../../models/survey-create';
import {
  GetUpdateSurveyDetailsData,
  PutSurveyDetailsData,
  PutSurveyProprietorData,
  PutSurveyPurposeAndMethodologyData
} from '../../../../../models/survey-update';
import { GetSurveyProprietorData, GetSurveyPurposeAndMethodologyData } from '../../../../../models/survey-view-update';
import { queries } from '../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../utils/logger';
import {
  insertAncillarySpecies,
  insertFocalSpecies,
  insertSurveyFundingSource,
  insertSurveyPermit,
  insertVantageCodes
} from '../create';
export interface IUpdateSurvey {
  survey_details: object | null;
  survey_purpose_and_methodology: object | null;
  survey_proprietor: object | null;
}

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/update');

export const GET: Operation = [
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
  getSurveyForUpdate()
];

export const PUT: Operation = [
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
  updateSurvey()
];

export enum GET_SURVEY_ENTITIES {
  survey_details = 'survey_details',
  survey_purpose_and_methodology = 'survey_purpose_and_methodology',
  survey_proprietor = 'survey_proprietor'
}

export const getAllSurveyEntities = (): string[] => Object.values(GET_SURVEY_ENTITIES);

GET.apiDoc = {
  description: 'Get a project survey, for update purposes.',
  tags: ['survey'],
  security: [
    {
      Bearer: []
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
            title: 'Survey get response object, for view purposes',
            type: 'object',
            properties: {}
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
      Bearer: []
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
          title: 'Survey Put Object',
          type: 'object',
          properties: {
            survey_name: { type: 'string' },
            focal_species: {
              type: 'array',
              items: {
                type: 'number'
              },
              description: 'Selected focal species ids'
            },
            ancillary_species: {
              type: 'array',
              items: {
                type: 'number'
              },
              description: 'Selected ancillary species ids'
            },
            start_date: { type: 'string' },
            end_date: { type: 'string' },
            biologist_first_name: { type: 'string' },
            biologist_last_name: { type: 'string' },
            survey_area_name: { type: 'string' },
            revision_count: { type: 'number' }
          }
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
            title: 'Survey Response Object',
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                type: 'number'
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
  survey_details: GetUpdateSurveyDetailsData | null;
  survey_purpose_and_methodology: GetSurveyPurposeAndMethodologyData | null;
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
        survey_purpose_and_methodology: null,
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

      if (entities.includes(GET_SURVEY_ENTITIES.survey_purpose_and_methodology)) {
        promises.push(
          getSurveyPurposeAndMethodologyData(surveyId, connection).then((value) => {
            results.survey_purpose_and_methodology = value;
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
      defaultLog.error({ label: 'getSurveyForUpdate', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getSurveyDetailsData = async (
  surveyId: number,
  connection: IDBConnection
): Promise<GetUpdateSurveyDetailsData> => {
  const sqlStatement = queries.survey.getSurveyDetailsForUpdateSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build survey details SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response?.rows.length && new GetUpdateSurveyDetailsData(response.rows[0])) || null;

  if (!result) {
    throw new HTTP400('Failed to get project survey details data');
  }

  return result;
};

export const getSurveyPurposeAndMethodologyData = async (
  surveyId: number,
  connection: IDBConnection
): Promise<GetSurveyPurposeAndMethodologyData | null> => {
  const sqlStatement = queries.survey.getSurveyPurposeAndMethodologyForUpdateSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build survey proprietor SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return (response && response.rows && new GetSurveyPurposeAndMethodologyData(response.rows)[0]) || null;
};

export const getSurveyProprietorData = async (
  surveyId: number,
  connection: IDBConnection
): Promise<GetSurveyProprietorData | null> => {
  const sqlStatement = queries.survey.getSurveyProprietorForUpdateSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build survey proprietor SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return (response && response.rows && response.rows[0] && new GetSurveyProprietorData(response.rows[0])) || null;
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

      if (entities.survey_purpose_and_methodology) {
        promises.push(updateSurveyPurposeAndMethodologyData(surveyId, entities, connection));
      }

      if (entities.survey_proprietor) {
        promises.push(updateSurveyProprietorData(surveyId, entities, connection));
      }

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSurvey', message: 'error', error });
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
): Promise<any[]> => {
  const putDetailsData = new PutSurveyDetailsData(data);

  const revision_count = putDetailsData.revision_count ?? null;

  if (!revision_count && revision_count !== 0) {
    throw new HTTP400('Failed to parse request body');
  }

  const updateSurveySQLStatement = queries.survey.putSurveyDetailsSQL(
    projectId,
    surveyId,
    putDetailsData,
    revision_count
  );

  if (!updateSurveySQLStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const result = await connection.query(updateSurveySQLStatement.text, updateSurveySQLStatement.values);

  if (!result || !result.rowCount) {
    throw new HTTP409('Failed to update stale survey data');
  }

  const sqlDeleteFocalSpeciesStatement = queries.survey.deleteFocalSpeciesSQL(surveyId);
  const sqlDeleteAncillarySpeciesStatement = queries.survey.deleteAncillarySpeciesSQL(surveyId);
  const sqlDeleteSurveyFundingSourcesStatement = queries.survey.deleteSurveyFundingSourcesBySurveyIdSQL(surveyId);

  if (
    !sqlDeleteFocalSpeciesStatement ||
    !sqlDeleteAncillarySpeciesStatement ||
    !sqlDeleteSurveyFundingSourcesStatement
  ) {
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

  const deleteSurveyFundingSourcesPromises = connection.query(
    sqlDeleteSurveyFundingSourcesStatement.text,
    sqlDeleteSurveyFundingSourcesStatement.values
  );

  const [deleteFocalSpeciesResult, deleteAncillarySpeciesResult, deleteSurveyFundingSourcesResult] = await Promise.all([
    deleteFocalSpeciesPromises,
    deleteAncillarySpeciesPromises,
    deleteSurveyFundingSourcesPromises
  ]);

  if (!deleteFocalSpeciesResult) {
    throw new HTTP409('Failed to delete survey focal species data');
  }

  if (!deleteAncillarySpeciesResult) {
    throw new HTTP409('Failed to delete survey ancillary species data');
  }

  if (!deleteSurveyFundingSourcesResult) {
    throw new HTTP409('Failed to delete survey funding sources data');
  }

  const promises: Promise<any>[] = [];

  putDetailsData.focal_species.forEach((focalSpeciesId: number) =>
    promises.push(insertFocalSpecies(focalSpeciesId, surveyId, connection))
  );

  putDetailsData.ancillary_species.forEach((ancillarySpeciesId: number) =>
    promises.push(insertAncillarySpecies(ancillarySpeciesId, surveyId, connection))
  );

  putDetailsData.funding_sources.forEach((fsId: number) =>
    promises.push(insertSurveyFundingSource(fsId, surveyId, connection))
  );

  /*
    To update a survey permit, we need to unassociate the old permit of the survey and then
    insert the new survey - permit association

    Note: this is done by either inserting a brand new record into the permit table with a survey id OR
    updating an existing record of the permit table and setting the survey id column value
  */
  promises.push(unassociatePermitFromSurvey(surveyId, connection));
  // TODO 20211108: currently permit insert vs update is dictated by permit_type (needs fixing/updating)
  if (putDetailsData.permit_number) {
    promises.push(
      insertSurveyPermit(putDetailsData.permit_number, putDetailsData.permit_type, projectId, surveyId, connection)
    );
  }

  return Promise.all(promises);
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

    sqlStatement = queries.survey.deleteSurveyProprietorSQL(surveyId, putProprietorData.id);
  } else if (!wasProprietary && isProprietary) {
    // 3. did not have proprietor data; now requires proprietor data
    // insert new record

    sqlStatement = queries.survey.postSurveyProprietorSQL(
      surveyId,
      new PostSurveyProprietorData(entities.survey_proprietor)
    );
  } else {
    // 4. did have proprietor data; updating proprietor data
    // update existing record

    sqlStatement = queries.survey.putSurveyProprietorSQL(surveyId, putProprietorData);
  }

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  const result = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!result || !result.rowCount) {
    throw new HTTP409('Failed to update survey proprietor data');
  }
};

export const unassociatePermitFromSurvey = async (survey_id: number, connection: IDBConnection): Promise<void> => {
  const sqlStatement = queries.survey.unassociatePermitFromSurveySQL(survey_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to update survey permit number data');
  }
};

export const updateSurveyPurposeAndMethodologyData = async (
  surveyId: number,
  entities: IUpdateSurvey,
  connection: IDBConnection
): Promise<void> => {
  const putPurposeAndMethodologyData =
    (entities?.survey_purpose_and_methodology &&
      new PutSurveyPurposeAndMethodologyData(entities.survey_purpose_and_methodology)) ||
    null;

  const revision_count = putPurposeAndMethodologyData?.revision_count ?? null;

  if (!revision_count && revision_count !== 0) {
    throw new HTTP400('Failed to parse request body');
  }

  const updateSurveySQLStatement = queries.survey.putSurveyPurposeAndMethodologySQL(
    surveyId,
    putPurposeAndMethodologyData,
    revision_count
  );

  if (!updateSurveySQLStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const result = await connection.query(updateSurveySQLStatement.text, updateSurveySQLStatement.values);
  if (!result || !result.rowCount) {
    throw new HTTP409('Failed to update stale survey data');
  }

  const promises: Promise<any>[] = [];

  promises.push(deleteSurveyVantageCodes(surveyId, connection));
  //Handle vantage codes associated to this survey

  if (putPurposeAndMethodologyData?.vantage_code_ids) {
    promises.push(
      Promise.all(
        putPurposeAndMethodologyData.vantage_code_ids.map((vantageCode: number) =>
          insertVantageCodes(vantageCode, surveyId, connection)
        )
      )
    );
  }

  await Promise.all(promises);

  await connection.commit();
};

export const deleteSurveyVantageCodes = async (survey_id: number, connection: IDBConnection): Promise<void> => {
  const sqlStatement = queries.survey.deleteSurveyVantageCodesSQL(survey_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build delete survey vantage codes SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP500('Failed to delete survey vantage codes');
  }
};
