import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { PostProjectRegionObject, PostProjectObject, PostSpeciesObject } from '../models/project';
import { projectPostBody, projectResponseBody } from '../openapi/schemas/project';
import { postAncillarySpeciesSQL, postFocalSpeciesSQL, postProjectSQL, postProjectRegionSQL } from '../queries/project-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/project');

export const POST: Operation = [logRequest('paths/project', 'POST'), createProject()];

POST.apiDoc = {
  description: 'Create a new Project.',
  tags: ['project'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Project post request object.',
    content: {
      'application/json': {
        schema: {
          ...(projectPostBody as object)
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
            ...(projectResponseBody as object)
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

/**
 * Creates a new project record.
 *
 * @returns {RequestHandler}
 */
function createProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedProjectData = new PostProjectObject(req.body);

    try {
      const postProjectSQLStatement = postProjectSQL(sanitizedProjectData);

      if (!postProjectSQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      let projectId: number;

      try {
        await connection.open();

        // Insert into project table
        const createProjectResponse = await connection.query(
          postProjectSQLStatement.text,
          postProjectSQLStatement.values
        );

        const projectResult =
          (createProjectResponse && createProjectResponse.rows && createProjectResponse.rows[0]) || null;

        if (!projectResult || !projectResult.id) {
          throw {
            status: 400,
            message: 'Failed to insert into project table'
          };
        }

        projectId = projectResult.id;

        // Handle focal species
        await Promise.all(
          req.body.species.focal_species.map(async (focalSpecies: string) => {
            const sanitizedFocalSpeciesData = new PostSpeciesObject({ name: focalSpecies });

            const postFocalSpeciesSQLStatement = postFocalSpeciesSQL(sanitizedFocalSpeciesData, projectId);

            if (!postFocalSpeciesSQLStatement) {
              throw {
                status: 400,
                message: 'Failed to build SQL statement'
              };
            }

            // Insert into focal_species table
            const createFocalSpeciesResponse = await connection.query(
              postFocalSpeciesSQLStatement.text,
              postFocalSpeciesSQLStatement.values
            );

            const focalSpeciesResult =
              (createFocalSpeciesResponse && createFocalSpeciesResponse.rows && createFocalSpeciesResponse.rows[0]) ||
              null;

            if (!focalSpeciesResult || !focalSpeciesResult.id) {
              throw {
                status: 400,
                message: 'Failed to insert into focal_species table'
              };
            }
          })
        );

        // Handle ancillary species
        await Promise.all(
          req.body.species.ancillary_species.map(async (ancillarySpecies: string) => {
            const sanitizedAncillarySpeciesData = new PostSpeciesObject({ name: ancillarySpecies });

            const postAncillarySpeciesSQLStatement = postAncillarySpeciesSQL(sanitizedAncillarySpeciesData, projectId);

            if (!postAncillarySpeciesSQLStatement) {
              throw {
                status: 400,
                message: 'Failed to build SQL statement'
              };
            }

            // Insert into ancillary_species table
            const createAncillarySpeciesResponse = await connection.query(
              postAncillarySpeciesSQLStatement.text,
              postAncillarySpeciesSQLStatement.values
            );

            const ancillarySpeciesResult =
              (createAncillarySpeciesResponse &&
                createAncillarySpeciesResponse.rows &&
                createAncillarySpeciesResponse.rows[0]) ||
              null;

            if (!ancillarySpeciesResult || !ancillarySpeciesResult.id) {
              throw {
                status: 400,
                message: 'Failed to insert into ancillary_species table'
              };
            }
          })
        );

        // Handle project regions
        await Promise.all(
          req.body.location.regions.map(async (region: string) => {
            const sanitizedProjectRegionData = new PostProjectRegionObject({ name: region });
            const postProjectRegionSQLStatement = postProjectRegionSQL(sanitizedProjectRegionData, projectId);

            if (!postProjectRegionSQLStatement) {
              throw {
                status: 400,
                message: 'Failed to build SQL statement'
              };
            }

            // Insert into project_region table
            const createProjectRegionResponse = await connection.query(
              postProjectRegionSQLStatement.text,
              postProjectRegionSQLStatement.values
            );

            const projectRegionResult =
              (createProjectRegionResponse && createProjectRegionResponse.rows && createProjectRegionResponse.rows[0]) ||
              null;

            if (!projectRegionResult || !projectRegionResult.id) {
              throw {
                status: 400,
                message: 'Failed to insert into project_region table'
              };
            }
          })
        );

        // TODO insert funding

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }

      return res.status(200).json({ id: projectId });
    } catch (error) {
      defaultLog.debug({ label: 'createProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
