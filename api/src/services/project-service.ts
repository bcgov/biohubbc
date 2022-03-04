import moment from 'moment';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../constants/roles';
import { COMPLETION_STATUS } from '../constants/status';
import { HTTP400, HTTP409, HTTP500 } from '../errors/custom-error';
import {
  IPostExistingPermit,
  IPostIUCN,
  IPostPermit,
  PostFundingSource,
  PostPermitData,
  PostProjectObject
} from '../models/project-create';
import {
  IPutIUCN,
  PutCoordinatorData,
  PutFundingSource,
  PutIUCNData,
  PutLocationData,
  PutObjectivesData,
  PutPartnershipsData,
  PutProjectData
} from '../models/project-update';
import {
  GetIUCNClassificationData,
  GetPermitData,
  GetProjectData,
  GetCoordinatorData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetFundingData,
  IGetProject
} from '../models/project-view';
import { GetPublicCoordinatorData, GetPublicProjectData } from '../models/public/project';
import { getSurveyAttachmentS3Keys } from '../paths/project/{projectId}/survey/{surveyId}/delete';
import { GET_ENTITIES, IUpdateProject } from '../paths/project/{projectId}/update';
import { queries } from '../queries/queries';
import { userHasValidRole } from '../request-handlers/security/authorization';
import { deleteFileFromS3 } from '../utils/file-utils';
import { DBService } from './service';

export class ProjectService extends DBService {
  /**
   * Gets the project participant, adding them if they do not already exist.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {Promise<any>}
   * @memberof ProjectService
   */
  async ensureProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    const projectParticipantRecord = await this.getProjectParticipant(projectId, systemUserId);

    if (projectParticipantRecord) {
      // project participant already exists, do nothing
      return;
    }

    // add new project participant record
    await this.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
  }

  /**
   * Get an existing project participant.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {Promise<any>}
   * @memberof ProjectService
   */
  async getProjectParticipant(projectId: number, systemUserId: number): Promise<any> {
    const sqlStatement = queries.projectParticipation.getProjectParticipationBySystemUserSQL(projectId, systemUserId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to get project team members');
    }

    return response?.rows?.[0] || null;
  }

  /**
   * Get all project participants for a project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<object[]>}
   * @memberof ProjectService
   */
  async getProjectParticipants(projectId: number): Promise<object[]> {
    const sqlStatement = queries.projectParticipation.getAllProjectParticipantsSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project team members');
    }

    return (response && response.rows) || [];
  }

  /**
   * Adds a new project participant.
   *
   * Note: Will fail if the project participant already exists.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {number} projectParticipantRoleId
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async addProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    const sqlStatement = queries.projectParticipation.addProjectRoleByRoleIdSQL(
      projectId,
      systemUserId,
      projectParticipantRoleId
    );

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert project team member');
    }
  }

  async getPublicProjectsList(): Promise<any> {
    const getProjectListSQLStatement = queries.public.getPublicProjectListSQL();

    if (!getProjectListSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(getProjectListSQLStatement.text, getProjectListSQLStatement.values);

    if (!response || !response.rows || !response.rows.length) {
      return [];
    }

    return response.rows.map((row) => ({
      id: row.id,
      name: row.name,
      start_date: row.start_date,
      end_date: row.end_date,
      coordinator_agency: row.coordinator_agency_name,
      completion_status:
        (row.end_date && moment(row.end_date).endOf('day').isBefore(moment()) && COMPLETION_STATUS.COMPLETED) ||
        COMPLETION_STATUS.ACTIVE,
      project_type: row.project_type,
      permits_list: row.permits_list
    }));
  }

  async getPublicProjectById(projectId: number): Promise<any> {
    const getProjectSQLStatement = queries.public.getPublicProjectSQL(projectId);
    const getProjectActivitiesSQLStatement = queries.public.getActivitiesByPublicProjectSQL(projectId);

    if (!getProjectSQLStatement || !getProjectActivitiesSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const [
      projectData,
      activityData,
      permitData,
      locationData,
      partnershipsData,
      IUCNClassificationData,
      fundingData
    ] = await Promise.all([
      await this.connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values),
      await this.connection.query(getProjectActivitiesSQLStatement.text, getProjectActivitiesSQLStatement.values),
      await this.getPermitData(projectId),
      await this.getLocationData(projectId),
      await this.getPartnershipsData(projectId),
      await this.getIUCNClassificationData(projectId),
      await this.getFundingData(projectId)
    ]);

    const getProjectData =
      (projectData &&
        projectData.rows &&
        activityData &&
        activityData.rows &&
        new GetPublicProjectData(projectData.rows[0], activityData.rows)) ||
      null;

    const getObjectivesData = (projectData && projectData.rows && new GetObjectivesData(projectData.rows[0])) || null;

    const getCoordinatorData =
      (projectData && projectData.rows && new GetPublicCoordinatorData(projectData.rows[0])) || null;

    return {
      id: projectId,
      project: getProjectData,
      objectives: getObjectivesData,
      coordinator: getCoordinatorData,
      permit: permitData,
      location: locationData,
      partnerships: partnershipsData,
      iucn: IUCNClassificationData,
      funding: fundingData
    };
  }

  async getProjectList(isUserAdmin: boolean, systemUserId: number | null, filterFields: any): Promise<any> {
    const sqlStatement = queries.project.getProjectListSQL(isUserAdmin, systemUserId, filterFields);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row) => ({
      id: row.id,
      name: row.name,
      start_date: row.start_date,
      end_date: row.end_date,
      coordinator_agency: row.coordinator_agency_name,
      publish_status: row.publish_timestamp ? 'Published' : 'Unpublished',
      completion_status:
        (row.end_date && moment(row.end_date).endOf('day').isBefore(moment()) && COMPLETION_STATUS.COMPLETED) ||
        COMPLETION_STATUS.ACTIVE,
      project_type: row.project_type,
      permits_list: row.permits_list
    }));
  }

  async getProjectById(projectId: number): Promise<IGetProject> {
    const [
      projectData,
      objectiveData,
      coordinatorData,
      permitData,
      locationData,
      iucnData,
      fundingData,
      partnershipsData
    ] = await Promise.all([
      this.getProjectData(projectId),
      this.getObjectivesData(projectId),
      this.getCoordinatorData(projectId),
      this.getPermitData(projectId),
      this.getLocationData(projectId),
      this.getIUCNClassificationData(projectId),
      this.getFundingData(projectId),
      this.getPartnershipsData(projectId)
    ]);

    return {
      id: projectId,
      project: projectData,
      objectives: objectiveData,
      coordinator: coordinatorData,
      permit: permitData,
      location: locationData,
      iucn: iucnData,
      funding: fundingData,
      partnerships: partnershipsData
    };
  }

  async getProjectEntitiesById(projectId: number, entities: string[]): Promise<IGetProject> {
    const results: IGetProject = {
      id: projectId,
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
        this.getCoordinatorData(projectId).then((value) => {
          results.coordinator = value;
        })
      );
    }

    if (entities.includes(GET_ENTITIES.permit)) {
      promises.push(
        this.getPermitData(projectId).then((value) => {
          results.permit = value;
        })
      );
    }

    if (entities.includes(GET_ENTITIES.partnerships)) {
      promises.push(
        this.getPartnershipsData(projectId).then((value) => {
          results.partnerships = value;
        })
      );
    }

    if (entities.includes(GET_ENTITIES.location)) {
      promises.push(
        this.getLocationData(projectId).then((value) => {
          results.location = value;
        })
      );
    }

    if (entities.includes(GET_ENTITIES.iucn)) {
      promises.push(
        this.getIUCNClassificationData(projectId).then((value) => {
          results.iucn = value;
        })
      );
    }

    if (entities.includes(GET_ENTITIES.objectives)) {
      promises.push(
        this.getObjectivesData(projectId).then((value) => {
          results.objectives = value;
        })
      );
    }

    if (entities.includes(GET_ENTITIES.project)) {
      promises.push(
        this.getProjectData(projectId).then((value) => {
          results.project = value;
        })
      );
    }
    if (entities.includes(GET_ENTITIES.funding)) {
      promises.push(
        this.getProjectData(projectId).then((value) => {
          results.project = value;
        })
      );
    }

    await Promise.all(promises);

    return results;
  }

  async getProjectData(projectId: number): Promise<GetProjectData> {
    const getProjectSqlStatement = queries.project.getProjectSQL(projectId);
    const getProjectActivitiesSQLStatement = queries.project.getActivitiesByProjectSQL(projectId);

    if (!getProjectSqlStatement || !getProjectActivitiesSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const [project, activity] = await Promise.all([
      this.connection.query(getProjectSqlStatement.text, getProjectSqlStatement.values),
      this.connection.query(getProjectActivitiesSQLStatement.text, getProjectActivitiesSQLStatement.values)
    ]);

    const projectResult = (project && project.rows && project.rows[0]) || null;
    const activityResult = (activity && activity.rows) || null;

    if (!projectResult || !activityResult) {
      throw new HTTP400('Failed to get project data');
    }

    return new GetProjectData(projectResult, activityResult);
  }

  async getObjectivesData(projectId: number): Promise<GetObjectivesData> {
    const sqlStatement = queries.project.getObjectivesByProjectSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new HTTP400('Failed to get project objectives data');
    }

    return new GetObjectivesData(result);
  }

  async getCoordinatorData(projectId: number): Promise<GetCoordinatorData> {
    const sqlStatement = queries.project.getCoordinatorByProjectSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new HTTP400('Failed to get project contact data');
    }

    return new GetCoordinatorData(result);
  }

  async getPermitData(projectId: number): Promise<GetPermitData> {
    const sqlStatement = queries.project.getProjectPermitsSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project permit data');
    }

    return new GetPermitData(result);
  }

  async getLocationData(projectId: number): Promise<GetLocationData> {
    const sqlStatement = queries.project.getLocationByProjectSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project data');
    }

    return new GetLocationData(result);
  }

  async getIUCNClassificationData(projectId: number): Promise<GetIUCNClassificationData> {
    const sqlStatement = queries.project.getIUCNActionClassificationByProjectSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project data');
    }

    return new GetIUCNClassificationData(result);
  }

  async getFundingData(projectId: number): Promise<GetFundingData> {
    const sqlStatement = queries.project.getFundingSourceByProjectSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project data');
    }

    return new GetFundingData(result);
  }

  async getPartnershipsData(projectId: number): Promise<GetPartnershipsData> {
    const [indigenousPartnershipsRows, stakegholderPartnershipsRows] = await Promise.all([
      this.getIndigenousPartnershipsRows(projectId),
      this.getStakeholderPartnershipsRows(projectId)
    ]);

    if (!indigenousPartnershipsRows) {
      throw new HTTP400('Failed to get indigenous partnership data');
    }

    if (!stakegholderPartnershipsRows) {
      throw new HTTP400('Failed to get stakeholder partnership data');
    }

    return new GetPartnershipsData(indigenousPartnershipsRows, stakegholderPartnershipsRows);
  }

  async getIndigenousPartnershipsRows(projectId: number): Promise<any[]> {
    const sqlStatement = queries.project.getIndigenousPartnershipsByProjectSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows) || null;
  }

  async getStakeholderPartnershipsRows(projectId: number): Promise<any[]> {
    const sqlStatement = queries.project.getStakeholderPartnershipsByProjectSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows) || null;
  }

  async createProject(postProjectData: PostProjectObject): Promise<number> {
    const projectId = await this.insertProject(postProjectData);

    const promises: Promise<any>[] = [];

    // Handle funding sources
    promises.push(
      Promise.all(
        postProjectData.funding.funding_sources.map((fundingSource: PostFundingSource) =>
          this.insertFundingSource(fundingSource, projectId)
        )
      )
    );

    // Handle indigenous partners
    promises.push(
      Promise.all(
        postProjectData.partnerships.indigenous_partnerships.map((indigenousNationId: number) =>
          this.insertIndigenousNation(indigenousNationId, projectId)
        )
      )
    );

    // Handle stakeholder partners
    promises.push(
      Promise.all(
        postProjectData.partnerships.stakeholder_partnerships.map((stakeholderPartner: string) =>
          this.insertStakeholderPartnership(stakeholderPartner, projectId)
        )
      )
    );

    // Handle new project permits
    promises.push(
      Promise.all(
        postProjectData.permit.permits.map((permit: IPostPermit) =>
          this.insertPermit(permit.permit_number, permit.permit_type, projectId)
        )
      )
    );

    // Handle existing non-sampling permits which are now being associated to a project
    promises.push(
      Promise.all(
        postProjectData.permit.existing_permits.map((existing_permit: IPostExistingPermit) =>
          this.associateExistingPermitToProject(existing_permit.permit_id, projectId)
        )
      )
    );

    // Handle project IUCN classifications
    promises.push(
      Promise.all(
        postProjectData.iucn.classificationDetails.map((classificationDetail: IPostIUCN) =>
          this.insertClassificationDetail(classificationDetail.subClassification2, projectId)
        )
      )
    );

    // Handle project activities
    promises.push(
      Promise.all(
        postProjectData.project.project_activities.map((activityId: number) =>
          this.insertActivity(activityId, projectId)
        )
      )
    );

    await Promise.all(promises);

    // The user that creates a project is automatically assigned a project lead role, for this project
    await this.insertParticipantRole(projectId, PROJECT_ROLE.PROJECT_LEAD);

    return projectId;
  }

  async insertProject(postProjectData: PostProjectObject): Promise<number> {
    const sqlStatement = queries.project.postProjectSQL({
      ...postProjectData.project,
      ...postProjectData.location,
      ...postProjectData.objectives,
      ...postProjectData.coordinator
    });

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project boundary data');
    }

    return result.id;
  }

  async insertFundingSource(fundingSource: PostFundingSource, project_id: number): Promise<number> {
    const sqlStatement = queries.project.postProjectFundingSourceSQL(fundingSource, project_id);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project funding data');
    }

    return result.id;
  }

  async insertIndigenousNation(indigenousNationsId: number, project_id: number): Promise<number> {
    const sqlStatement = queries.project.postProjectIndigenousNationSQL(indigenousNationsId, project_id);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project first nations partnership data');
    }

    return result.id;
  }

  async insertStakeholderPartnership(stakeholderPartner: string, project_id: number): Promise<number> {
    const sqlStatement = queries.project.postProjectStakeholderPartnershipSQL(stakeholderPartner, project_id);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project stakeholder partnership data');
    }

    return result.id;
  }

  async insertPermit(permitNumber: string, permitType: string, projectId: number): Promise<number> {
    const systemUserId = this.connection.systemUserId();

    if (!systemUserId) {
      throw new HTTP400('Failed to identify system user ID');
    }

    const sqlStatement = queries.permit.postProjectPermitSQL(permitNumber, permitType, projectId, systemUserId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project permit data');
    }

    return result.id;
  }

  async associateExistingPermitToProject(permitId: number, projectId: number): Promise<void> {
    const sqlStatement = queries.permit.associatePermitToProjectSQL(permitId, projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement for associatePermitToProjectSQL');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rowCount) || null;

    if (!result) {
      throw new HTTP400('Failed to associate existing permit to project');
    }
  }

  async insertClassificationDetail(iucn3_id: number, project_id: number): Promise<number> {
    const sqlStatement = queries.project.postProjectIUCNSQL(iucn3_id, project_id);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project IUCN data');
    }

    return result.id;
  }

  async insertActivity(activityId: number, projectId: number): Promise<number> {
    const sqlStatement = queries.project.postProjectActivitySQL(activityId, projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new HTTP400('Failed to insert project activity data');
    }

    return result.id;
  }

  async insertParticipantRole(projectId: number, projectParticipantRole: string): Promise<void> {
    const systemUserId = this.connection.systemUserId();

    if (!systemUserId) {
      throw new HTTP400('Failed to identify system user ID');
    }

    const sqlStatement = queries.projectParticipation.addProjectRoleByRoleNameSQL(
      projectId,
      systemUserId,
      projectParticipantRole
    );

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert project team member');
    }
  }

  async updateProject(projectId: number, entities: IUpdateProject) {
    const promises: Promise<any>[] = [];

    if (entities?.partnerships) {
      promises.push(this.updatePartnershipsData(projectId, entities));
    }

    if (entities?.project || entities?.location || entities?.objectives || entities?.coordinator) {
      promises.push(this.updateProjectData(projectId, entities));
    }

    if (entities?.permit && entities?.coordinator) {
      promises.push(this.updatePermitData(projectId, entities));
    }

    if (entities?.iucn) {
      promises.push(this.updateIUCNData(projectId, entities));
    }

    if (entities?.funding) {
      promises.push(this.updateFundingData(projectId, entities));
    }

    await Promise.all(promises);
  }

  async updatePermitData(projectId: number, entities: IUpdateProject): Promise<void> {
    if (!entities.permit) {
      throw new HTTP400('Missing request body entity `permit`');
    }

    const putPermitData = new PostPermitData(entities.permit);

    const sqlDeleteStatement = queries.project.deletePermitSQL(projectId);

    if (!sqlDeleteStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const deleteResult = await this.connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);

    if (!deleteResult) {
      throw new HTTP409('Failed to delete project permit data');
    }

    const insertPermitPromises =
      putPermitData?.permits?.map((permit: IPostPermit) => {
        return this.insertPermit(permit.permit_number, permit.permit_type, projectId);
      }) || [];

    // Handle existing non-sampling permits which are now being associated to a project
    const updateExistingPermitPromises =
      putPermitData?.existing_permits?.map((existing_permit: IPostExistingPermit) => {
        return this.associateExistingPermitToProject(existing_permit.permit_id, projectId);
      }) || [];

    await Promise.all([insertPermitPromises, updateExistingPermitPromises]);
  }

  async updateIUCNData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putIUCNData = (entities?.iucn && new PutIUCNData(entities.iucn)) || null;

    const sqlDeleteStatement = queries.project.deleteIUCNSQL(projectId);

    if (!sqlDeleteStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const deleteResult = await this.connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);

    if (!deleteResult) {
      throw new HTTP409('Failed to delete project IUCN data');
    }

    const insertIUCNPromises =
      putIUCNData?.classificationDetails?.map((iucnClassification: IPutIUCN) =>
        this.insertClassificationDetail(iucnClassification.subClassification2, projectId)
      ) || [];

    await Promise.all(insertIUCNPromises);
  }

  async updatePartnershipsData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putPartnershipsData = (entities?.partnerships && new PutPartnershipsData(entities.partnerships)) || null;

    const sqlDeleteIndigenousPartnershipsStatement = queries.project.deleteIndigenousPartnershipsSQL(projectId);
    const sqlDeleteStakeholderPartnershipsStatement = queries.project.deleteStakeholderPartnershipsSQL(projectId);

    if (!sqlDeleteIndigenousPartnershipsStatement || !sqlDeleteStakeholderPartnershipsStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const deleteIndigenousPartnershipsPromises = this.connection.query(
      sqlDeleteIndigenousPartnershipsStatement.text,
      sqlDeleteIndigenousPartnershipsStatement.values
    );

    const deleteStakeholderPartnershipsPromises = this.connection.query(
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
        this.insertIndigenousNation(indigenousPartnership, projectId)
      ) || [];

    const insertStakeholderPartnershipsPromises =
      putPartnershipsData?.stakeholder_partnerships?.map((stakeholderPartnership: string) =>
        this.insertStakeholderPartnership(stakeholderPartnership, projectId)
      ) || [];

    await Promise.all([...insertIndigenousPartnershipsPromises, ...insertStakeholderPartnershipsPromises]);
  }

  async updateProjectData(projectId: number, entities: IUpdateProject): Promise<void> {
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

    const result = await this.connection.query(sqlUpdateProject.text, sqlUpdateProject.values);

    if (!result || !result.rowCount) {
      // TODO if revision count is bad, it is supposed to raise an exception?
      // It currently does skip the update as expected, but it just returns 0 rows updated, and doesn't result in any errors
      throw new HTTP409('Failed to update stale project data');
    }

    if (putProjectData?.project_activities.length) {
      await this.updateActivityData(projectId, putProjectData);
    }
  }

  async updateActivityData(projectId: number, projectData: PutProjectData) {
    const sqlDeleteActivities = queries.project.deleteActivitiesSQL(projectId);

    if (!sqlDeleteActivities) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const deleteActivitiesResult = await this.connection.query(sqlDeleteActivities.text, sqlDeleteActivities.values);

    if (!deleteActivitiesResult) {
      throw new HTTP409('Failed to update project activity data');
    }

    const insertActivityPromises =
      projectData?.project_activities?.map((activityId: number) => this.insertActivity(activityId, projectId)) || [];

    await Promise.all([...insertActivityPromises]);
  }

  async updateFundingData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putFundingSource = entities?.funding && new PutFundingSource(entities.funding);

    const surveyFundingSourceDeleteStatement = queries.survey.deleteSurveyFundingSourceByProjectFundingSourceIdSQL(
      putFundingSource?.id
    );
    const projectFundingSourceDeleteStatement = queries.project.deleteProjectFundingSourceSQL(
      projectId,
      putFundingSource?.id
    );

    if (!projectFundingSourceDeleteStatement || !surveyFundingSourceDeleteStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    const surveyFundingSourceDeleteResult = await this.connection.query(
      surveyFundingSourceDeleteStatement.text,
      surveyFundingSourceDeleteStatement.values
    );

    if (!surveyFundingSourceDeleteResult) {
      throw new HTTP409('Failed to delete survey funding source');
    }

    const projectFundingSourceDeleteResult = await this.connection.query(
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

    const insertResult = await this.connection.query(sqlInsertStatement.text, sqlInsertStatement.values);

    if (!insertResult) {
      throw new HTTP409('Failed to put (insert) project funding source with incremented revision count');
    }
  }

  async updatePublishStatus(projectId: number, publish: boolean): Promise<number> {
    const sqlStatement = queries.project.updateProjectPublishStatusSQL(projectId, publish);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!response || !result) {
      throw new HTTP500('Failed to update project publish status');
    }

    return result.id;
  }

  async deleteProject(projectId: number, userRoles: string | string[]): Promise<boolean | null> {
    /**
     * PART 1
     * Check that user is a system administrator - can delete a project (published or not)
     * Check that user is a project administrator - can delete a project (unpublished only)
     *
     */
    const getProjectSQLStatement = queries.project.getProjectSQL(projectId);

    if (!getProjectSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const projectData = await this.connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values);

    const projectResult = (projectData && projectData.rows && projectData.rows[0]) || null;

    if (!projectResult || !projectResult.id) {
      throw new HTTP400('Failed to get the project');
    }

    if (projectResult.publish_date && userHasValidRole([SYSTEM_ROLE.PROJECT_CREATOR], userRoles)) {
      throw new HTTP400('Cannot delete a published project if you are not a system administrator.');
    }

    /**
     * PART 2
     * Get the attachment S3 keys for all attachments associated to this project and surveys under this project
     * Used to delete them from S3 separately later
     */
    const getProjectAttachmentSQLStatement = queries.project.getProjectAttachmentsSQL(projectId);
    const getSurveyIdsSQLStatement = queries.survey.getSurveyIdsSQL(projectId);

    if (!getProjectAttachmentSQLStatement || !getSurveyIdsSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const getProjectAttachmentsResult = await this.connection.query(
      getProjectAttachmentSQLStatement.text,
      getProjectAttachmentSQLStatement.values
    );

    if (!getProjectAttachmentsResult || !getProjectAttachmentsResult.rows) {
      throw new HTTP400('Failed to get project attachments');
    }

    const getSurveyIdsResult = await this.connection.query(
      getSurveyIdsSQLStatement.text,
      getSurveyIdsSQLStatement.values
    );

    if (!getSurveyIdsResult || !getSurveyIdsResult.rows) {
      throw new HTTP400('Failed to get survey ids associated to project');
    }

    const surveyAttachmentS3Keys: string[] = Array.prototype.concat.apply(
      [],
      await Promise.all(
        getSurveyIdsResult.rows.map((survey: any) => getSurveyAttachmentS3Keys(survey.id, this.connection))
      )
    );

    const projectAttachmentS3Keys: string[] = getProjectAttachmentsResult.rows.map((attachment: any) => {
      return attachment.key;
    });

    /**
     * PART 3
     * Delete the project and all associated records/resources from our DB
     */
    const deleteProjectSQLStatement = queries.project.deleteProjectSQL(projectId);

    if (!deleteProjectSQLStatement) {
      throw new HTTP400('Failed to build SQL delete statement');
    }

    await this.connection.query(deleteProjectSQLStatement.text, deleteProjectSQLStatement.values);

    /**
     * PART 4
     * Delete the project and survey attachments from S3
     */
    const deleteResult = [
      ...(await Promise.all(projectAttachmentS3Keys.map((projectS3Key: string) => deleteFileFromS3(projectS3Key)))),
      ...(await Promise.all(surveyAttachmentS3Keys.map((surveyS3Key: string) => deleteFileFromS3(surveyS3Key))))
    ];

    if (deleteResult.some((deleteResult) => !deleteResult)) {
      return null;
    }

    return true;
  }
}
