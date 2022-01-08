import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../database/db';
import { HTTP400, HTTP409 } from '../../../errors/custom-error';
import { IPostExistingPermit, IPostPermit, PostPermitData } from '../../../models/project-create';
import {
  GetCoordinatorData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetPermitData,
  GetProjectData,
  IGetPutIUCN,
  PutCoordinatorData,
  PutFundingSource,
  PutIUCNData,
  PutLocationData,
  PutObjectivesData,
  PutPartnershipsData,
  PutProjectData
} from '../../../models/project-update';
import { GetFundingData } from '../../../models/project-view-update';
import {
  projectIdResponseObject,
  projectUpdateGetResponseObject,
  projectUpdatePutRequestObject
} from '../../../openapi/schemas/project';
import { queries } from '../../../queries/queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';
import {
  associateExistingPermitToProject,
  insertClassificationDetail,
  insertIndigenousNation,
  insertPermit,
  insertProjectActivity,
  insertStakeholderPartnership
} from '../../project';

const defaultLog = getLogger('paths/project/{projectId}');

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
  getProjectForUpdate()
];

export enum GET_ENTITIES {
  coordinator = 'coordinator',
  permit = 'permit',
  project = 'project',
  objectives = 'objectives',
  location = 'location',
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
  iucn: GetIUCNClassificationData | null;
  funding: GetFundingData | null;
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

      if (entities.includes(GET_ENTITIES.permit)) {
        promises.push(
          getPermitData(projectId, connection).then((value) => {
            results.permit = value;
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
      if (entities.includes(GET_ENTITIES.funding)) {
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
      defaultLog.error({ label: 'getProjectForUpdate', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getPermitData = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.project.getPermitsByProjectSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows) || null;

  if (!result) {
    throw new HTTP400('Failed to get project permit data');
  }

  return new GetPermitData(result);
};

export const getLocationData = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.project.getLocationByProjectSQL(projectId);

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
  const sqlStatement = queries.project.getIUCNActionClassificationByProjectSQL(projectId);

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
  const sqlStatement = queries.project.getCoordinatorByProjectSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result) {
    throw new HTTP400('Failed to get project contact data');
  }

  return new GetCoordinatorData(result);
};

export const getPartnershipsData = async (projectId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatementIndigenous = queries.project.getIndigenousPartnershipsByProjectSQL(projectId);
  const sqlStatementStakeholder = queries.project.getStakeholderPartnershipsByProjectSQL(projectId);

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

export const getObjectivesData = async (projectId: number, connection: IDBConnection): Promise<GetObjectivesData> => {
  const sqlStatement = queries.project.getObjectivesByProjectSQL(projectId);

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
  const sqlStatementDetails = queries.project.getProjectByProjectSQL(projectId);
  const sqlStatementActivities = queries.project.getActivitiesByProjectSQL(projectId);

  if (!sqlStatementDetails || !sqlStatementActivities) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const [responseDetails, responseActivities] = await Promise.all([
    connection.query(sqlStatementDetails.text, sqlStatementDetails.values),
    connection.query(sqlStatementActivities.text, sqlStatementActivities.values)
  ]);

  const resultDetails = (responseDetails && responseDetails.rows && responseDetails.rows[0]) || null;
  const resultActivities = (responseActivities && responseActivities.rows && responseActivities.rows) || null;

  if (!resultDetails) {
    throw new HTTP400('Failed to get project details data');
  }

  if (!resultActivities) {
    throw new HTTP400('Failed to get project activities data');
  }

  return new GetProjectData(resultDetails, resultActivities);
};

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
  updateProject()
];

PUT.apiDoc = {
  description: 'Update a project.',
  tags: ['project'],
  security: [
    {
      Bearer: []
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

      if (entities?.permit && entities?.coordinator) {
        promises.push(updateProjectPermitData(projectId, entities, connection));
      }

      if (entities?.iucn) {
        promises.push(updateProjectIUCNData(projectId, entities, connection));
      }

      if (entities?.funding) {
        promises.push(updateProjectFundingData(projectId, entities, connection));
      }

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const updateProjectPermitData = async (
  projectId: number,
  entities: IUpdateProject,
  connection: IDBConnection
): Promise<void> => {
  if (!entities.permit) {
    throw new HTTP400('Missing request body entity `permit`');
  }

  const putPermitData = new PostPermitData(entities.permit);

  const sqlDeleteStatement = queries.project.deletePermitSQL(projectId);

  if (!sqlDeleteStatement) {
    throw new HTTP400('Failed to build SQL delete statement');
  }

  const deleteResult = await connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);

  if (!deleteResult) {
    throw new HTTP409('Failed to delete project permit data');
  }

  const insertPermitPromises =
    putPermitData?.permits?.map((permit: IPostPermit) => {
      return insertPermit(permit.permit_number, permit.permit_type, projectId, connection);
    }) || [];

  // Handle existing non-sampling permits which are now being associated to a project
  const updateExistingPermitPromises =
    putPermitData?.existing_permits?.map((existing_permit: IPostExistingPermit) => {
      return associateExistingPermitToProject(existing_permit.permit_id, projectId, connection);
    }) || [];

  await Promise.all([insertPermitPromises, updateExistingPermitPromises]);
};

export const updateProjectIUCNData = async (
  projectId: number,
  entities: IUpdateProject,
  connection: IDBConnection
): Promise<void> => {
  const putIUCNData = (entities?.iucn && new PutIUCNData(entities.iucn)) || null;

  const sqlDeleteStatement = queries.project.deleteIUCNSQL(projectId);

  if (!sqlDeleteStatement) {
    throw new HTTP400('Failed to build SQL delete statement');
  }

  const deleteResult = await connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);

  if (!deleteResult) {
    throw new HTTP409('Failed to delete project IUCN data');
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

  const sqlDeleteIndigenousPartnershipsStatement = queries.project.deleteIndigenousPartnershipsSQL(projectId);
  const sqlDeleteStakeholderPartnershipsStatement = queries.project.deleteStakeholderPartnershipsSQL(projectId);

  if (!sqlDeleteIndigenousPartnershipsStatement || !sqlDeleteStakeholderPartnershipsStatement) {
    throw new HTTP400('Failed to build SQL delete statement');
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

  const sqlUpdateProject = queries.project.putProjectSQL(
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

  const sqlDeleteActivities = queries.project.deleteActivitiesSQL(projectId);

  if (!sqlDeleteActivities) {
    throw new HTTP400('Failed to build SQL delete statement');
  }

  const deleteActivitiesResult = await connection.query(sqlDeleteActivities.text, sqlDeleteActivities.values);

  if (!deleteActivitiesResult) {
    throw new HTTP409('Failed to update project activity data');
  }

  const insertActivityPromises =
    putProjectData?.project_activities?.map((activityId: number) =>
      insertProjectActivity(activityId, projectId, connection)
    ) || [];

  await Promise.all([...insertActivityPromises]);
};

export const updateProjectFundingData = async (
  projectId: number,
  entities: IUpdateProject,
  connection: IDBConnection
): Promise<void> => {
  const putFundingSource = entities?.funding && new PutFundingSource(entities.funding);

  const projectFundingSourceDeleteStatement = queries.project.deleteProjectFundingSourceSQL(
    projectId,
    putFundingSource?.id
  );

  if (!projectFundingSourceDeleteStatement) {
    throw new HTTP400('Failed to build SQL delete statement');
  }

  const projectFundingSourceDeleteResult = await connection.query(
    projectFundingSourceDeleteStatement.text,
    projectFundingSourceDeleteStatement.values
  );

  if (!projectFundingSourceDeleteResult) {
    throw new HTTP409('Failed to delete project funding source');
  }

  const sqlInsertStatement = queries.project.putProjectFundingSourceSQL(putFundingSource, projectId);

  if (!sqlInsertStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const insertResult = await connection.query(sqlInsertStatement.text, sqlInsertStatement.values);

  if (!insertResult) {
    throw new HTTP409('Failed to put (insert) project funding source with incremented revision count');
  }
};
