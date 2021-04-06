import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../database/db';
import { HTTP400, HTTP409 } from '../../../errors/CustomError';
import {
  GetCoordinatorData,
  GetIUCNClassificationData,
  GetPartnershipsData,
  GetObjectivesData,
  GetProjectData,
  PutCoordinatorData,
  PutPartnershipsData,
  PutLocationData,
  PutObjectivesData,
  PutProjectData,
  PutIUCNData,
  PutSpeciesData,
  IGetPutIUCN,
  GetLocationData
} from '../../../models/project-update';
import { GetSpeciesData } from '../../../models/project-view-update';
import {
  projectIdResponseObject,
  projectUpdateGetResponseObject,
  projectUpdatePutRequestObject
} from '../../../openapi/schemas/project';
import {
  getCoordinatorByProjectSQL,
  getIndigenousPartnershipsByProjectSQL,
  getIUCNActionClassificationByProjectSQL,
  getObjectivesByProjectSQL,
  getProjectByProjectSQL,
  putProjectSQL
} from '../../../queries/project/project-update-queries';
import {
  deleteActivitiesSQL,
  deleteClimateInitiativesSQL,
  deleteIUCNSQL,
  deleteFocalSpeciesSQL,
  deleteAncillarySpeciesSQL,
  deleteIndigenousPartnershipsSQL,
  deleteStakeholderPartnershipsSQL,
  deleteRegionsSQL
} from '../../../queries/project/project-delete-queries';
import {
  getStakeholderPartnershipsByProjectSQL,
  getFocalSpeciesByProjectSQL,
  getAncillarySpeciesByProjectSQL,
  getLocationByProjectSQL,
  getActivitiesByProjectSQL,
  getClimateInitiativesByProjectSQL
} from '../../../queries/project/project-view-update-queries';
import { getLogger } from '../../../utils/logger';
import { logRequest } from '../../../utils/path-utils';
import {
  insertAncillarySpecies,
  insertClassificationDetail,
  insertFocalSpecies,
  insertIndigenousNation,
  insertRegion,
  insertProjectActivity,
  insertProjectClimateChangeInitiative,
  insertStakeholderPartnership
} from '../../project';

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
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export interface IGetProjectForUpdate {
  coordinator: GetCoordinatorData | null;
  permit: any;
  project: any;
  objectives: GetObjectivesData | null;
  location: any;
  species: any;
  iucn: GetIUCNClassificationData | null;
  funding: any;
  partnerships: GetPartnershipsData | null;
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
        throw new HTTP400('Missing required path parameter: projectId');
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

      if (entities.includes(GET_ENTITIES.partnerships)) {
        promises.push(
          getPartnershipsData(projectId, connection).then((value) => {
            results.partnerships = value;
          })
        );
      }

      if (entities.includes(GET_ENTITIES.location)) {
        promises.push(
          getLocationData(projectId, connection).then((value) => {
            results.location = value;
          })
        );
      }

      if (entities.includes(GET_ENTITIES.species)) {
        promises.push(
          getSpeciesData(projectId, connection).then((value) => {
            results.species = value;
          })
        );
      }

      if (entities.includes(GET_ENTITIES.iucn)) {
        promises.push(
          getIUCNClassificationData(projectId, connection).then((value) => {
            results.iucn = value;
          })
        );
      }

      if (entities.includes(GET_ENTITIES.objectives)) {
        promises.push(
          getObjectivesData(projectId, connection).then((value) => {
            results.objectives = value;
          })
        );
      }

      if (entities.includes(GET_ENTITIES.project)) {
        promises.push(
          getProjectData(projectId, connection).then((value) => {
            results.project = value;
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

export const getLocationData = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = getLocationByProjectSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows) || null;

  if (!result) {
    throw new HTTP400('Failed to get project location data');
  }

  return new GetLocationData(result);
};

export const getIUCNClassificationData = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = getIUCNActionClassificationByProjectSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows) || null;

  if (!result) {
    throw new HTTP400('Failed to get project IUCN data');
  }

  return new GetIUCNClassificationData(result);
};

export const getProjectCoordinatorData = async (
  projectId: number,
  connection: IDBConnection
): Promise<GetCoordinatorData> => {
  const sqlStatement = getCoordinatorByProjectSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result) {
    throw new HTTP400('Failed to get project coordinator data');
  }

  return new GetCoordinatorData(result);
};

export const getPartnershipsData = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatementIndigenous = getIndigenousPartnershipsByProjectSQL(projectId);
  const sqlStatementStakeholder = getStakeholderPartnershipsByProjectSQL(projectId);

  if (!sqlStatementIndigenous || !sqlStatementStakeholder) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const responseIndigenous = await connection.query(sqlStatementIndigenous.text, sqlStatementIndigenous.values);
  const responseStakeholder = await connection.query(sqlStatementStakeholder.text, sqlStatementStakeholder.values);

  const resultIndigenous = (responseIndigenous && responseIndigenous.rows) || null;
  const resultStakeholder = (responseStakeholder && responseStakeholder.rows) || null;

  if (!resultIndigenous) {
    throw new HTTP400('Failed to get indigenous partnership data');
  }

  if (!resultStakeholder) {
    throw new HTTP400('Failed to get stakeholder partnership data');
  }

  return new GetPartnershipsData(resultIndigenous, resultStakeholder);
};

export const getSpeciesData = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatementFocalSpecies = getFocalSpeciesByProjectSQL(projectId);
  const sqlStatementAncillarySpecies = getAncillarySpeciesByProjectSQL(projectId);

  if (!sqlStatementFocalSpecies || !sqlStatementAncillarySpecies) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const responseFocalSpecies = await connection.query(sqlStatementFocalSpecies.text, sqlStatementFocalSpecies.values);
  const responseAncillarySpecies = await connection.query(
    sqlStatementAncillarySpecies.text,
    sqlStatementAncillarySpecies.values
  );

  const resultFocalSpecies = (responseFocalSpecies && responseFocalSpecies.rows) || null;
  const resultAncillarySpecies = (responseAncillarySpecies && responseAncillarySpecies.rows) || null;

  if (!resultFocalSpecies) {
    throw new HTTP400('Failed to get focal species data');
  }

  if (!resultAncillarySpecies) {
    throw new HTTP400('Failed to get ancillary species data');
  }

  return new GetSpeciesData(resultFocalSpecies, resultAncillarySpecies);
};

export const getObjectivesData = async (projectId: number, connection: IDBConnection): Promise<GetObjectivesData> => {
  const sqlStatement = getObjectivesByProjectSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result) {
    throw new HTTP400('Failed to get project objectives data');
  }

  return new GetObjectivesData(result);
};

export const getProjectData = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatementDetails = getProjectByProjectSQL(projectId);
  const sqlStatementActivities = getActivitiesByProjectSQL(projectId);
  const sqlStatementClimateInitiatives = getClimateInitiativesByProjectSQL(projectId);

  if (!sqlStatementDetails || !sqlStatementActivities || !sqlStatementClimateInitiatives) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const [responseDetails, responseActivities, responseClimateInitiatives] = await Promise.all([
    connection.query(sqlStatementDetails.text, sqlStatementDetails.values),
    connection.query(sqlStatementActivities.text, sqlStatementActivities.values),
    connection.query(sqlStatementClimateInitiatives.text, sqlStatementClimateInitiatives.values)
  ]);

  const resultDetails = (responseDetails && responseDetails.rows && responseDetails.rows[0]) || null;
  const resultActivities = (responseActivities && responseActivities.rows && responseActivities.rows) || null;
  const resultClimateInitiatives =
    (responseClimateInitiatives && responseClimateInitiatives.rows && responseClimateInitiatives.rows) || null;

  if (!resultDetails) {
    throw new HTTP400('Failed to get project details data');
  }

  if (!resultActivities) {
    throw new HTTP400('Failed to get project activities data');
  }

  if (!resultClimateInitiatives) {
    throw new HTTP400('Failed to get project climate initiatives data');
  }

  return new GetProjectData(resultDetails, resultActivities, resultClimateInitiatives);
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
        throw new HTTP400('Missing required path parameter: projectId');
      }

      if (!entities) {
        throw new HTTP400('Missing required request body');
      }

      await connection.open();

      const promises: Promise<any>[] = [];

      if (entities?.partnerships) {
        promises.push(updateProjectPartnershipsData(projectId, entities, connection));
      }

      if (entities?.project || entities?.location || entities?.objectives || entities?.coordinator) {
        promises.push(updateProjectData(projectId, entities, connection));
      }

      if (entities?.location) {
        promises.push(updateProjectRegionsData(projectId, entities, connection));
      }

      if (entities?.iucn) {
        promises.push(updateProjectIUCNData(projectId, entities, connection));
      }

      if (entities?.species) {
        promises.push(updateProjectSpeciesData(projectId, entities, connection));
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

export const updateProjectRegionsData = async (
  projectId: number,
  entities: IUpdateProject,
  connection: IDBConnection
): Promise<void> => {
  const putLocationData = (entities?.location && new PutLocationData(entities.location)) || null;

  const sqlDeleteRegionsStatement = deleteRegionsSQL(projectId);

  if (!sqlDeleteRegionsStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  const deleteRegionsResult = await connection.query(sqlDeleteRegionsStatement.text, sqlDeleteRegionsStatement.values);

  if (!deleteRegionsResult) {
    throw new HTTP409('Failed to delete project regions data');
  }

  const insertRegionsPromises =
    putLocationData?.regions?.map((region: string) => insertRegion(region, projectId, connection)) || [];

  await Promise.all(insertRegionsPromises);
};

export const updateProjectSpeciesData = async (
  projectId: number,
  entities: IUpdateProject,
  connection: IDBConnection
): Promise<void> => {
  const putSpeciesData = (entities?.species && new PutSpeciesData(entities.species)) || null;

  const sqlDeleteFocalSpeciesStatement = deleteFocalSpeciesSQL(projectId);
  const sqlDeleteAncillarySpeciesStatement = deleteAncillarySpeciesSQL(projectId);

  if (!sqlDeleteFocalSpeciesStatement || !sqlDeleteAncillarySpeciesStatement) {
    throw new HTTP400('Failed to build SQL update statement');
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
    throw new HTTP409('Failed to delete project focal species data');
  }

  if (!deleteAncillarySpeciesResult) {
    throw new HTTP409('Failed to delete project ancillary species data');
  }

  const insertFocalSpeciesPromises =
    putSpeciesData?.focal_species?.map((focalSpecies: string) =>
      insertFocalSpecies(focalSpecies, projectId, connection)
    ) || [];

  const insertAncillarySpeciesPromises =
    putSpeciesData?.ancillary_species?.map((ancillarySpecies: string) =>
      insertAncillarySpecies(ancillarySpecies, projectId, connection)
    ) || [];

  await Promise.all([...insertFocalSpeciesPromises, ...insertAncillarySpeciesPromises]);
};

export const updateProjectIUCNData = async (
  projectId: number,
  entities: IUpdateProject,
  connection: IDBConnection
): Promise<void> => {
  const putIUCNData = (entities?.iucn && new PutIUCNData(entities.iucn)) || null;

  const sqlDeleteStatement = deleteIUCNSQL(projectId);

  if (!sqlDeleteStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const deleteResult = await connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);

  if (!deleteResult) {
    throw new HTTP409('Failed to update project IUCN data');
  }

  const insertIUCNPromises =
    putIUCNData?.classificationDetails?.map((iucnClassification: IGetPutIUCN) =>
      insertClassificationDetail(iucnClassification.subClassification2, projectId, connection)
    ) || [];

  await Promise.all(insertIUCNPromises);
};

export const updateProjectPartnershipsData = async (
  projectId: number,
  entities: IUpdateProject,
  connection: IDBConnection
): Promise<void> => {
  const putPartnershipsData = (entities?.partnerships && new PutPartnershipsData(entities.partnerships)) || null;

  const sqlDeleteIndigenousPartnershipsStatement = deleteIndigenousPartnershipsSQL(projectId);
  const sqlDeleteStakeholderPartnershipsStatement = deleteStakeholderPartnershipsSQL(projectId);

  if (!sqlDeleteIndigenousPartnershipsStatement || !sqlDeleteStakeholderPartnershipsStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const deleteIndigenousPartnershipsPromises = connection.query(
    sqlDeleteIndigenousPartnershipsStatement.text,
    sqlDeleteIndigenousPartnershipsStatement.values
  );

  const deleteStakeholderPartnershipsPromises = connection.query(
    sqlDeleteStakeholderPartnershipsStatement.text,
    sqlDeleteStakeholderPartnershipsStatement.values
  );

  const [deleteIndigenousPartnershipsResult, deleteStakeholderPartnershipsResult] = await Promise.all([
    deleteIndigenousPartnershipsPromises,
    deleteStakeholderPartnershipsPromises
  ]);

  if (!deleteIndigenousPartnershipsResult) {
    throw new HTTP409('Failed to delete project indigenous partnerships data');
  }

  if (!deleteStakeholderPartnershipsResult) {
    throw new HTTP409('Failed to delete project stakeholder partnerships data');
  }

  const insertIndigenousPartnershipsPromises =
    putPartnershipsData?.indigenous_partnerships?.map((indigenousPartnership: number) =>
      insertIndigenousNation(indigenousPartnership, projectId, connection)
    ) || [];

  const insertStakeholderPartnershipsPromises =
    putPartnershipsData?.stakeholder_partnerships?.map((stakeholderPartnership: string) =>
      insertStakeholderPartnership(stakeholderPartnership, projectId, connection)
    ) || [];

  await Promise.all([...insertIndigenousPartnershipsPromises, ...insertStakeholderPartnershipsPromises]);
};

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
    putProjectData?.revision_count ??
    putLocationData?.revision_count ??
    putObjectivesData?.revision_count ??
    putCoordinatorData?.revision_count ??
    null;

  if (!revision_count && revision_count !== 0) {
    throw new HTTP400('Failed to parse request body');
  }

  const sqlUpdateProject = putProjectSQL(
    projectId,
    putProjectData,
    putLocationData,
    putObjectivesData,
    putCoordinatorData,
    revision_count
  );

  if (!sqlUpdateProject) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const result = await connection.query(sqlUpdateProject.text, sqlUpdateProject.values);

  if (!result || !result.rowCount) {
    // TODO if revision count is bad, it is supposed to raise an exception?
    // It currently does skip the update as expected, but it just returns 0 rows updated, and doesn't result in any errors
    throw new HTTP409('Failed to update stale project data');
  }

  const sqlDeleteActivities = deleteActivitiesSQL(projectId);
  const sqlDeleteClimateInitiatives = deleteClimateInitiativesSQL(projectId);

  if (!sqlDeleteActivities || !sqlDeleteClimateInitiatives) {
    throw new HTTP400('Failed to build SQL delete statement');
  }

  const deleteActivitiesPromises = connection.query(sqlDeleteActivities.text, sqlDeleteActivities.values);
  const deleteClimateInitiativesPromises = connection.query(
    sqlDeleteClimateInitiatives.text,
    sqlDeleteClimateInitiatives.values
  );

  const [deleteActivitiesResult, deleteClimateInitiativesResult] = await Promise.all([
    deleteActivitiesPromises,
    deleteClimateInitiativesPromises
  ]);

  if (!deleteActivitiesResult) {
    throw new HTTP409('Failed to update project activity data');
  }

  if (!deleteClimateInitiativesResult) {
    throw new HTTP409('Failed to update project activity data');
  }

  const insertActivityPromises =
    putProjectData?.project_activities?.map((activityId: number) =>
      insertProjectActivity(activityId, projectId, connection)
    ) || [];

  const insertClimateInitiativesPromises =
    putProjectData?.climate_change_initiatives?.map((climateChangeInitiativeId: number) =>
      insertProjectClimateChangeInitiative(climateChangeInitiativeId, projectId, connection)
    ) || [];

  await Promise.all([...insertActivityPromises, ...insertClimateInitiativesPromises]);
};
