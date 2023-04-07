import moment from 'moment';
import { PROJECT_ROLE } from '../constants/roles';
import { COMPLETION_STATUS } from '../constants/status';
import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/http-error';
import { IPostIUCN, PostFundingSource, PostProjectObject } from '../models/project-create';
import {
  IPutIUCN,
  PutCoordinatorData,
  PutFundingData,
  PutIUCNData,
  PutLocationData,
  PutObjectivesData,
  PutPartnershipsData,
  PutProjectData
} from '../models/project-update';
import {
  GetAttachmentsData,
  GetCoordinatorData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetProjectData,
  GetReportAttachmentsData,
  IGetProject,
  ProjectSupplementaryData
} from '../models/project-view';
import { GET_ENTITIES, IUpdateProject } from '../paths/project/{projectId}/update';
import { ProjectRepository } from '../repositories/project-repository';
import { deleteFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { AttachmentService } from './attachment-service';
import { DBService } from './db-service';
import { HistoryPublishService } from './history-publish-service';
import { PlatformService } from './platform-service';
import { ProjectParticipationService } from './project-participation-service';
import { SurveyService } from './survey-service';

const defaultLog = getLogger('services/project-service');

export class ProjectService extends DBService {
  attachmentService: AttachmentService;
  projectRepository: ProjectRepository;
  projectParticipationService: ProjectParticipationService;
  platformService: PlatformService;
  historyPublishService: HistoryPublishService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.attachmentService = new AttachmentService(connection);
    this.projectRepository = new ProjectRepository(connection);
    this.projectParticipationService = new ProjectParticipationService(connection);
    this.platformService = new PlatformService(connection);
    this.historyPublishService = new HistoryPublishService(connection);
  }

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
    return this.projectParticipationService.getProjectParticipant(projectId, systemUserId);
  }

  /**
   * Get all project participants for a project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<object[]>}
   * @memberof ProjectService
   */
  async getProjectParticipants(projectId: number): Promise<object[]> {
    return this.projectParticipationService.getProjectParticipants(projectId);
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
    return this.projectParticipationService.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
  }

  async getProjectList(isUserAdmin: boolean, systemUserId: number | null, filterFields: any): Promise<any> {
    const response = await this.projectRepository.getProjectList(isUserAdmin, systemUserId, filterFields);

    return response.map((row) => ({
      id: row.id,
      name: row.name,
      start_date: row.start_date,
      end_date: row.end_date,
      coordinator_agency: row.coordinator_agency_name,
      completion_status:
        (row.end_date && moment(row.end_date).endOf('day').isBefore(moment()) && COMPLETION_STATUS.COMPLETED) ||
        COMPLETION_STATUS.ACTIVE,
      project_type: row.project_type
    }));
  }

  async getProjectById(projectId: number): Promise<IGetProject> {
    const [
      projectData,
      objectiveData,
      coordinatorData,
      locationData,
      iucnData,
      fundingData,
      partnershipsData
    ] = await Promise.all([
      this.getProjectData(projectId),
      this.getObjectivesData(projectId),
      this.getCoordinatorData(projectId),
      this.getLocationData(projectId),
      this.getIUCNClassificationData(projectId),
      this.getFundingData(projectId),
      this.getPartnershipsData(projectId)
    ]);

    return {
      project: projectData,
      objectives: objectiveData,
      coordinator: coordinatorData,
      location: locationData,
      iucn: iucnData,
      funding: fundingData,
      partnerships: partnershipsData
    };
  }

  /**
   * Get Project supplementary data for a given project ID
   *
   * @param {number} projectId
   * @returns {*} {Promise<ProjectSupplementaryData>}
   * @memberof ProjectService
   */
  async getProjectSupplementaryDataById(projectId: number): Promise<ProjectSupplementaryData> {
    const projectMetadataPublish = await this.historyPublishService.getProjectMetadataPublishRecord(projectId);

    return { project_metadata_publish: projectMetadataPublish };
  }

  async getProjectEntitiesById(projectId: number, entities: string[]): Promise<Partial<IGetProject>> {
    const results: Partial<IGetProject> = {
      coordinator: undefined,
      project: undefined,
      objectives: undefined,
      location: undefined,
      iucn: undefined,
      funding: undefined,
      partnerships: undefined
    };

    const promises: Promise<any>[] = [];

    if (entities.includes(GET_ENTITIES.coordinator)) {
      promises.push(
        this.getCoordinatorData(projectId).then((value) => {
          results.coordinator = value;
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
        this.getFundingData(projectId).then((value) => {
          results.funding = value;
        })
      );
    }

    await Promise.all(promises);

    return results;
  }

  async getProjectData(projectId: number): Promise<GetProjectData> {
    return this.projectRepository.getProjectData(projectId);
  }

  async getObjectivesData(projectId: number): Promise<GetObjectivesData> {
    return this.projectRepository.getObjectivesData(projectId);
  }

  async getCoordinatorData(projectId: number): Promise<GetCoordinatorData> {
    return this.projectRepository.getCoordinatorData(projectId);
  }

  async getLocationData(projectId: number): Promise<GetLocationData> {
    return this.projectRepository.getLocationData(projectId);
  }

  async getIUCNClassificationData(projectId: number): Promise<GetIUCNClassificationData> {
    return this.projectRepository.getIUCNClassificationData(projectId);
  }

  async getFundingData(projectId: number): Promise<GetFundingData> {
    return this.projectRepository.getFundingData(projectId);
  }

  async getPartnershipsData(projectId: number): Promise<GetPartnershipsData> {
    const [indigenousPartnershipsRows, stakegholderPartnershipsRows] = await Promise.all([
      this.projectRepository.getIndigenousPartnershipsRows(projectId),
      this.projectRepository.getStakeholderPartnershipsRows(projectId)
    ]);

    return new GetPartnershipsData(indigenousPartnershipsRows, stakegholderPartnershipsRows);
  }

  async getIndigenousPartnershipsRows(projectId: number): Promise<any[]> {
    return this.projectRepository.getIndigenousPartnershipsRows(projectId);
  }

  async getStakeholderPartnershipsRows(projectId: number): Promise<any[]> {
    return this.projectRepository.getStakeholderPartnershipsRows(projectId);
  }

  async getAttachmentsData(projectId: number): Promise<GetAttachmentsData> {
    return this.projectRepository.getAttachmentsData(projectId);
  }

  async getReportAttachmentsData(projectId: number): Promise<GetReportAttachmentsData> {
    return this.projectRepository.getReportAttachmentsData(projectId);
  }

  /**
   *
   *
   * @param {PostProjectObject} postProjectData
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async createProjectAndUploadMetadataToBioHub(postProjectData: PostProjectObject): Promise<number> {
    const projectId = await this.createProject(postProjectData);

    try {
      await this.platformService.submitProjectDwCMetadataToBioHub(projectId);
    } catch (error) {
      defaultLog.warn({ label: 'createProjectAndUploadMetadataToBioHub', message: 'error', error });
    }

    return projectId;
  }

  /**
   *
   *
   * @param {PostProjectObject} postProjectData
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async createProject(postProjectData: PostProjectObject): Promise<number> {
    const projectId = await this.insertProject(postProjectData);

    const promises: Promise<any>[] = [];

    // Handle funding sources
    promises.push(
      Promise.all(
        postProjectData.funding.fundingSources.map((fundingSource: PostFundingSource) =>
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
    return this.projectRepository.insertProject(postProjectData);
  }

  async insertFundingSource(fundingSource: PostFundingSource, project_id: number): Promise<number> {
    return this.projectRepository.insertFundingSource(fundingSource, project_id);
  }

  async insertIndigenousNation(indigenousNationsId: number, project_id: number): Promise<number> {
    return this.projectRepository.insertIndigenousNation(indigenousNationsId, project_id);
  }

  async insertStakeholderPartnership(stakeholderPartner: string, project_id: number): Promise<number> {
    return this.projectRepository.insertStakeholderPartnership(stakeholderPartner, project_id);
  }

  async insertClassificationDetail(iucn3_id: number, project_id: number): Promise<number> {
    return this.projectRepository.insertClassificationDetail(iucn3_id, project_id);
  }

  async insertActivity(activityId: number, projectId: number): Promise<number> {
    return this.projectRepository.insertActivity(activityId, projectId);
  }

  async insertParticipantRole(projectId: number, projectParticipantRole: string): Promise<void> {
    return this.projectParticipationService.insertParticipantRole(projectId, projectParticipantRole);
  }

  /**
   * Updates the project and uploads to BioHub
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectAndUploadMetadataToBioHub(projectId: number, entities: IUpdateProject): Promise<void> {
    await this.updateProject(projectId, entities);

    try {
      await this.platformService.submitProjectDwCMetadataToBioHub(projectId);
    } catch (error) {
      defaultLog.warn({ label: 'updateProjectAndUploadMetadataToBioHub', message: 'error', error });
    }
  }

  /**
   * Updates the project
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @memberof ProjectService
   */
  async updateProject(projectId: number, entities: IUpdateProject) {
    const promises: Promise<any>[] = [];

    if (entities?.partnerships) {
      promises.push(this.updatePartnershipsData(projectId, entities));
    }

    if (entities?.project || entities?.location || entities?.objectives || entities?.coordinator) {
      promises.push(this.updateProjectData(projectId, entities));
    }

    if (entities?.iucn) {
      promises.push(this.updateIUCNData(projectId, entities));
    }

    if (entities?.funding) {
      promises.push(this.updateFundingData(projectId, entities));
    }

    await Promise.all(promises);
  }

  async updateIUCNData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putIUCNData = (entities?.iucn && new PutIUCNData(entities.iucn)) || null;

    await this.projectRepository.deleteIUCNData(projectId);

    const insertIUCNPromises =
      putIUCNData?.classificationDetails?.map((iucnClassification: IPutIUCN) =>
        this.insertClassificationDetail(iucnClassification.subClassification2, projectId)
      ) || [];

    await Promise.all(insertIUCNPromises);
  }

  async updatePartnershipsData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putPartnershipsData = (entities?.partnerships && new PutPartnershipsData(entities.partnerships)) || null;

    await this.projectRepository.deleteIndigenousPartnershipsData(projectId);
    await this.projectRepository.deleteStakeholderPartnershipsData(projectId);

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

    await this.projectRepository.updateProjectData(
      projectId,
      putProjectData,
      putLocationData,
      putObjectivesData,
      putCoordinatorData,
      revision_count
    );

    if (putProjectData?.project_activities.length) {
      await this.updateActivityData(projectId, putProjectData);
    }
  }

  async updateActivityData(projectId: number, projectData: PutProjectData) {
    await this.projectRepository.deleteActivityData(projectId);

    const insertActivityPromises =
      projectData?.project_activities?.map((activityId: number) => this.insertActivity(activityId, projectId)) || [];

    await Promise.all([...insertActivityPromises]);
  }

  /**
   * Compares incoming project funding data against the existing funding data, if any, and determines which need to be
   * deleted, added, or updated.
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateFundingData(projectId: number, entities: IUpdateProject): Promise<void> {
    const projectRepository = new ProjectRepository(this.connection);

    const putFundingData = entities?.funding && new PutFundingData(entities.funding);
    if (!putFundingData) {
      throw new HTTP400('Failed to create funding data object');
    }
    // Get any existing funding for this project
    const existingProjectFundingSources = await projectRepository.getProjectFundingSourceIds(projectId);

    // Compare the array of existing funding to the array of incoming funding (by project_funding_source_id) and collect any
    // existing funding that are not in the incoming funding array.
    const existingFundingSourcesToDelete = existingProjectFundingSources.filter((existingFunding) => {
      // Find all existing funding (by project_funding_source_id) that have no matching incoming project_funding_source_id
      return !putFundingData.fundingSources.find(
        (incomingFunding) => incomingFunding.id === existingFunding.project_funding_source_id
      );
    });

    // Delete from the database all existing project and survey funding that have been removed
    if (existingFundingSourcesToDelete.length) {
      const promises: Promise<any>[] = [];

      existingFundingSourcesToDelete.forEach((funding) => {
        // Delete funding connection to survey first
        promises.push(
          projectRepository.deleteSurveyFundingSourceConnectionToProject(funding.project_funding_source_id)
        );
        // Delete project funding after
        promises.push(projectRepository.deleteProjectFundingSource(funding.project_funding_source_id));
      });

      await Promise.all(promises);
    }

    // The remaining funding are either new, and can be created, or updates to existing funding
    const promises: Promise<any>[] = [];

    putFundingData.fundingSources.forEach((funding) => {
      if (funding.id) {
        // Has a project_funding_source_id, indicating this is an update to an existing funding
        promises.push(projectRepository.updateProjectFundingSource(funding, projectId));
      } else {
        // No project_funding_source_id, indicating this is a new funding which needs to be created
        promises.push(projectRepository.insertProjectFundingSource(funding, projectId));
      }
    });

    await Promise.all(promises);
  }

  async deleteProject(projectId: number): Promise<boolean | null> {
    /**
     * PART 1
     * Check that user is a system administrator - can delete a project
     *
     */

    const projectResult = await this.getProjectData(projectId);

    if (!projectResult || !projectResult.uuid) {
      throw new HTTP400('Failed to get the project');
    }

    /**
     * PART 2
     * Get the attachment S3 keys for all attachments associated to this project and surveys under this project
     * Used to delete them from S3 separately later
     */

    const surveyService = new SurveyService(this.connection);

    const getSurveyIdsResult = await surveyService.getSurveyIdsByProjectId(projectId);

    const surveyAttachmentS3Keys: string[] = Array.prototype.concat.apply(
      [],
      await Promise.all(
        getSurveyIdsResult.map(async (survey: any) => {
          const surveyAttachments = await this.attachmentService.getSurveyAttachments(survey.id);
          return surveyAttachments.map((attachment) => attachment.key);
        })
      )
    );

    const getProjectAttachments = await this.attachmentService.getProjectAttachments(projectId);

    const projectAttachmentS3Keys: string[] = getProjectAttachments.map((attachment: any) => {
      return attachment.key;
    });

    /**
     * PART 3
     * Delete the project and all associated records/resources from our DB
     */

    await this.projectRepository.deleteProject(projectId);

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

  async deleteProjectParticipationRecord(projectParticipationId: number): Promise<any> {
    return this.projectParticipationService.deleteProjectParticipationRecord(projectParticipationId);
  }
}
