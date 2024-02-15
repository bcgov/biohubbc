import { default as dayjs } from 'dayjs';
import { Feature } from 'geojson';
import { COMPLETION_STATUS } from '../constants/status';
import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/http-error';
import { IPostIUCN, PostProjectObject } from '../models/project-create';
import { IPutIUCN, PutIUCNData, PutObjectivesData, PutProjectData } from '../models/project-update';
import {
  GetAttachmentsData,
  GetIUCNClassificationData,
  GetObjectivesData,
  GetReportAttachmentsData,
  IGetProject,
  IProjectAdvancedFilters,
  ProjectData,
  ProjectListData,
  ProjectSupplementaryData
} from '../models/project-view';
import { GET_ENTITIES, IUpdateProject } from '../paths/project/{projectId}/update';
import { PublishStatus } from '../repositories/history-publish-repository';
import { ProjectUser } from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import { SystemUser } from '../repositories/user-repository';
import { deleteFileFromS3 } from '../utils/file-utils';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { AttachmentService } from './attachment-service';
import { DBService } from './db-service';
import { HistoryPublishService } from './history-publish-service';
import { PlatformService } from './platform-service';
import { ProjectParticipationService } from './project-participation-service';
import { RegionService } from './region-service';
import { SurveyService } from './survey-service';

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

  /**
   * Retrieves the paginated list of all projects that are available to the user.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IProjectAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {(Promise<(ProjectListData & { completion_status: COMPLETION_STATUS })[]>)}
   * @memberof ProjectService
   */
  async getProjectList(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IProjectAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<(ProjectListData & { completion_status: COMPLETION_STATUS })[]> {
    const response = await this.projectRepository.getProjectList(isUserAdmin, systemUserId, filterFields, pagination);

    return response.map((row) => ({
      ...row,
      completion_status:
        (row.end_date && dayjs(row.end_date).endOf('day').isBefore(dayjs()) && COMPLETION_STATUS.COMPLETED) ||
        COMPLETION_STATUS.ACTIVE
    }));
  }

  /**
   * Returns the total count of projects that are visible to the given user.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async getProjectCount(isUserAdmin: boolean, systemUserId: number | null): Promise<number> {
    return this.projectRepository.getProjectCount(isUserAdmin, systemUserId);
  }

  /**
   * Retrieves a single project by its ID.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IGetProject>}
   * @memberof ProjectService
   */
  async getProjectById(projectId: number): Promise<IGetProject> {
    const [projectData, objectiveData, projectParticipantsData, iucnData] = await Promise.all([
      this.getProjectData(projectId),
      this.getObjectivesData(projectId),
      this.getProjectParticipantsData(projectId),
      this.getIUCNClassificationData(projectId)
    ]);

    return {
      project: projectData,
      objectives: objectiveData,
      participants: projectParticipantsData,
      iucn: iucnData
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
      project: undefined,
      objectives: undefined,
      iucn: undefined
    };

    const promises: Promise<any>[] = [];

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

    if (entities.includes(GET_ENTITIES.participants)) {
      promises.push(
        this.getProjectParticipantsData(projectId).then((value) => {
          results.participants = value;
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

  async getProjectParticipantsData(projectId: number): Promise<(ProjectUser & SystemUser)[]> {
    return this.projectParticipationService.getProjectParticipants(projectId);
  }

  async getIUCNClassificationData(projectId: number): Promise<GetIUCNClassificationData> {
    return this.projectRepository.getIUCNClassificationData(projectId);
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
  async createProject(postProjectData: PostProjectObject): Promise<number> {
    const projectId = await this.insertProject(postProjectData);

    const promises: Promise<any>[] = [];

    // Handle project IUCN classifications
    promises.push(
      Promise.all(
        postProjectData.iucn.classificationDetails.map((classificationDetail: IPostIUCN) =>
          this.insertClassificationDetail(classificationDetail.subClassification2, projectId)
        )
      )
    );

    // Handle project programs
    promises.push(this.insertPrograms(projectId, postProjectData.project.project_programs));

    //Handle project participants
    promises.push(this.projectParticipationService.postProjectParticipants(projectId, postProjectData.participants));

    await Promise.all(promises);

    return projectId;
  }

  /**
   * Insert project data.
   *
   * @param {PostProjectObject} postProjectData
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertProject(postProjectData: PostProjectObject): Promise<number> {
    return this.projectRepository.insertProject(postProjectData);
  }

  /**
   * Insert IUCN classification data.
   *
   * @param {number} iucn3_id
   * @param {number} project_id
   * @return {*}  {Promise<number>}
   * @memberof ProjectService
   */
  async insertClassificationDetail(iucn3_id: number, project_id: number): Promise<number> {
    return this.projectRepository.insertClassificationDetail(iucn3_id, project_id);
  }

  /**
   * Insert participation data.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {string} projectParticipantRole
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async postProjectParticipant(projectId: number, systemUserId: number, projectParticipantRole: string): Promise<void> {
    return this.projectParticipationService.postProjectParticipant(projectId, systemUserId, projectParticipantRole);
  }

  /**
   * Insert region data.
   *
   * @param {number} projectId
   * @param {Feature[]} features
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async insertRegion(projectId: number, features: Feature[]): Promise<void> {
    const regionService = new RegionService(this.connection);
    return regionService.addRegionsToProjectFromFeatures(projectId, features);
  }

  /**
   * Insert programs data.
   *
   * @param {number} projectId
   * @param {number[]} projectPrograms
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async insertPrograms(projectId: number, projectPrograms: number[]): Promise<void> {
    await this.projectRepository.deletePrograms(projectId);
    await this.projectRepository.insertProgram(projectId, projectPrograms);
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

    if (entities?.project || entities?.objectives) {
      promises.push(this.updateProjectData(projectId, entities));
    }

    if (entities?.iucn) {
      promises.push(this.updateIUCNData(projectId, entities));
    }

    if (entities?.project?.project_programs) {
      promises.push(this.insertPrograms(projectId, entities?.project?.project_programs));
    }

    if (entities?.participants) {
      promises.push(this.projectParticipationService.upsertProjectParticipantData(projectId, entities.participants));
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

  async updateProjectData(projectId: number, entities: IUpdateProject): Promise<void> {
    const putProjectData = (entities?.project && new PutProjectData(entities.project)) || null;
    const putObjectivesData = (entities?.objectives && new PutObjectivesData(entities.objectives)) || null;

    // Update project table
    const revision_count = putProjectData?.revision_count ?? putObjectivesData?.revision_count ?? null;

    if (!revision_count && revision_count !== 0) {
      throw new HTTP400('Failed to parse request body');
    }

    await this.projectRepository.updateProjectData(projectId, putProjectData, putObjectivesData, revision_count);
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
