import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../database/db';
import { CustomError } from '../../../errors/CustomError';
import { PutCoordinatorData, PutLocationData, PutObjectivesData, PutProjectData } from '../../../models/project-update';
import {
  projectIdResponseObject,
  projectUpdateGetResponseObject,
  projectUpdatePutRequestObject
} from '../../../openapi/schemas/project';
import { getCoordinatorByProjectSQL, putProjectSQL } from '../../../queries/project/project-update-queries';
import { getLogger } from '../../../utils/logger';
import { logRequest } from '../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}');

export const GET: Operation = [logRequest('paths/project/{projectId}/update', 'GET'), getProjectForUpdate()];

export enum GET_ENTITIES {
  coordinator = 'coordinator',
  permit = 'permit',
  project = 'project',
  objectives = 'objectives',
  location = 'location',
  species = 'species',
  iucn = 'iucn',
  funding = 'funding',
  partnerships = 'partnerships'
}

export const getAllEntities = (): string[] => Object.values(GET_ENTITIES);

GET.apiDoc = {
  description: 'Get a project, for update purposes.',
  tags: ['project'],
  security: [
    {
      Bearer: WRITE_ROLES
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
      in: 'query',
      name: 'entity',
      schema: {
        type: 'array',
        items: {
          type: 'string',
          enum: getAllEntities()
        }
      }
    }
  ],
  responses: {
    200: {
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            // TODO this is currently empty, and needs updating
            ...(projectUpdateGetResponseObject as object)
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
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export interface IGetProjectForUpdate {
  coordinator: any;
  permit: any;
  project: any;
  objectives: any;
  location: any;
  species: any;
  iucn: any;
  funding: any;
  partnerships: any;
}

/**
 * Get a project, for update purposes.
 *
 * @returns {RequestHandler}
 */
function getProjectForUpdate(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params?.projectId);

      const entities: string[] = (req.query?.entity as string[]) || getAllEntities();

      if (!projectId) {
        throw new CustomError(400, 'Missing required path parameter: projectId');
      }

      await connection.open();

      const results: IGetProjectForUpdate = {
        coordinator: null,
        permit: null,
        project: null,
        objectives: null,
        location: null,
        species: null,
        iucn: null,
        funding: null,
        partnerships: null
      };

      const promises: Promise<any>[] = [];

      if (entities.includes(GET_ENTITIES.coordinator)) {
        promises.push(
          getProjectCoordinatorData(projectId, connection).then((value) => {
            results.coordinator = value;
          })
        );
      }

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send(results);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectForUpdate', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getProjectCoordinatorData = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = getCoordinatorByProjectSQL(projectId);

  if (!sqlStatement) {
    throw new CustomError(400, 'Failed to build SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result) {
    throw new CustomError(400, 'Failed to insert into project table');
  }

  return result;
};

export const PUT: Operation = [logRequest('paths/project/{projectId}/update', 'PUT'), updateProject()];

PUT.apiDoc = {
  description: 'Update a project.',
  tags: ['project'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Project put request object.',
    content: {
      'application/json': {
        schema: {
          // TODO this is currently empty, and needs updating
          ...(projectUpdatePutRequestObject as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            // TODO is there any return value? or is it just an HTTP status with no content?
            ...(projectIdResponseObject as object)
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
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export interface IUpdateProject {
  coordinator: object | null;
  permit: object | null;
  project: object | null;
  objectives: object | null;
  location: object | null;
  species: object | null;
  iucn: object | null;
  funding: object | null;
  partnerships: object | null;
}

/**
 * Update a project.
 *
 * @returns {RequestHandler}
 */
function updateProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params?.projectId);

      const entities: IUpdateProject = req.body;

      if (!projectId) {
        throw new CustomError(400, 'Missing required path parameter: projectId');
      }

      if (!entities) {
        throw new CustomError(400, 'Missing required request body');
      }

      await connection.open();

      const promises: Promise<any>[] = [];

      if (entities?.project || entities?.location || entities?.objectives || entities?.coordinator) {
        promises.push(updateProjectData(projectId, entities, connection));
      }

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'updateProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const updateProjectData = async (
  projectId: number,
  entities: IUpdateProject,
  connection: IDBConnection
): Promise<void> => {
  const putProjectData = (entities?.project && new PutProjectData(entities.project)) || null;
  const putLocationData = (entities?.location && new PutLocationData(entities.location)) || null;
  const putObjectivesData = (entities?.objectives && new PutObjectivesData(entities.objectives)) || null;
  const putCoordinatorData = (entities?.coordinator && new PutCoordinatorData(entities.coordinator)) || null;

  // Update project table
  const revision_count =
    putProjectData?.revision_count ||
    putLocationData?.revision_count ||
    putObjectivesData?.revision_count ||
    putCoordinatorData?.revision_count ||
    0;

  if (!revision_count && revision_count !== 0) {
    throw new CustomError(400, 'Failed to parse request body');
  }

  const sqlStatement = putProjectSQL(
    projectId,
    putProjectData,
    putLocationData,
    putObjectivesData,
    putCoordinatorData,
    revision_count
  );

  if (!sqlStatement) {
    throw new CustomError(400, 'Failed to build SQL statement');
  }

  const result = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!result || !result.rowCount) {
    // TODO if revision count is bad, it is supposed to raise an exception?
    // It currently does skip the update as expected, but it just returns 0 rows updated, and doesn't result in any errors
    throw new CustomError(409, 'Failed to update stale project data');
  }
};
