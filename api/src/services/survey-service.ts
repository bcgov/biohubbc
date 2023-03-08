import { MESSAGE_CLASS_NAME, SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { PostProprietorData, PostSurveyObject } from '../models/survey-create';
import { PutSurveyObject } from '../models/survey-update';
import {
  GetAncillarySpeciesData,
  GetAttachmentsData,
  GetFocalSpeciesData,
  GetPermitData,
  GetReportAttachmentsData,
  GetSurveyData,
  GetSurveyFundingSources,
  GetSurveyLocationData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData,
  SurveyObject,
  SurveySupplementaryData
} from '../models/survey-view';
import { AttachmentRepository } from '../repositories/attachment-repository';
import {
  IGetLatestSurveyOccurrenceSubmission,
  IObservationSubmissionInsertDetails,
  IObservationSubmissionUpdateDetails,
  IOccurrenceSubmissionMessagesResponse,
  ISurveyProprietorModel,
  SurveyRepository
} from '../repositories/survey-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';
import { PermitService } from './permit-service';
import { PlatformService } from './platform-service';
import { TaxonomyService } from './taxonomy-service';

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

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
    this.surveyRepository = new SurveyRepository(connection);
    this.platformService = new PlatformService(connection);
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
    const [
      surveyData,
      speciesData,
      permitData,
      fundingData,
      purposeAndMethodologyData,
      proprietorData,
      locationData
    ] = await Promise.all([
      this.getSurveyData(surveyId),
      this.getSpeciesData(surveyId),
      this.getPermitData(surveyId),
      this.getSurveyFundingSourcesData(surveyId),
      this.getSurveyPurposeAndMethodology(surveyId),
      this.getSurveyProprietorDataForView(surveyId),
      this.getSurveyLocationData(surveyId)
    ]);

    return {
      survey_details: surveyData,
      species: speciesData,
      permit: permitData,
      purpose_and_methodology: purposeAndMethodologyData,
      funding: fundingData,
      proprietor: proprietorData,
      location: locationData
    };
  }

  /**
   * Get Survey supplementary data for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<SurveySupplementaryData>}
   * @memberof SurveyService
   */
  async getSurveySupplementaryDataById(surveyId: number): Promise<SurveySupplementaryData> {
    const [submissionId, summaryResultId] = await Promise.all([
      this.getOccurrenceSubmissionId(surveyId),
      this.getSummaryResultId(surveyId)
    ]);

    return {
      occurrence_submission: submissionId,
      summary_result: summaryResultId
    };
  }

  /**
   * Gets Survey data for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetSurveyData>}
   * @memberof SurveyService
   */
  async getSurveyData(surveyId: number): Promise<GetSurveyData> {
    return this.surveyRepository.getSurveyData(surveyId);
  }

  /**
   * Get associated species data for a survey from the taxonomic service for a given Survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetFocalSpeciesData & GetAncillarySpeciesData>}
   * @memberof SurveyService
   */
  async getSpeciesData(surveyId: number): Promise<GetFocalSpeciesData & GetAncillarySpeciesData> {
    const response = await this.surveyRepository.getSpeciesData(surveyId);

    const focalSpeciesIds = response.filter((item) => item.is_focal).map((item) => item.wldtaxonomic_units_id);
    const ancillarySpeciesIds = response.filter((item) => !item.is_focal).map((item) => item.wldtaxonomic_units_id);

    const taxonomyService = new TaxonomyService();

    const focalSpecies = await taxonomyService.getSpeciesFromIds(focalSpeciesIds);
    const ancillarySpecies = await taxonomyService.getSpeciesFromIds(ancillarySpeciesIds);

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
   * Get Survey funding sources for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<GetSurveyFundingSources>}
   * @memberof SurveyService
   */
  async getSurveyFundingSourcesData(surveyId: number): Promise<GetSurveyFundingSources> {
    return this.surveyRepository.getSurveyFundingSourcesData(surveyId);
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
   * @returns {*} {Promise<GetSurveyLocationData>}
   * @memberof SurveyService
   */
  async getSurveyLocationData(surveyId: number): Promise<GetSurveyLocationData> {
    return this.surveyRepository.getSurveyLocationData(surveyId);
  }

  /**
   * Get Occurrence Submission Id for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<number>}
   * @memberof SurveyService
   */
  async getOccurrenceSubmissionId(surveyId: number): Promise<number> {
    return this.surveyRepository.getOccurrenceSubmissionId(surveyId);
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

  async getSummaryResultId(surveyId: number): Promise<number> {
    return this.surveyRepository.getSummaryResultId(surveyId);
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

    return this.getSurveysByIds(surveyIds.map((survey) => survey.id))
  }

  /**
   * Creates a new survey for a project and returns survey ID
   *
   * @param {number} projectId
   * @param {PostSurveyObject} postSurveyData
   * @returns {*} {Promise<number>}
   * @memberof SurveyService
   */
  async createSurvey(projectId: number, postSurveyData: PostSurveyObject): Promise<number> {
    const surveyId = await this.insertSurveyData(projectId, postSurveyData);

    const promises: Promise<any>[] = [];

    // Handle focal species associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.species.focal_species.map((speciesId: number) => this.insertFocalSpecies(speciesId, surveyId))
      )
    );

    // Handle ancillary species associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.species.ancillary_species.map((speciesId: number) =>
          this.insertAncillarySpecies(speciesId, surveyId)
        )
      )
    );

    // Handle inserting any permit associated to this survey
    const permitService = new PermitService(this.connection);
    promises.push(
      Promise.all(
        postSurveyData.permit.permits.map((permit) =>
          permitService.createSurveyPermit(surveyId, permit.permit_number, permit.permit_type)
        )
      )
    );

    // Handle inserting any funding sources associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.funding.funding_sources.map((fsId: number) => this.insertSurveyFundingSource(fsId, surveyId))
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

    await Promise.all(promises);

    //Update Eml to biohub and publish record
    await this.platformService.submitAndPublishDwcAMetadata(projectId, surveyId);

    return surveyId;
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
   * Inserts new record and associates funding source to a survey
   *
   * @param {number} funding_source_id
   * @param {number} surveyID
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async insertSurveyFundingSource(funding_source_id: number, surveyId: number) {
    return this.surveyRepository.insertSurveyFundingSource(funding_source_id, surveyId);
  }

  /**
   * Updates provided survey information and submits to BioHub
   *
   * @param {number} surveyId
   * @param {PutSurveyObject} putSurveyData
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async updateSurvey(surveyId: number, putSurveyData: PutSurveyObject): Promise<void> {
    const promises: Promise<any>[] = [];

    if (putSurveyData?.survey_details || putSurveyData?.purpose_and_methodology || putSurveyData?.location) {
      promises.push(this.updateSurveyDetailsData(surveyId, putSurveyData));
    }

    if (putSurveyData?.purpose_and_methodology) {
      promises.push(this.updateSurveyVantageCodesData(surveyId, putSurveyData));
    }

    if (putSurveyData?.species) {
      promises.push(this.updateSurveySpeciesData(surveyId, putSurveyData));
    }

    if (putSurveyData?.permit) {
      promises.push(this.updateSurveyPermitData(surveyId, putSurveyData));
    }

    if (putSurveyData?.funding) {
      promises.push(this.updateSurveyFundingData(surveyId, putSurveyData));
    }

    if (putSurveyData?.proprietor) {
      promises.push(this.updateSurveyProprietorData(surveyId, putSurveyData));
    }

    await Promise.all(promises);

    const surveyData = await this.getSurveyById(surveyId);

    // Update Eml to biohub and publish record
    return this.platformService.submitAndPublishDwcAMetadata(surveyData.survey_details.project_id, surveyId);
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
   * Updates survey species data
   *
   * @param {number} surveyID
   * @param {PutSurveyObject} surveyData
   * @returns {*} {Promise<any[]>}
   * @memberof SurveyService
   */
  async updateSurveySpeciesData(surveyId: number, surveyData: PutSurveyObject) {
    this.deleteSurveySpeciesData(surveyId);

    const promises: Promise<any>[] = [];

    surveyData.species.focal_species.forEach((focalSpeciesId: number) =>
      promises.push(this.insertFocalSpecies(focalSpeciesId, surveyId))
    );

    surveyData.species.ancillary_species.forEach((ancillarySpeciesId: number) =>
      promises.push(this.insertAncillarySpecies(ancillarySpeciesId, surveyId))
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
   * Updates a Survey funding source for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<any[]>}
   * @memberof SurveyService
   */
  async updateSurveyFundingData(surveyId: number, surveyData: PutSurveyObject) {
    await this.deleteSurveyFundingSourcesData(surveyId);

    const promises: Promise<any>[] = [];

    surveyData.funding.funding_sources.forEach((fsId: number) =>
      promises.push(this.insertSurveyFundingSource(fsId, surveyId))
    );

    return Promise.all(promises);
  }

  /**
   * Breaks link between a funding source and a survey for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async deleteSurveyFundingSourcesData(surveyId: number): Promise<void> {
    return this.surveyRepository.deleteSurveyFundingSourcesData(surveyId);
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
}
