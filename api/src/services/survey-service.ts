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
import { IGetLatestSurveyOccurrenceSubmission, SurveyRepository } from '../repositories/survey-repository';
import { DBService } from './db-service';
import { PermitService } from './permit-service';
import { TaxonomyService } from './taxonomy-service';

export class SurveyService extends DBService {
  attachmentRepository: AttachmentRepository;
  surveyRepository: SurveyRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
    this.surveyRepository = new SurveyRepository(connection);
  }

  async getSurveyIdsByProjectId(projectId: number): Promise<{ id: number }[]> {
    return this.surveyRepository.getSurveyIdsByProjectId(projectId);
  }

  async getSurveyById(surveyId: number): Promise<SurveyObject> {
    const [
      surveyData,
      speciesData,
      permitData,
      fundingData,
      purposeAndMethodologyData,
      proprietorData,
      locationData,
      countDocumentsPendingReview
    ] = await Promise.all([
      this.getSurveyData(surveyId),
      this.getSpeciesData(surveyId),
      this.getPermitData(surveyId),
      this.getSurveyFundingSourcesData(surveyId),
      this.getSurveyPurposeAndMethodology(surveyId),
      this.getSurveyProprietorDataForView(surveyId),
      this.getSurveyLocationData(surveyId),
      this.getCountDocumentsPendingReview(surveyId)
    ]);

    return {
      survey_details: surveyData,
      species: speciesData,
      permit: permitData,
      purpose_and_methodology: purposeAndMethodologyData,
      funding: fundingData,
      proprietor: proprietorData,
      location: locationData,
      docs_to_be_reviewed: countDocumentsPendingReview
    };
  }

  async getSurveySupplementaryDataById(surveyId: number): Promise<SurveySupplementaryData> {
    const [occurrenceSubmissionId, summaryResultId] = await Promise.all([
      this.getOccurrenceSubmissionId(surveyId),
      this.getSummaryResultId(surveyId)
    ]);

    return {
      occurrence_submission: occurrenceSubmissionId,
      summary_result: summaryResultId
    };
  }

  async getSurveyData(surveyId: number): Promise<GetSurveyData> {
    return this.surveyRepository.getSurveyData(surveyId);
  }

  async getSpeciesData(surveyId: number): Promise<GetFocalSpeciesData & GetAncillarySpeciesData> {
    const response = await this.surveyRepository.getSpeciesData(surveyId);

    const focalSpeciesIds = response.filter((item) => item.is_focal).map((item) => item.wldtaxonomic_units_id);
    const ancillarySpeciesIds = response.filter((item) => !item.is_focal).map((item) => item.wldtaxonomic_units_id);

    const taxonomyService = new TaxonomyService();

    const focalSpecies = await taxonomyService.getSpeciesFromIds(focalSpeciesIds);
    const ancillarySpecies = await taxonomyService.getSpeciesFromIds(ancillarySpeciesIds);

    return { ...new GetFocalSpeciesData(focalSpecies), ...new GetAncillarySpeciesData(ancillarySpecies) };
  }

  async getPermitData(surveyId: number): Promise<GetPermitData> {
    const permitService = new PermitService(this.connection);

    const result = await permitService.getPermitBySurveyId(surveyId);

    return new GetPermitData(result);
  }

  async getSurveyPurposeAndMethodology(surveyId: number): Promise<GetSurveyPurposeAndMethodologyData> {
    return this.surveyRepository.getSurveyPurposeAndMethodology(surveyId);
  }

  async getSurveyFundingSourcesData(surveyId: number): Promise<GetSurveyFundingSources> {
    return this.surveyRepository.getSurveyFundingSourcesData(surveyId);
  }

  async getSurveyProprietorDataForView(surveyId: number): Promise<GetSurveyProprietorData> {
    return this.surveyRepository.getSurveyProprietorDataForView(surveyId);
  }

  async getSurveyLocationData(surveyId: number): Promise<GetSurveyLocationData> {
    return this.surveyRepository.getSurveyLocationData(surveyId);
  }

  async getOccurrenceSubmissionId(surveyId: number): Promise<number> {
    return this.surveyRepository.getOccurrenceSubmissionId(surveyId);
  }

  async getLatestSurveyOccurrenceSubmission(surveyId: number): Promise<IGetLatestSurveyOccurrenceSubmission> {
    return this.surveyRepository.getLatestSurveyOccurrenceSubmission(surveyId);
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

    return surveyId;
  }

  async getAttachmentsData(surveyId: number): Promise<GetAttachmentsData> {
    return this.surveyRepository.getAttachmentsData(surveyId);
  }

  async getReportAttachmentsData(surveyId: number): Promise<GetReportAttachmentsData> {
    return this.surveyRepository.getReportAttachmentsData(surveyId);
  }

  async insertSurveyData(projectId: number, surveyData: PostSurveyObject): Promise<number> {
    return this.surveyRepository.insertSurveyData(projectId, surveyData);
  }

  async insertFocalSpecies(focal_species_id: number, surveyId: number): Promise<number> {
    return this.surveyRepository.insertFocalSpecies(focal_species_id, surveyId);
  }

  async insertAncillarySpecies(ancillary_species_id: number, surveyId: number): Promise<number> {
    return this.surveyRepository.insertAncillarySpecies(ancillary_species_id, surveyId);
  }

  async insertVantageCodes(vantage_code_id: number, surveyId: number): Promise<number> {
    return this.surveyRepository.insertVantageCodes(vantage_code_id, surveyId);
  }

  async insertSurveyProprietor(survey_proprietor: PostProprietorData, surveyId: number): Promise<number | undefined> {
    return this.surveyRepository.insertSurveyProprietor(survey_proprietor, surveyId);
  }

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

  async insertSurveyFundingSource(funding_source_id: number, surveyId: number) {
    return this.surveyRepository.insertSurveyFundingSource(funding_source_id, surveyId);
  }

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
  }

  async updateSurveyDetailsData(surveyId: number, surveyData: PutSurveyObject) {
    return this.surveyRepository.updateSurveyDetailsData(surveyId, surveyData);
  }

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

  async unassociatePermitFromSurvey(surveyId: number): Promise<void> {
    return this.surveyRepository.unassociatePermitFromSurvey(surveyId);
  }

  async updateSurveyFundingData(surveyId: number, surveyData: PutSurveyObject) {
    await this.deleteSurveyFundingSourcesData(surveyId);

    const promises: Promise<any>[] = [];

    surveyData.funding.funding_sources.forEach((fsId: number) =>
      promises.push(this.insertSurveyFundingSource(fsId, surveyId))
    );

    return Promise.all(promises);
  }

  async deleteSurveyFundingSourcesData(surveyId: number): Promise<void> {
    return this.surveyRepository.deleteSurveyFundingSourcesData(surveyId);
  }

  async updateSurveyProprietorData(surveyId: number, surveyData: PutSurveyObject) {
    await this.deleteSurveyProprietorData(surveyId);

    if (!surveyData.proprietor.survey_data_proprietary) {
      return;
    }

    return this.insertSurveyProprietor(surveyData.proprietor, surveyId);
  }

  async deleteSurveyProprietorData(surveyId: number): Promise<void> {
    return this.surveyRepository.deleteSurveyProprietorData(surveyId);
  }

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

  async deleteSurveyVantageCodes(surveyId: number): Promise<void> {
    return this.surveyRepository.deleteSurveyVantageCodes(surveyId);
  }

  async getCountDocumentsPendingReview(surveyId: number): Promise<number> {
    const attachmentsCount = await this.attachmentRepository.getSurveyAttachmentCountToReview(surveyId);

    const reportsCount = await this.attachmentRepository.getSurveyReportCountToReview(surveyId);

    const documentCount = Number(attachmentsCount[0]) + Number(reportsCount[0]);

    return documentCount;
  }

  async deleteSurvey(surveyId: number): Promise<void> {
    return this.surveyRepository.deleteSurvey(surveyId);
  }
}
