import { Feature } from 'geojson';
import { MESSAGE_CLASS_NAME, SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { PostProprietorData, PostSurveyObject } from '../models/survey-create';
import { PostSurveyLocationData, PutPartnershipsData, PutSurveyObject } from '../models/survey-update';
import {
  GetAncillarySpeciesData,
  GetAttachmentsData,
  GetFocalSpeciesData,
  GetPermitData,
  GetReportAttachmentsData,
  GetSurveyData,
  GetSurveyFundingSourceData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData,
  ISurveyPartnerships,
  SurveyObject,
  SurveySupplementaryData
} from '../models/survey-view';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { PublishStatus } from '../repositories/history-publish-repository';
import { PostSurveyBlock, SurveyBlockRecord } from '../repositories/survey-block-repository';
import { SurveyLocationRecord } from '../repositories/survey-location-repository';
import {
  IGetLatestSurveyOccurrenceSubmission,
  IObservationSubmissionInsertDetails,
  IObservationSubmissionUpdateDetails,
  IOccurrenceSubmissionMessagesResponse,
  ISurveyProprietorModel,
  SurveyBasicFields,
  SurveyRepository
} from '../repositories/survey-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';
import { FundingSourceService } from './funding-source-service';
import { HistoryPublishService } from './history-publish-service';
import { PermitService } from './permit-service';
import { ITaxonomy, PlatformService } from './platform-service';
import { RegionService } from './region-service';
import { SiteSelectionStrategyService } from './site-selection-strategy-service';
import { SurveyBlockService } from './survey-block-service';
import { SurveyLocationService } from './survey-location-service';
import { SurveyParticipationService } from './survey-participation-service';

const defaultLog = getLogger('services/survey-service');

export interface IMessageTypeGroup {
  severityLabel: MESSAGE_CLASS_NAME;
  messageTypeLabel: SUBMISSION_MESSAGE_TYPE;
  messageStatus: SUBMISSION_STATUS_TYPE;
  messages: { id: number; message: string }[];
}

export class SurveyService extends DBService {
  attachmentRepository: AttachmentRepository;
  surveyRepository: SurveyRepository;
  platformService: PlatformService;
  historyPublishService: HistoryPublishService;
  fundingSourceService: FundingSourceService;
  siteSelectionStrategyService: SiteSelectionStrategyService;
  surveyParticipationService: SurveyParticipationService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
    this.surveyRepository = new SurveyRepository(connection);
    this.platformService = new PlatformService(connection);
    this.historyPublishService = new HistoryPublishService(connection);
    this.fundingSourceService = new FundingSourceService(connection);
    this.siteSelectionStrategyService = new SiteSelectionStrategyService(connection);
    this.surveyParticipationService = new SurveyParticipationService(connection);
  }

  /**
   * Get Survey IDs for a project ID
   *
   * @param {number} projectID
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof SurveyService
   */
  async getSurveyIdsByProjectId(projectId: number): Promise<{ id: number }[]> {
    return this.surveyRepository.getSurveyIdsByProjectId(projectId);
  }

  /**
   * Gets all information of a Survey for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<SurveyObject>}
   * @memberof SurveyService
   */
  async getSurveyById(surveyId: number): Promise<SurveyObject> {
    return {
      survey_details: await this.getSurveyData(surveyId),
      species: await this.getSpeciesData(surveyId),
      permit: await this.getPermitData(surveyId),
      funding_sources: await this.getSurveyFundingSourceData(surveyId),
      partnerships: await this.getSurveyPartnershipsData(surveyId),
      purpose_and_methodology: await this.getSurveyPurposeAndMethodology(surveyId),
      proprietor: await this.getSurveyProprietorDataForView(surveyId),
      locations: await this.getSurveyLocationsData(surveyId),
      participants: await this.surveyParticipationService.getSurveyParticipants(surveyId),
      site_selection: await this.siteSelectionStrategyService.getSiteSelectionDataBySurveyId(surveyId),
      blocks: await this.getSurveyBlocksForSurveyId(surveyId)
    };
  }

  async getSurveyBlocksForSurveyId(surveyId: number): Promise<SurveyBlockRecord[]> {
    const service = new SurveyBlockService(this.connection);
    return service.getSurveyBlocksForSurveyId(surveyId);
  }

  async getSurveyPartnershipsData(surveyId: number): Promise<ISurveyPartnerships> {
    const [indigenousPartnerships, stakeholderPartnerships] = [
      await this.surveyRepository.getIndigenousPartnershipsBySurveyId(surveyId),
      await this.surveyRepository.getStakeholderPartnershipsBySurveyId(surveyId)
    ];

    return {
      indigenous_partnerships: indigenousPartnerships.map((partnership) => partnership.first_nations_id),
      stakeholder_partnerships: stakeholderPartnerships.map((partnership) => partnership.name)
    };
  }

  /**
   * Get Survey funding data for a given survey ID
   *
   * @param {number} surveyId
   * @return {*}  {Promise<GetSurveyFundingSourceData[]>}
   * @memberof SurveyService
   */
  async getSurveyFundingSourceData(surveyId: number): Promise<GetSurveyFundingSourceData[]> {
    return this.fundingSourceService.getSurveyFundingSources(surveyId);
  }

  /**
   * Get Survey supplementary data for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<SurveySupplementaryData>}
   * @memberof SurveyService
   */
  async getSurveySupplementaryDataById(surveyId: number): Promise<SurveySupplementaryData> {
    const surveyMetadataPublish = await this.historyPublishService.getSurveyMetadataPublishRecord(surveyId);

    return { survey_metadata_publish: surveyMetadataPublish };
  }

  /**
   * Gets Survey data for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetSurveyData>}
   * @memberof SurveyService
   */
  async getSurveyData(surveyId: number): Promise<GetSurveyData> {
    const [surveyData, surveyTypesData] = await Promise.all([
      this.surveyRepository.getSurveyData(surveyId),
      this.surveyRepository.getSurveyTypesData(surveyId)
    ]);

    const surveyTypeIds = surveyTypesData.map((item) => item.type_id);

    return new GetSurveyData({ ...surveyData, survey_types: surveyTypeIds });
  }

  /**
   * Get associated species data for a survey from the taxonomic service for a given Survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetFocalSpeciesData & GetAncillarySpeciesData>}
   * @memberof SurveyService
   */
  async getSpeciesData(surveyId: number): Promise<GetFocalSpeciesData & GetAncillarySpeciesData> {
    const studySpeciesResponse = await this.surveyRepository.getSpeciesData(surveyId);

    const [focalSpeciesIds, ancillarySpeciesIds] = studySpeciesResponse.reduce(
      ([focal, ancillary]: [number[], number[]], studySpecies) => {
        if (studySpecies.is_focal) {
          focal.push(studySpecies.itis_tsn);
        } else {
          ancillary.push(studySpecies.itis_tsn);
        }

        return [focal, ancillary];
      },
      [[], []]
    );

    const platformService = new PlatformService(this.connection);

    const focalSpecies = await platformService.getTaxonomyByTsns(focalSpeciesIds);
    const ancillarySpecies = await platformService.getTaxonomyByTsns(ancillarySpeciesIds);

    return { ...new GetFocalSpeciesData(focalSpecies), ...new GetAncillarySpeciesData(ancillarySpecies) };
  }

  /**
   * Get Survey permit data for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetPermitData>}
   * @memberof SurveyService
   */
  async getPermitData(surveyId: number): Promise<GetPermitData> {
    const permitService = new PermitService(this.connection);

    const result = await permitService.getPermitBySurveyId(surveyId);

    return new GetPermitData(result);
  }

  /**
   * Get Survey purpose and Methodology information for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetSurveyPurposeAndMethodologyData>}
   * @memberof SurveyService
   */
  async getSurveyPurposeAndMethodology(surveyId: number): Promise<GetSurveyPurposeAndMethodologyData> {
    return this.surveyRepository.getSurveyPurposeAndMethodology(surveyId);
  }

  /**
   * Gets proprietor data for view or null for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetSurveyProprietorData | null>}
   * @memberof SurveyService
   */
  async getSurveyProprietorDataForView(surveyId: number): Promise<GetSurveyProprietorData | null> {
    return this.surveyRepository.getSurveyProprietorDataForView(surveyId);
  }

  /**
   * Get Survey location for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetSurveyLocationData[]>}
   * @memberof SurveyService
   */
  async getSurveyLocationsData(surveyId: number): Promise<SurveyLocationRecord[]> {
    const service = new SurveyLocationService(this.connection);
    return service.getSurveyLocationsData(surveyId);
  }

  /**
   * Get Occurrence Submission for a given survey id.
   *
   * @param {number} surveyId
   * @return {*}  {(Promise<{ occurrence_submission_id: number | null }>)}
   * @memberof SurveyService
   */
  async getOccurrenceSubmission(surveyId: number): Promise<{ occurrence_submission_id: number | null }> {
    return this.surveyRepository.getOccurrenceSubmission(surveyId);
  }

  /**
   * Get latest Occurrence Submission or null for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<IGetLatestSurveyOccurrenceSubmission | null>}
   * @memberof SurveyService
   */
  async getLatestSurveyOccurrenceSubmission(surveyId: number): Promise<IGetLatestSurveyOccurrenceSubmission | null> {
    return this.surveyRepository.getLatestSurveyOccurrenceSubmission(surveyId);
  }

  /**
   * Gets the Proprietor Data to be be submitted
   * to BioHub as a Security Request
   *
   * @param {number} surveyID
   * @returns {*} {Promise<ISurveyProprietorModel>}
   * @memberof SurveyService
   */
  async getSurveyProprietorDataForSecurityRequest(surveyId: number): Promise<ISurveyProprietorModel> {
    return this.surveyRepository.getSurveyProprietorDataForSecurityRequest(surveyId);
  }

  /**
   * Retrieves all submission messages by the given submission ID, then groups them based on the message type.
   * @param {number} submissionId The ID of the submission
   * @returns {*} {Promise<IMessageTypeGroup[]>} Promise resolving the array of message groups containing the submission messages
   */
  async getOccurrenceSubmissionMessages(submissionId: number): Promise<IMessageTypeGroup[]> {
    const messages = await this.surveyRepository.getOccurrenceSubmissionMessages(submissionId);
    defaultLog.debug({ label: 'getOccurrenceSubmissionMessages', submissionId, messages });

    return messages.reduce((typeGroups: IMessageTypeGroup[], message: IOccurrenceSubmissionMessagesResponse) => {
      const groupIndex = typeGroups.findIndex((group) => {
        return group.messageTypeLabel === message.type;
      });

      const messageObject = {
        id: message.id,
        message: message.message
      };

      if (groupIndex < 0) {
        typeGroups.push({
          severityLabel: message.class,
          messageTypeLabel: message.type,
          messageStatus: message.status,
          messages: [messageObject]
        });
      } else {
        typeGroups[groupIndex].messages.push(messageObject);
      }

      return typeGroups;
    }, []);
  }

  /**
   * Get a survey summary submission record for a given survey id.
   *
   * @param {number} surveyId
   * @return {*}  {(Promise<{ survey_summary_submission_id: number | null }>)}
   * @memberof SurveyService
   */
  async getSurveySummarySubmission(surveyId: number): Promise<{ survey_summary_submission_id: number | null }> {
    return this.surveyRepository.getSurveySummarySubmission(surveyId);
  }

  /**
   * Get surveys by their ids.
   *
   * @param {number[]} surveyIds
   * @return {*}  {Promise<SurveyObject[]>}
   * @memberof SurveyService
   */
  async getSurveysByIds(surveyIds: number[]): Promise<SurveyObject[]> {
    return Promise.all(surveyIds.map(async (surveyId) => this.getSurveyById(surveyId)));
  }

  /**
   * Get all surveys by their associated project ID.
   *
   * @param {number} projectId the ID of the project
   * @return {*}  {Promise<SurveyObject[]>} The associated surveys
   * @memberof SurveyService
   */
  async getSurveysByProjectId(projectId: number): Promise<SurveyObject[]> {
    const surveyIds = await this.getSurveyIdsByProjectId(projectId);

    return this.getSurveysByIds(surveyIds.map((survey) => survey.id));
  }

  /**
   * Fetches a subset of survey fields for all surveys under a project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<SurveyBasicFields[]>}
   * @memberof SurveyService
   */
  async getSurveysBasicFieldsByProjectId(projectId: number): Promise<SurveyBasicFields[]> {
    const surveys = await this.surveyRepository.getSurveysBasicFieldsByProjectId(projectId);

    // Build an array of all unique focal species ids from all surveys
    const uniqueFocalSpeciesIds = Array.from(
      new Set(surveys.reduce((ids: number[], survey) => ids.concat(survey.focal_species), []))
    );

    // Fetch focal species data for all species ids
    const platformService = new PlatformService(this.connection);
    const focalSpecies = await platformService.getTaxonomyByTsns(uniqueFocalSpeciesIds);

    // Decorate the surveys response with their matching focal species labels
    const decoratedSurveys: SurveyBasicFields[] = [];
    for (const survey of surveys) {
      const matchingFocalSpeciesNames = focalSpecies
        .filter((item) => survey.focal_species.includes(Number(item.tsn)))
        .map((item) => [item.commonName, `(${item.scientificName})`].filter(Boolean).join(' '));

      decoratedSurveys.push({ ...survey, focal_species_names: matchingFocalSpeciesNames });
    }

    return decoratedSurveys;
  }
  /**
   * Creates the survey
   *
   * @param {number} projectId
   * @param {PostSurveyObject} postSurveyData
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async createSurvey(projectId: number, postSurveyData: PostSurveyObject): Promise<number> {
    const surveyId = await this.insertSurveyData(projectId, postSurveyData);

    const promises: Promise<any>[] = [];

    // Handle survey types
    promises.push(this.insertSurveyTypes(postSurveyData.survey_details.survey_types, surveyId));

    //Handle multiple intended outcomes
    promises.push(
      this.insertSurveyIntendedOutcomes(postSurveyData.purpose_and_methodology.intended_outcome_ids, surveyId)
    );

    // Handle focal species associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.species.focal_species.map((species: ITaxonomy) => this.insertFocalSpecies(species.tsn, surveyId))
      )
    );

    // Handle ancillary species associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.species.ancillary_species.map((species: ITaxonomy) =>
          this.insertAncillarySpecies(species.tsn, surveyId)
        )
      )
    );

    // Handle indigenous partners
    if (postSurveyData.partnerships.indigenous_partnerships) {
      promises.push(this.insertIndigenousPartnerships(postSurveyData.partnerships.indigenous_partnerships, surveyId));
    }

    // Handle stakeholder partners
    if (postSurveyData.partnerships.stakeholder_partnerships) {
      promises.push(this.insertStakeholderPartnerships(postSurveyData.partnerships.stakeholder_partnerships, surveyId));
    }

    // Handle inserting any permit associated to this survey
    const permitService = new PermitService(this.connection);
    promises.push(
      Promise.all(
        postSurveyData.permit.permits.map((permit) =>
          permitService.createSurveyPermit(surveyId, permit.permit_number, permit.permit_type)
        )
      )
    );

    // Handle survey funding sources
    promises.push(
      Promise.all(
        postSurveyData.funding_sources.map((fundingSource) =>
          this.fundingSourceService.postSurveyFundingSource(
            surveyId,
            fundingSource.funding_source_id,
            fundingSource.amount
          )
        )
      )
    );

    // Handle survey participants
    promises.push(
      Promise.all(
        postSurveyData.participants.map((participant) =>
          this.surveyParticipationService.insertSurveyParticipant(
            surveyId,
            participant.system_user_id,
            participant.survey_job_name
          )
        )
      )
    );

    // Handle survey proprietor data
    postSurveyData.proprietor && promises.push(this.insertSurveyProprietor(postSurveyData.proprietor, surveyId));

    //Handle vantage codes associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.purpose_and_methodology.vantage_code_ids.map((vantageCode: number) =>
          this.insertVantageCodes(vantageCode, surveyId)
        )
      )
    );

    if (postSurveyData.locations) {
      promises.push(Promise.all(postSurveyData.locations.map((item) => this.insertSurveyLocations(surveyId, item))));
    }

    // Handle site selection strategies

    if (postSurveyData.site_selection.strategies.length > 0) {
      promises.push(
        this.siteSelectionStrategyService.insertSurveySiteSelectionStrategies(
          surveyId,
          postSurveyData.site_selection.strategies
        )
      );
    }

    // Handle stratums
    if (postSurveyData.site_selection.stratums.length > 0) {
      promises.push(
        this.siteSelectionStrategyService.insertSurveyStratums(surveyId, postSurveyData.site_selection.stratums)
      );
    }

    // Handle blocks
    if (postSurveyData.blocks) {
      promises.push(this.upsertBlocks(surveyId, postSurveyData.blocks));
    }

    await Promise.all(promises);

    return surveyId;
  }

  /**
   * Inserts location data.
   *
   * @param {number} surveyId
   * @param {PostLocationData} data
   * @return {*}  {Promise<void>}
   * @memberof SurveyService
   */
  async insertSurveyLocations(surveyId: number, data: PostSurveyLocationData): Promise<void> {
    const service = new SurveyLocationService(this.connection);
    return service.insertSurveyLocation(surveyId, data);
  }

  /**
   * Insert, updates and deletes Survey Blocks for a given survey id
   *
   * @param {number} surveyId
   * @param {SurveyBlock[]} blocks
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async upsertBlocks(surveyId: number, blocks: PostSurveyBlock[]): Promise<void> {
    const service = new SurveyBlockService(this.connection);
    return service.upsertSurveyBlocks(surveyId, blocks);
  }

  /**
   * Insert region data.
   *
   * @param {number} projectId
   * @param {Feature[]} features
   * @return {*}  {Promise<void>}
   * @memberof SurveyService
   */
  async insertRegion(projectId: number, features: Feature[]): Promise<void> {
    const regionService = new RegionService(this.connection);
    return regionService.addRegionsToSurveyFromFeatures(projectId, features);
  }

  /**
   * Get survey attachments data for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetAttachmentsData>}
   * @memberof SurveyService
   */
  async getAttachmentsData(surveyId: number): Promise<GetAttachmentsData> {
    return this.surveyRepository.getAttachmentsData(surveyId);
  }

  /**
   * Get survey report attachments for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetReportAttachmentsData>}
   * @memberof SurveyService
   */
  async getReportAttachmentsData(surveyId: number): Promise<GetReportAttachmentsData> {
    return this.surveyRepository.getReportAttachmentsData(surveyId);
  }

  /**
   * Inserts Survey data and returns new survey Id
   *
   * @param {number} projectId
   * @param {PostSurveyObject} surveyData
   * @returns {*} {Promise<number>}
   * @memberof SurveyService
   */
  async insertSurveyData(projectId: number, surveyData: PostSurveyObject): Promise<number> {
    return this.surveyRepository.insertSurveyData(projectId, surveyData);
  }

  /**
   * Inserts new survey_type records associated to the survey.
   *
   * @param {number[]} typeIds
   * @param {number} surveyID
   * @returns {*}  {Promise<void>}
   * @memberof SurveyService
   */
  async insertSurveyTypes(typeIds: number[], surveyId: number): Promise<void> {
    return this.surveyRepository.insertSurveyTypes(typeIds, surveyId);
  }

  /**
   * Inserts a new record and associates focal species to a survey
   *
   * @param {number} focal_species_id
   * @param {number} surveyID
   * @returns {*} {Promise<number>}
   * @memberof SurveyService
   */
  async insertFocalSpecies(focal_species_id: number, surveyId: number): Promise<number> {
    return this.surveyRepository.insertFocalSpecies(focal_species_id, surveyId);
  }

  /**
   * Inserts a new record and associates ancillary species to a survey
   *
   * @param {number} ancillary_species_id
   * @param {number} surveyID
   * @returns {*} {Promise<number>}
   * @memberof SurveyService
   */
  async insertAncillarySpecies(ancillary_species_id: number, surveyId: number): Promise<number> {
    return this.surveyRepository.insertAncillarySpecies(ancillary_species_id, surveyId);
  }

  /**
   * Inserts new record and associated a vantage code to a survey
   *
   * @param {number} vantage_code_id
   * @param {number} surveyID
   * @returns {*} {Promise<number>}
   * @memberof SurveyService
   */
  async insertVantageCodes(vantage_code_id: number, surveyId: number): Promise<number> {
    return this.surveyRepository.insertVantageCodes(vantage_code_id, surveyId);
  }

  /**
   * Inserts proprietor data for a survey
   *
   * @param {PostProprietorData} survey_proprietor
   * @param {number} surveyID
   * @returns {*} {Promise<number | undefined>}
   * @memberof SurveyService
   */
  async insertSurveyProprietor(survey_proprietor: PostProprietorData, surveyId: number): Promise<number | undefined> {
    return this.surveyRepository.insertSurveyProprietor(survey_proprietor, surveyId);
  }

  /**
   * Inserts multiple rows for intended outcomes of a survey.
   *
   * @param {number[]} intended_outcomes
   * @param {number} surveyId
   */
  async insertSurveyIntendedOutcomes(intended_outcomes: number[], surveyId: number): Promise<void> {
    return this.surveyRepository.insertManySurveyIntendedOutcomes(surveyId, intended_outcomes);
  }

  /**
   * Insert or update association of permit to a given survey
   *
   * @param {number} systemUserId
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} permitNumber
   * @param {number} permitType
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async insertOrAssociatePermitToSurvey(
    systemUserId: number,
    projectId: number,
    surveyId: number,
    permitNumber: string,
    permitType: string
  ) {
    if (!permitType) {
      return this.surveyRepository.associateSurveyToPermit(projectId, surveyId, permitNumber);
    } else {
      return this.surveyRepository.insertSurveyPermit(systemUserId, projectId, surveyId, permitNumber, permitType);
    }
  }

  /**
   * Updates provided survey information.
   *
   * @param {number} surveyId
   * @param {PutSurveyObject} putSurveyData
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async updateSurvey(surveyId: number, putSurveyData: PutSurveyObject): Promise<void> {
    const promises: Promise<any>[] = [];
    if (putSurveyData?.survey_details || putSurveyData?.purpose_and_methodology) {
      promises.push(this.updateSurveyDetailsData(surveyId, putSurveyData));
    }

    if (putSurveyData?.survey_details) {
      promises.push(this.updateSurveyTypesData(surveyId, putSurveyData));
    }

    if (putSurveyData?.purpose_and_methodology) {
      promises.push(this.updateSurveyVantageCodesData(surveyId, putSurveyData));
      promises.push(this.updateSurveyIntendedOutcomes(surveyId, putSurveyData));
    }

    if (putSurveyData?.partnerships) {
      promises.push(this.updatePartnershipsData(surveyId, putSurveyData));
    }

    if (putSurveyData?.species) {
      promises.push(this.updateSurveySpeciesData(surveyId, putSurveyData));
    }

    if (putSurveyData?.permit) {
      promises.push(this.updateSurveyPermitData(surveyId, putSurveyData));
    }

    if (putSurveyData?.funding_sources) {
      promises.push(this.upsertSurveyFundingSourceData(surveyId, putSurveyData));
    }
    if (putSurveyData?.proprietor) {
      promises.push(this.updateSurveyProprietorData(surveyId, putSurveyData));
    }

    if (putSurveyData?.locations.length) {
      promises.push(this.insertUpdateDeleteSurveyLocation(surveyId, putSurveyData.locations));
    }

    if (putSurveyData?.participants.length) {
      promises.push(this.upsertSurveyParticipantData(surveyId, putSurveyData));
    }

    // Handle site selection strategies
    if (putSurveyData?.site_selection?.strategies) {
      promises.push(
        this.siteSelectionStrategyService.replaceSurveySiteSelectionStrategies(
          surveyId,
          putSurveyData.site_selection.strategies
        )
      );
    }

    // Handle stratums
    if (putSurveyData?.site_selection?.stratums) {
      promises.push(
        this.siteSelectionStrategyService.replaceSurveySiteSelectionStratums(
          surveyId,
          putSurveyData.site_selection.stratums
        )
      );
    }

    // Handle blocks
    if (putSurveyData?.blocks) {
      promises.push(this.upsertBlocks(surveyId, putSurveyData.blocks));
    }

    await Promise.all(promises);
  }

  /**
   * Handles the create, update and deletion of survey locations based on the given data.
   *
   * @param {number} surveyId
   * @param {PostSurveyLocationData} data
   * @returns {*} {Promise<any[]>}
   */
  async insertUpdateDeleteSurveyLocation(surveyId: number, data: PostSurveyLocationData[]): Promise<any[]> {
    const existingLocations = await this.getSurveyLocationsData(surveyId);
    // compare existing locations with passed in locations
    // any locations not found in both arrays will be deleted
    const deletes = existingLocations.filter(
      (existing) => !data.find((incoming) => incoming?.survey_location_id === existing.survey_location_id)
    );
    const deletePromises = deletes.map((item) => this.deleteSurveyLocation(item.survey_location_id));

    const inserts = data.filter((item) => !item.survey_location_id);
    const insertPromises = inserts.map((item) => this.insertSurveyLocations(surveyId, item));

    const updates = data.filter((item) => item.survey_location_id);
    const updatePromises = updates.map((item) => this.updateSurveyLocation(item));

    return Promise.all([insertPromises, updatePromises, deletePromises]);
  }

  /**
   * Deletes a survey location for the given id. Returns the deleted record
   *
   * @param {number} surveyLocationId Id of the record to delete
   * @returns {*} {Promise<SurveyLocationRecord>} The deleted record
   * @memberof SurveyService
   */
  async deleteSurveyLocation(surveyLocationId: number): Promise<SurveyLocationRecord> {
    const surveyLocationService = new SurveyLocationService(this.connection);
    return surveyLocationService.deleteSurveyLocation(surveyLocationId);
  }

  /**
   * Updates Survey Locations based on the data provided
   *
   * @param {PostSurveyLocationData} data
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async updateSurveyLocation(data: PostSurveyLocationData): Promise<void> {
    const surveyLocationService = new SurveyLocationService(this.connection);
    return surveyLocationService.updateSurveyLocation(data);
  }

  /**
   * Updates Survey details
   *
   * @param {number} surveyID
   * @param {PutSurveyObject} surveyData
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async updateSurveyDetailsData(surveyId: number, surveyData: PutSurveyObject) {
    return this.surveyRepository.updateSurveyDetailsData(surveyId, surveyData);
  }

  /**
   * Updates Survey types data for a given survey ID.
   *
   * @param {number} surveyID
   * @param {PutSurveyObject} surveyData
   * @return {*}  {Promise<void>}
   * @memberof SurveyService
   */
  async updateSurveyTypesData(surveyId: number, surveyData: PutSurveyObject): Promise<void> {
    // Delete existing survey types
    await this.surveyRepository.deleteSurveyTypesData(surveyId);

    // Add new set of survey types, if any
    return this.surveyRepository.insertSurveyTypes(surveyData.survey_details.survey_types, surveyId);
  }

  /**
   * Updates survey species data
   *
   * @param {number} surveyID
   * @param {PutSurveyObject} surveyData
   * @returns {*} {Promise<any[]>}
   * @memberof SurveyService
   */
  async updateSurveySpeciesData(surveyId: number, surveyData: PutSurveyObject) {
    await this.deleteSurveySpeciesData(surveyId);

    const promises: Promise<any>[] = [];

    surveyData.species.focal_species.forEach((focalSpecies: ITaxonomy) =>
      promises.push(this.insertFocalSpecies(focalSpecies.tsn, surveyId))
    );

    surveyData.species.ancillary_species.forEach((ancillarySpecies: ITaxonomy) =>
      promises.push(this.insertAncillarySpecies(ancillarySpecies.tsn, surveyId))
    );

    return Promise.all(promises);
  }

  /**
   * Delete species data for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async deleteSurveySpeciesData(surveyId: number) {
    return this.surveyRepository.deleteSurveySpeciesData(surveyId);
  }

  /**
   * Updates survey participants
   *
   * @param {number} surveyId
   * @param {PutSurveyObject} surveyData
   * @memberof SurveyService
   */
  async upsertSurveyParticipantData(surveyId: number, surveyData: PutSurveyObject) {
    // Get any existing survey participants
    const existingParticipants = await this.surveyParticipationService.getSurveyParticipants(surveyId);

    //Compare input and existing for participants to delete
    const existingParticipantsToDelete = existingParticipants.filter((existingParticipant) => {
      return !surveyData.participants.find(
        (incomingParticipant) => incomingParticipant.system_user_id === existingParticipant.system_user_id
      );
    });

    // Delete any non existing participants
    if (existingParticipantsToDelete.length) {
      const promises: Promise<any>[] = [];

      existingParticipantsToDelete.forEach((participant: any) => {
        promises.push(
          this.surveyParticipationService.deleteSurveyParticipationRecord(participant.survey_participation_id)
        );
      });

      await Promise.all(promises);
    }

    const promises: Promise<any>[] = [];

    // The remaining participants with either update if they have a survey_participation_id
    // or insert new record
    surveyData.participants.forEach((participant) => {
      if (participant.survey_participation_id) {
        // Update participant
        promises.push(
          this.surveyParticipationService.updateSurveyParticipant(
            participant.survey_participation_id,
            participant.survey_job_name
          )
        );
      } else {
        // Create new participant
        promises.push(
          this.surveyParticipationService.insertSurveyParticipant(
            surveyId,
            participant.system_user_id,
            participant.survey_job_name
          )
        );
      }
    });

    await Promise.all(promises);
  }

  /**
   * Updates the list of intended outcomes associated with this survey.
   *
   * @param {number} surveyId
   * @param {PurSurveyObject} surveyData
   */
  async updateSurveyIntendedOutcomes(surveyId: number, surveyData: PutSurveyObject) {
    const purposeMethodInfo = await this.getSurveyPurposeAndMethodology(surveyId);
    const { intended_outcome_ids: currentOutcomeIds } = surveyData.purpose_and_methodology;
    const existingOutcomeIds = purposeMethodInfo.intended_outcome_ids;
    const rowsToInsert = currentOutcomeIds.reduce((acc: number[], curr: number) => {
      if (!existingOutcomeIds.find((existingId) => existingId === curr)) {
        return [...acc, curr];
      }
      return acc;
    }, []);
    const rowsToDelete = existingOutcomeIds.reduce((acc: number[], curr: number) => {
      if (!currentOutcomeIds.find((existingId) => existingId === curr)) {
        return [...acc, curr];
      }
      return acc;
    }, []);

    await this.surveyRepository.insertManySurveyIntendedOutcomes(surveyId, rowsToInsert);
    await this.surveyRepository.deleteManySurveyIntendedOutcomes(surveyId, rowsToDelete);
  }

  /**
   * Compares incoming survey permit data against the existing survey permits, if any, and determines which need to be
   * deleted, added, or updated.
   *
   * @param {number} surveyId
   * @param {PutSurveyObject} surveyData
   * @memberof SurveyService
   */
  async updateSurveyPermitData(surveyId: number, surveyData: PutSurveyObject) {
    const permitService = new PermitService(this.connection);

    // Get any existing permits for this survey
    const existingPermits = await permitService.getPermitBySurveyId(surveyId);

    // Compare the array of existing permits to the array of incoming permits (by permit id) and collect any
    // existing permits that are not in the incoming permit array.
    const existingPermitsToDelete = existingPermits.filter((existingPermit) => {
      // Find all existing permits (by permit id) that have no matching incoming permit id
      return !surveyData.permit.permits.find((incomingPermit) => incomingPermit.permit_id === existingPermit.permit_id);
    });

    // Delete from the database all existing survey permits that have been removed
    if (existingPermitsToDelete.length) {
      const promises: Promise<any>[] = [];

      existingPermitsToDelete.forEach((permit) => {
        promises.push(permitService.deleteSurveyPermit(surveyId, permit.permit_id));
      });

      await Promise.all(promises);
    }

    // The remaining permits are either new, and can be created, or updates to existing permits
    const promises: Promise<any>[] = [];

    surveyData.permit.permits.forEach((permit) => {
      if (permit.permit_id) {
        // Has a permit_id, indicating this is an update to an existing permit
        promises.push(
          permitService.updateSurveyPermit(surveyId, permit.permit_id, permit.permit_number, permit.permit_type)
        );
      } else {
        // No permit_id, indicating this is a new permit which needs to be created
        promises.push(permitService.createSurveyPermit(surveyId, permit.permit_number, permit.permit_type));
      }
    });

    return Promise.all(promises);
  }

  /**
   * Updates survey funding data
   *
   * @param {number} surveyId
   * @param {PutSurveyObject} surveyData
   * @return {*}
   * @memberof SurveyService
   */
  async upsertSurveyFundingSourceData(surveyId: number, surveyData: PutSurveyObject) {
    // Get any existing survey funding sources
    const existingSurveyFundingSources = await this.fundingSourceService.getSurveyFundingSources(surveyId);

    //Compare input and existing for fundings to delete
    const existingSurveyFundingToDelete = existingSurveyFundingSources.filter((existingSurveyFunding) => {
      return !surveyData.funding_sources.find(
        (incomingFunding) => incomingFunding.survey_funding_source_id === existingSurveyFunding.survey_funding_source_id
      );
    });

    // Delete any no existing fundings
    if (existingSurveyFundingToDelete.length) {
      const promises: Promise<any>[] = [];

      existingSurveyFundingToDelete.forEach((surveyFunding: any) => {
        promises.push(this.fundingSourceService.deleteSurveyFundingSource(surveyId, surveyFunding.funding_source_id));
      });

      await Promise.all(promises);
    }

    const promises: Promise<any>[] = [];

    // The remaining funding sources with either update if they have a survey_funding_source_id
    // or insert new record
    surveyData.funding_sources.forEach((fundingSource) => {
      if (fundingSource.survey_funding_source_id) {
        // Update funding source
        promises.push(
          this.fundingSourceService.putSurveyFundingSource(
            surveyId,
            fundingSource.funding_source_id,
            fundingSource.amount,
            fundingSource.revision_count || 0
          )
        );
      } else {
        // Create new funding source
        promises.push(
          this.fundingSourceService.postSurveyFundingSource(
            surveyId,
            fundingSource.funding_source_id,
            fundingSource.amount
          )
        );
      }
    });

    await Promise.all(promises);
  }

  /**
   * Breaks link between permit and survey for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async unassociatePermitFromSurvey(surveyId: number): Promise<void> {
    return this.surveyRepository.unassociatePermitFromSurvey(surveyId);
  }

  /**
   * Updates proprietor data on a survey
   *
   * @param {number} surveyID
   * @param {PutSurveyObject} surveyData
   * @param {PutSurveyObject}
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async updateSurveyProprietorData(surveyId: number, surveyData: PutSurveyObject) {
    await this.deleteSurveyProprietorData(surveyId);

    if (!surveyData.proprietor.survey_data_proprietary) {
      return;
    }

    return this.insertSurveyProprietor(surveyData.proprietor, surveyId);
  }

  /**
   * Deletes proprietor data for a given survey
   *
   * @param {number} surveyID
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async deleteSurveyProprietorData(surveyId: number): Promise<void> {
    return this.surveyRepository.deleteSurveyProprietorData(surveyId);
  }

  /**
   * Updates all partnership records for the given survey, first by removing all partnership
   * records for the survey, then inserting new partnership records according to the given
   * survey object.
   *
   * @param {number} surveyId
   * @param {PutSurveyObject} surveyData
   * @return {*}  {Promise<void>}
   * @memberof SurveyService
   */
  async updatePartnershipsData(surveyId: number, surveyData: PutSurveyObject): Promise<void> {
    const putPartnershipsData = (surveyData?.partnerships && new PutPartnershipsData(surveyData.partnerships)) || null;

    // Remove existing partnership records
    await this.surveyRepository.deleteIndigenousPartnershipsData(surveyId);
    await this.surveyRepository.deleteStakeholderPartnershipsData(surveyId);

    // Insert new partnership records
    if (putPartnershipsData?.indigenous_partnerships) {
      await this.insertIndigenousPartnerships(putPartnershipsData?.indigenous_partnerships, surveyId);
    }

    if (putPartnershipsData?.stakeholder_partnerships) {
      await this.insertStakeholderPartnerships(putPartnershipsData?.stakeholder_partnerships, surveyId);
    }
  }

  /**
   * Inserts indigenous partnership records for the given survey
   *
   * @param {number[]} firstNationsIds
   * @param {number} surveyId
   * @return {*}  {Promise<{ survey_first_nation_partnership_id: number }[]>}
   * @memberof SurveyService
   */
  async insertIndigenousPartnerships(
    firstNationsIds: number[],
    surveyId: number
  ): Promise<{ survey_first_nation_partnership_id: number }[]> {
    return this.surveyRepository.insertIndigenousPartnerships(firstNationsIds, surveyId);
  }

  /**
   * Inserts stakeholder partnership records for the given survey
   *
   * @param {string[]} stakeholderPartners
   * @param {number} surveyId
   * @return {*}  {Promise<{ survey_stakeholder_partnership_id: number }[]>}
   * @memberof SurveyService
   */
  async insertStakeholderPartnerships(
    stakeholderPartners: string[],
    surveyId: number
  ): Promise<{ survey_stakeholder_partnership_id: number }[]> {
    return this.surveyRepository.insertStakeholderPartnerships(stakeholderPartners, surveyId);
  }

  /**
   * Updates vantage codes associated to a survey
   *
   * @param {number} surveyID
   * @param {PutSurveyObject} surveyData
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async updateSurveyVantageCodesData(surveyId: number, surveyData: PutSurveyObject) {
    await this.deleteSurveyVantageCodes(surveyId);

    const promises: Promise<number>[] = [];

    if (surveyData.purpose_and_methodology.vantage_code_ids) {
      surveyData.purpose_and_methodology.vantage_code_ids.forEach((vantageCodeId: number) =>
        promises.push(this.insertVantageCodes(vantageCodeId, surveyId))
      );
    }

    return Promise.all(promises);
  }

  /**
   * Breaks link between vantage codes and a survey fora  given survey Id
   *
   * @param {number} surveyID
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async deleteSurveyVantageCodes(surveyId: number): Promise<void> {
    return this.surveyRepository.deleteSurveyVantageCodes(surveyId);
  }

  /**
   * Deletes a survey for a given ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async deleteSurvey(surveyId: number): Promise<void> {
    return this.surveyRepository.deleteSurvey(surveyId);
  }

  /**
   * Inserts a survey occurrence submission row.
   *
   * @param {IObservationSubmissionInsertDetails} submission The details of the submission
   * @return {*} {Promise<{ submissionId: number }>} Promise resolving the ID of the submission upon successful insertion
   */
  async insertSurveyOccurrenceSubmission(
    submission: IObservationSubmissionInsertDetails
  ): Promise<{ submissionId: number }> {
    return this.surveyRepository.insertSurveyOccurrenceSubmission(submission);
  }

  /**
   * Updates a survey occurrence submission with the given details.
   *
   * @param {IObservationSubmissionUpdateDetails} submission The details of the submission to be updated
   * @return {*} {Promise<{ submissionId: number }>} Promise resolving the ID of the submission upon successfully updating it
   */
  async updateSurveyOccurrenceSubmission(
    submission: IObservationSubmissionUpdateDetails
  ): Promise<{ submissionId: number }> {
    return this.surveyRepository.updateSurveyOccurrenceSubmission(submission);
  }

  /**
   * Soft-deletes an occurrence submission.
   *
   * @param {number} submissionId The ID of the submission to soft delete
   * @returns {*} {number} The row count of the affected records, namely `1` if the delete succeeds, `0` if it does not
   */
  async deleteOccurrenceSubmission(submissionId: number): Promise<number> {
    return this.surveyRepository.deleteOccurrenceSubmission(submissionId);
  }

  /**
   * Publish status for a given survey id
   *
   * @param {number} surveyId
   * @return {*}  {Promise<PublishStatus>}
   * @memberof SurveyService
   */
  async surveyPublishStatus(surveyId: number): Promise<PublishStatus> {
    const surveyAttachmentsPublishStatus = await this.historyPublishService.surveyAttachmentsPublishStatus(surveyId);

    const surveyReportsPublishStatus = await this.historyPublishService.surveyReportsPublishStatus(surveyId);

    const observationPublishStatus = await this.historyPublishService.observationPublishStatus(surveyId);

    const summaryPublishStatus = await this.historyPublishService.summaryPublishStatus(surveyId);

    if (
      surveyAttachmentsPublishStatus === PublishStatus.NO_DATA &&
      surveyReportsPublishStatus === PublishStatus.NO_DATA &&
      observationPublishStatus === PublishStatus.NO_DATA &&
      summaryPublishStatus === PublishStatus.NO_DATA
    ) {
      return PublishStatus.NO_DATA;
    }

    if (
      surveyAttachmentsPublishStatus === PublishStatus.UNSUBMITTED ||
      surveyReportsPublishStatus === PublishStatus.UNSUBMITTED ||
      observationPublishStatus === PublishStatus.UNSUBMITTED ||
      summaryPublishStatus === PublishStatus.UNSUBMITTED
    ) {
      return PublishStatus.UNSUBMITTED;
    }

    return PublishStatus.SUBMITTED;
  }
}
