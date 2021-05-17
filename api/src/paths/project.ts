import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection, IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { IPostIUCN, IPostPermit, PostFundingSource, PostProjectObject } from '../models/project-create';
import { projectCreatePostRequestObject, projectIdResponseObject } from '../openapi/schemas/project';
import {
  getProjectAttachmentByFileNameSQL,
  postProjectAttachmentSQL,
  putProjectAttachmentSQL
} from '../queries/project/project-attachments-queries';
import {
  postAncillarySpeciesSQL,
  postFocalSpeciesSQL,
  postProjectActivitySQL,
  postProjectFundingSourceSQL,
  postProjectIndigenousNationSQL,
  postProjectIUCNSQL,
  postProjectPermitSQL,
  postProjectRegionSQL,
  postProjectSQL,
  postProjectStakeholderPartnershipSQL
} from '../queries/project/project-create-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/project');

export const POST: Operation = [logRequest('paths/project', 'POST'), createProject()];

POST.apiDoc = {
  description: 'Create a new Project.',
  tags: ['project'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Project post request object.',
    content: {
      'application/json': {
        schema: {
          ...(projectCreatePostRequestObject as object)
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

/**
 * Creates a new project record.
 *
 * @returns {RequestHandler}
 */
function createProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedProjectPostData = new PostProjectObject(req.body);

    try {
      const postProjectSQLStatement = postProjectSQL({
        ...sanitizedProjectPostData.project,
        ...sanitizedProjectPostData.location,
        ...sanitizedProjectPostData.objectives,
        ...sanitizedProjectPostData.coordinator
      });

      if (!postProjectSQLStatement) {
        throw new HTTP400('Failed to build SQL insert statement');
      }

      let projectId: number;

      try {
        await connection.open();

        // Handle project details
        const createProjectResponse = await connection.query(
          postProjectSQLStatement.text,
          postProjectSQLStatement.values
        );

        const projectResult =
          (createProjectResponse && createProjectResponse.rows && createProjectResponse.rows[0]) || null;

        if (!projectResult || !projectResult.id) {
          throw new HTTP400('Failed to insert project general information data');
        }

        projectId = projectResult.id;

        const promises: Promise<any>[] = [];

        // Handle focal species
        promises.push(
          Promise.all(
            sanitizedProjectPostData.species.focal_species.map((focalSpeciesId: number) =>
              insertFocalSpecies(focalSpeciesId, projectId, (null as unknown) as number, connection)
            )
          )
        );

        // Handle ancillary species
        promises.push(
          Promise.all(
            sanitizedProjectPostData.species.ancillary_species.map((ancillarySpeciesId: number) =>
              insertAncillarySpecies(ancillarySpeciesId, projectId, connection)
            )
          )
        );

        // Handle regions
        promises.push(
          Promise.all(
            sanitizedProjectPostData.location.regions.map((region: string) =>
              insertRegion(region, projectId, connection)
            )
          )
        );

        // Handle funding sources
        promises.push(
          Promise.all(
            sanitizedProjectPostData.funding.funding_sources.map((fundingSource: PostFundingSource) =>
              insertFundingSource(fundingSource, projectId, connection)
            )
          )
        );

        // Handle indigenous partners
        promises.push(
          Promise.all(
            sanitizedProjectPostData.partnerships.indigenous_partnerships.map((indigenousNationId: number) =>
              insertIndigenousNation(indigenousNationId, projectId, connection)
            )
          )
        );

        // Handle stakeholder partners
        promises.push(
          Promise.all(
            sanitizedProjectPostData.partnerships.stakeholder_partnerships.map((stakeholderPartner: string) =>
              insertStakeholderPartnership(stakeholderPartner, projectId, connection)
            )
          )
        );

        // Handle project permits
        promises.push(
          Promise.all(
            sanitizedProjectPostData.permit.permits.map((permit: IPostPermit) =>
              insertPermitNumber(
                permit.permit_number,
                permit.permit_type,
                projectId,
                permit.sampling_conducted,
                connection
              )
            )
          )
        );

        // Handle project IUCN classifications
        promises.push(
          Promise.all(
            sanitizedProjectPostData.iucn.classificationDetails.map((classificationDetail: IPostIUCN) =>
              insertClassificationDetail(classificationDetail.subClassification2, projectId, connection)
            )
          )
        );

        // Handle project activities
        promises.push(
          Promise.all(
            sanitizedProjectPostData.project.project_activities.map((activityId: number) =>
              insertProjectActivity(activityId, projectId, connection)
            )
          )
        );

        await Promise.all(promises);

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

export const insertFocalSpecies = async (
  focal_species_id: number,
  project_id: number,
  survey_id: number,
  connection: IDBConnection
): Promise<number> => {
  console.log('#################################')
  console.log(focal_species_id, project_id, survey_id);
  const sqlStatement = postFocalSpeciesSQL(focal_species_id, project_id, survey_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project focal species data');
  }

  return result.id;
};

export const insertAncillarySpecies = async (
  ancillary_species_id: number,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postAncillarySpeciesSQL(ancillary_species_id, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project ancillary species data');
  }

  return result.id;
};

export const insertRegion = async (region: string, project_id: number, connection: IDBConnection): Promise<number> => {
  const sqlStatement = postProjectRegionSQL(region, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project region data');
  }

  return result.id;
};

export const insertFundingSource = async (
  fundingSource: PostFundingSource,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postProjectFundingSourceSQL(fundingSource, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project funding data');
  }

  return result.id;
};

export const insertIndigenousNation = async (
  indigenousNationId: number,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postProjectIndigenousNationSQL(indigenousNationId, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project first nations partnership data');
  }

  return result.id;
};

export const insertStakeholderPartnership = async (
  stakeholderPartner: string,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postProjectStakeholderPartnershipSQL(stakeholderPartner, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project stakeholder partnership data');
  }

  return result.id;
};

export const insertPermitNumber = async (
  permit_number: string,
  permit_type: string,
  project_id: number,
  sampling_conducted: boolean,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postProjectPermitSQL(permit_number, permit_type, project_id, sampling_conducted);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project permit data');
  }

  return result.id;
};

export const insertClassificationDetail = async (
  iucn3_id: number,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postProjectIUCNSQL(iucn3_id, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project IUCN data');
  }

  return result.id;
};

export const insertProjectActivity = async (
  activityId: number,
  projectId: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = postProjectActivitySQL(activityId, projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project activity data');
  }

  return result.id;
};

export const upsertProjectAttachment = async (
  file: Express.Multer.File,
  projectId: number,
  connection: IDBConnection
): Promise<number> => {
  const getSqlStatement = getProjectAttachmentByFileNameSQL(projectId, file.originalname);

  if (!getSqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const getResponse = await connection.query(getSqlStatement.text, getSqlStatement.values);

  if (getResponse && getResponse.rowCount > 0) {
    const updateSqlStatement = putProjectAttachmentSQL(projectId, file.originalname);

    if (!updateSqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const updateResponse = await connection.query(updateSqlStatement.text, updateSqlStatement.values);
    const updateResult = (updateResponse && updateResponse.rowCount) || null;

    if (!updateResult) {
      throw new HTTP400('Failed to update project attachment data');
    }

    return updateResult;
  }

  const insertSqlStatement = postProjectAttachmentSQL(file.originalname, file.size, projectId);

  if (!insertSqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const insertResponse = await connection.query(insertSqlStatement.text, insertSqlStatement.values);
  const insertResult = (insertResponse && insertResponse.rows && insertResponse.rows[0]) || null;

  if (!insertResult || !insertResult.id) {
    throw new HTTP400('Failed to insert project attachment data');
  }

  return insertResult.id;
};
