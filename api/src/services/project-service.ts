import { Feature } from 'geojson';
import moment from 'moment';
import { COMPLETION_STATUS } from '../constants/status';
import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/http-error';
import { IPostIUCN, PostProjectObject } from '../models/project-create';
import {
  IPutIUCN,
  PutCoordinatorData,
  PutIUCNData,
  PutLocationData,
  PutObjectivesData,
  PutPartnershipsData,
  PutProjectData
} from '../models/project-update';
import {
  GetAttachmentsData,
  GetCoordinatorData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetReportAttachmentsData,
  IGetProject,
  IProjectAdvancedFilters,
  ProjectData,
  ProjectSupplementaryData
} from '../models/project-view';
import { GET_ENTITIES, IUpdateProject } from '../paths/project/{projectId}/update';
import { PublishStatus } from '../repositories/history-publish-repository';
import { ProjectUser } from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import { deleteFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { AttachmentService } from './attachment-service';
import { DBService } from './db-service';
import { HistoryPublishService } from './history-publish-service';
import { PlatformService } from './platform-service';
import { ProjectParticipationService } from './project-participation-service';
import { RegionService } from './region-service';
import { SurveyService } from './survey-service';

const defaultLog = getLogger('services/project-service');

export class ProjectService extends DBService {
  attachmentService: AttachmentService;
  projectRepository: ProjectRepository;
  projectParticipationService: ProjectParticipationService;
  platformService: PlatformService;
  historyPublishService: HistoryPublishService;
  surveyService: SurveyService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.attachmentService = new AttachmentService(connection);
    this.projectRepository = new ProjectRepository(connection);
    this.projectParticipationService = new ProjectParticipationService(connection);
    this.platformService = new PlatformService(connection);
    this.historyPublishService = new HistoryPublishService(connection);
    this.surveyService = new SurveyService(connection);
  }

  async getProjectList(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IProjectAdvancedFilters
  ): Promise<any> {
    const response = await this.projectRepository.getProjectList(isUserAdmin, systemUserId, filterFields);

    return response.map((row) => ({
      id: row.project_id,
      name: row.project_name,
      start_date: row.start_date,
      end_date: row.end_date,
      coordinator_agency: row.coordinator_agency,
      completion_status:
        (row.end_date && moment(row.end_date).endOf('day').isBefore(moment()) && COMPLETION_STATUS.COMPLETED) ||
        COMPLETION_STATUS.ACTIVE,
      project_programs: row.project_programs,
      regions: row.regions
    }));
  }

  async getProjectById(projectId: number): Promise<IGetProject> {
    const [
      projectData,
      objectiveData,
      coordinatorData,
      projectParticipantsData,
      locationData,
      iucnData,
      partnershipsData
    ] = await Promise.all([
      this.getProjectData(projectId),
      this.getObjectivesData(projectId),
      this.getCoordinatorData(projectId),
      this.getProjectParticipantsData(projectId),
      this.getLocationData(projectId),
      this.getIUCNClassificationData(projectId),
      this.getPartnershipsData(projectId)
    ]);

    return {
      project: projectData,
      objectives: objectiveData,
      coordinator: coordinatorData,
      participants: projectParticipantsData,
      location: locationData,
      iucn: iucnData,
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

    await Promise.all(promises);

    return results;
  }

  async getProjectData(projectId: number): Promise<ProjectData> {
    return this.projectRepository.getProjectData(projectId);
  }

  async getObjectivesData(projectId: number): Promise<GetObjectivesData> {
    return this.projectRepository.getObjectivesData(projectId);
  }

  async getCoordinatorData(projectId: number): Promise<GetCoordinatorData> {
    return this.projectRepository.getCoordinatorData(projectId);
  }

  async getProjectParticipantsData(projectId: number): Promise<ProjectUser[]> {
    return this.projectParticipationService.getProjectParticipants(projectId);
  }

  async getLocationData(projectId: number): Promise<GetLocationData> {
    return this.projectRepository.getLocationData(projectId);
  }

  async getIUCNClassificationData(projectId: number): Promise<GetIUCNClassificationData> {
    return this.projectRepository.getIUCNClassificationData(projectId);
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
      Promise.all(postProjectData.project.project_types.map((typeId: number) => this.insertType(typeId, projectId)))
    );

    // Handle project regions
    promises.push(this.insertRegion(projectId, postProjectData.location.geometry));

    // Handle project programs
    promises.push(this.insertPrograms(projectId, postProjectData.project.project_programs));

    //Handle project participants
    promises.push(this.projectParticipationService.postProjectParticipants(projectId, postProjectData.participants));

    await Promise.all(promises);

    return projectId;
  }

  async insertProject(postProjectData: PostProjectObject): Promise<number> {
    return this.projectRepository.insertProject(postProjectData);
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

  async insertType(typeId: number, projectId: number): Promise<number> {
    return this.projectRepository.insertType(typeId, projectId);
  }

  async postProjectParticipant(projectId: number, systemUserId: number, projectParticipantRole: string): Promise<void> {
    return this.projectParticipationService.postProjectParticipant(projectId, systemUserId, projectParticipantRole);
  }

  async insertRegion(projectId: number, features: Feature[]): Promise<void> {
    const regionService = new RegionService(this.connection);
    return regionService.addRegionsToProjectFromFeatures(projectId, features);
  }

  async insertPrograms(projectId: number, projectPrograms: number[]): Promise<void> {
    await this.projectRepository.deletePrograms(projectId);
    await this.projectRepository.insertProgram(projectId, projectPrograms);
  }

  /**
   * Updates the project and uploads affected metadata to BioHub
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProjectAndUploadMetadataToBioHub(projectId: number, entities: IUpdateProject): Promise<void> {
    await this.updateProject(projectId, entities);

    try {
      // Publish project metadata
      const publishProjectPromise = this.platformService.submitProjectDwCMetadataToBioHub(projectId);

      // Publish all survey metadata (which needs to be updated now that the project metadata has changed)
      const publishSurveysPromise = this.surveyService.getSurveyIdsByProjectId(projectId).then((surveyIds) => {
        return surveyIds.map((item) => this.platformService.submitSurveyDwCMetadataToBioHub(item.id));
      });

      await Promise.all([publishProjectPromise, publishSurveysPromise]);
    } catch (error) {
      defaultLog.warn({ label: 'updateProjectAndUploadMetadataToBioHub', message: 'error', error });
    }
  }

  /**
   * Updates the project
   *
   * @param {number} projectId
   * @param {IUpdateProject} entities
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async updateProject(projectId: number, entities: IUpdateProject): Promise<void> {
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

    if (entities?.location) {
      promises.push(this.insertRegion(projectId, entities.location.geometry));
    }

    if (entities?.project?.project_programs) {
      promises.push(this.insertPrograms(projectId, entities?.project?.project_programs));
    }

    await Promise.all(promises);
  }

  async updateIUCNData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putIUCNData = (entities?.iucn && new PutIUCNData(entities.iucn)) || null;

    await this.projectRepository.deleteIUCNData(projectId);

    const insertIUCNPromises =
      putIUCNData?.classificationDetails?.map((iucnClassification: IPutIUCN) =>
        this.insertClassificationDetail(iucnClassification.subClassification2, projectId)
      ) ?? [];

    await Promise.all(insertIUCNPromises);
  }

  async updatePartnershipsData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putPartnershipsData = (entities?.partnerships && new PutPartnershipsData(entities.partnerships)) || null;

    await this.projectRepository.deleteIndigenousPartnershipsData(projectId);
    await this.projectRepository.deleteStakeholderPartnershipsData(projectId);

    const insertIndigenousPartnershipsPromises =
      putPartnershipsData?.indigenous_partnerships?.map((indigenousPartnership: number) =>
        this.insertIndigenousNation(indigenousPartnership, projectId)
      ) ?? [];

    const insertStakeholderPartnershipsPromises =
      putPartnershipsData?.stakeholder_partnerships?.map((stakeholderPartnership: string) =>
        this.insertStakeholderPartnership(stakeholderPartnership, projectId)
      ) ?? [];

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

    if (putProjectData?.project_types) {
      await this.updateTypeData(projectId, putProjectData);
    }
  }

  async updateTypeData(projectId: number, projectData: PutProjectData) {
    await this.projectRepository.deleteTypeData(projectId);

    const insertTypePromises =
      projectData?.project_types?.map((typeId: number) => this.insertType(typeId, projectId)) || [];

    await Promise.all([...insertTypePromises]);
  }

  async deleteProject(projectId: number): Promise<boolean | null> {
    /**
     * PART 1
     * Check that user is a system administrator - can delete a project
     *
     */

    const projectResult = await this.getProjectData(projectId);

    if (!projectResult?.uuid) {
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

  /**
   * Returns publish status of a given project
   *
   * @param {number} projectId
   * @return {*}  {Promise<PublishStatus>}
   * @memberof ProjectService
   */
  async projectPublishStatus(projectId: number): Promise<PublishStatus> {
    const attachmentsPublishStatus = await this.historyPublishService.projectAttachmentsPublishStatus(projectId);

    const reportsPublishStatus = await this.historyPublishService.projectReportsPublishStatus(projectId);

    const surveysPublishStatus = await this.hasUnpublishedSurveys(projectId);

    if (
      attachmentsPublishStatus === PublishStatus.NO_DATA &&
      reportsPublishStatus === PublishStatus.NO_DATA &&
      surveysPublishStatus === PublishStatus.NO_DATA
    ) {
      return PublishStatus.NO_DATA;
    }

    if (
      attachmentsPublishStatus === PublishStatus.UNSUBMITTED ||
      reportsPublishStatus === PublishStatus.UNSUBMITTED ||
      surveysPublishStatus === PublishStatus.UNSUBMITTED
    ) {
      return PublishStatus.UNSUBMITTED;
    }

    return PublishStatus.SUBMITTED;
  }

  /**
   * Returns publish status of all surveys for a project
   *
   * @param {number} projectId
   * @return {*}  {Promise<PublishStatus>}
   * @memberof ProjectService
   */
  async hasUnpublishedSurveys(projectId: number): Promise<PublishStatus> {
    const surveyIds = (await this.surveyService.getSurveyIdsByProjectId(projectId)).map((item: { id: any }) => item.id);

    const surveyStatusArray = await Promise.all(
      surveyIds.map(async (surveyId) => {
        return this.surveyService.surveyPublishStatus(surveyId);
      })
    );

    if (surveyStatusArray.length === 0 || surveyStatusArray.every((status) => status === PublishStatus.NO_DATA)) {
      return PublishStatus.NO_DATA;
    }

    if (surveyStatusArray.some((status) => status === PublishStatus.UNSUBMITTED)) {
      return PublishStatus.UNSUBMITTED;
    }

    return PublishStatus.SUBMITTED;
  }
}
