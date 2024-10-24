import { flatten } from 'lodash';
import { IDBConnection } from '../database/db';
import { PostProprietorData, PostSurveyObject } from '../models/survey-create';
import { PostSurveyLocationData, PutPartnershipsData, PutSurveyObject } from '../models/survey-update';
import {
  FindSurveysResponse,
  GetAttachmentsData,
  GetFocalSpeciesData,
  GetPermitData,
  GetReportAttachmentsData,
  GetSurveyData,
  GetSurveyFundingSourceData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData,
  ISurveyAdvancedFilters,
  ISurveyPartnerships,
  SurveyObject,
  SurveySupplementaryData
} from '../models/survey-view';
import { PostSurveyBlock, SurveyBlockRecordWithCount } from '../repositories/survey-block-repository';
import { SurveyLocationRecord } from '../repositories/survey-location-repository';
import { ISurveyProprietorModel, SurveyBasicFields, SurveyRepository } from '../repositories/survey-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';
import { FundingSourceService } from './funding-source-service';
import { HistoryPublishService } from './history-publish-service';
import { PermitService } from './permit-service';
import { ITaxonomyWithEcologicalUnits, PlatformService } from './platform-service';
import { RegionService } from './region-service';
import { SiteSelectionStrategyService } from './site-selection-strategy-service';
import { SurveyBlockService } from './survey-block-service';
import { SurveyLocationService } from './survey-location-service';
import { SurveyParticipationService } from './survey-participation-service';

export class SurveyService extends DBService {
  surveyRepository: SurveyRepository;
  platformService: PlatformService;
  historyPublishService: HistoryPublishService;
  fundingSourceService: FundingSourceService;
  siteSelectionStrategyService: SiteSelectionStrategyService;
  surveyParticipationService: SurveyParticipationService;
  regionService: RegionService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.surveyRepository = new SurveyRepository(connection);
    this.platformService = new PlatformService(connection);
    this.historyPublishService = new HistoryPublishService(connection);
    this.fundingSourceService = new FundingSourceService(connection);
    this.siteSelectionStrategyService = new SiteSelectionStrategyService(connection);
    this.surveyParticipationService = new SurveyParticipationService(connection);
    this.regionService = new RegionService(connection);
  }

  /**
   * Get Survey IDs for a project ID
   *
   * @param {number} projectId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof SurveyService
   */
  async getSurveyIdsByProjectId(projectId: number): Promise<{ id: number }[]> {
    return this.surveyRepository.getSurveyIdsByProjectId(projectId);
  }

  /**
   * Gets all information of a Survey for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<SurveyObject>}
   * @memberof SurveyService
   */
  async getSurveyById(surveyId: number): Promise<SurveyObject> {
    const surveyData = await Promise.all([
      this.getSurveyData(surveyId),
      this.getSpeciesData(surveyId),
      this.getPermitData(surveyId),
      this.getSurveyFundingSourceData(surveyId),
      this.getSurveyPartnershipsData(surveyId),
      this.getSurveyPurposeAndMethodology(surveyId),
      this.getSurveyProprietorDataForView(surveyId),
      this.getSurveyLocationsData(surveyId),
      this.surveyParticipationService.getSurveyParticipants(surveyId),
      this.siteSelectionStrategyService.getSiteSelectionDataBySurveyId(surveyId),
      this.getSurveyBlocksForSurveyId(surveyId)
    ]);

    return {
      survey_details: surveyData[0],
      species: surveyData[1],
      permit: surveyData[2],
      funding_sources: surveyData[3],
      partnerships: surveyData[4],
      purpose_and_methodology: surveyData[5],
      proprietor: surveyData[6],
      locations: surveyData[7],
      participants: surveyData[8],
      site_selection: surveyData[9],
      blocks: surveyData[10]
    };
  }

  async getSurveyBlocksForSurveyId(surveyId: number): Promise<SurveyBlockRecordWithCount[]> {
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
   * @param {number} surveyId
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
   * @param {number} surveyId
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
   * @param {number} surveyId
   * @returns {*} {Promise<GetFocalSpeciesData>}
   * @memberof SurveyService
   */
  async getSpeciesData(surveyId: number): Promise<GetFocalSpeciesData> {
    // Fetch species data for the survey
    const studySpeciesResponse = await this.surveyRepository.getSpeciesData(surveyId);

    // Fetch taxonomy data for each survey species
    const taxonomyResponse = await this.platformService.getTaxonomyByTsns(
      studySpeciesResponse.map((species) => species.itis_tsn)
    );

    const focalSpecies = [];

    for (const species of studySpeciesResponse) {
      const taxon = taxonomyResponse.find((taxonomy) => Number(taxonomy.tsn) === species.itis_tsn) ?? {};
      focalSpecies.push({ ...taxon, tsn: species.itis_tsn, ecological_units: species.ecological_units });
    }

    // Return the combined data
    return new GetFocalSpeciesData(focalSpecies);
  }

  /**
   * Get Survey permit data for a given survey ID
   *
   * @param {number} surveyId
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
   * @param {number} surveyId
   * @returns {*} {Promise<GetSurveyPurposeAndMethodologyData>}
   * @memberof SurveyService
   */
  async getSurveyPurposeAndMethodology(surveyId: number): Promise<GetSurveyPurposeAndMethodologyData> {
    return this.surveyRepository.getSurveyPurposeAndMethodology(surveyId);
  }

  /**
   * Gets proprietor data for view or null for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<GetSurveyProprietorData | null>}
   * @memberof SurveyService
   */
  async getSurveyProprietorDataForView(surveyId: number): Promise<GetSurveyProprietorData | null> {
    return this.surveyRepository.getSurveyProprietorDataForView(surveyId);
  }

  /**
   * Get Survey location for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<GetSurveyLocationData[]>}
   * @memberof SurveyService
   */
  async getSurveyLocationsData(surveyId: number): Promise<SurveyLocationRecord[]> {
    const service = new SurveyLocationService(this.connection);
    return service.getSurveyLocationsData(surveyId);
  }

  /**
   * Gets the Proprietor Data to be be submitted
   * to BioHub as a Security Request
   *
   * @param {number} surveyId
   * @returns {*} {Promise<ISurveyProprietorModel>}
   * @memberof SurveyService
   */
  async getSurveyProprietorDataForSecurityRequest(surveyId: number): Promise<ISurveyProprietorModel> {
    return this.surveyRepository.getSurveyProprietorDataForSecurityRequest(surveyId);
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
   * Fetches a subset of survey fields for a paginated list of surveys under
   * a given project.
   *
   * @param {number} projectId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyBasicFields[]>}
   * @memberof SurveyService
   */
  async getSurveysBasicFieldsByProjectId(
    projectId: number,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyBasicFields[]> {
    const surveys = await this.surveyRepository.getSurveysBasicFieldsByProjectId(projectId, pagination);

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
        .filter((item) => survey.focal_species.includes(item.tsn))
        .map((item) => [item.commonNames, `(${item.scientificName})`].filter(Boolean).join(' '));

      decoratedSurveys.push({ ...survey, focal_species_names: matchingFocalSpeciesNames });
    }

    return decoratedSurveys;
  }

  /**
   * Returns the total number of surveys belonging to the given project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async getSurveyCountByProjectId(projectId: number): Promise<number> {
    return this.surveyRepository.getSurveyCountByProjectId(projectId);
  }

  /**
   * Retrieves the paginated list of all surveys that are available to the user, based on their permissions and provided
   * filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ISurveyAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof SurveyRepository
   */
  async findSurveys(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ISurveyAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindSurveysResponse[]> {
    return this.surveyRepository.findSurveys(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Retrieves the count of all surveys that are available to the user, based on their permissions and provided filter
   * criteria.
   *
   * @param {ISurveyAdvancedFilters} filterFields
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async findSurveysCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ISurveyAdvancedFilters
  ): Promise<number> {
    return this.surveyRepository.findSurveysCount(isUserAdmin, systemUserId, filterFields);
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
    // If there are ecological units, insert them
    promises.push(
      Promise.all(
        postSurveyData.species.focal_species.map((species: ITaxonomyWithEcologicalUnits) => {
          if (species.ecological_units.length) {
            this.insertFocalSpeciesWithUnits(species, surveyId);
          } else {
            this.insertFocalSpecies(species.tsn, surveyId);
          }
        })
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

    if (postSurveyData.locations) {
      // Insert survey locations
      promises.push(Promise.all(postSurveyData.locations.map((item) => this.insertSurveyLocations(surveyId, item))));
      // Insert survey regions
      const features = flatten(postSurveyData.locations.map((location) => location.geojson));
      promises.push(this.regionService.insertRegionsIntoSurveyFromFeatures(surveyId, features));
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
   * Get survey attachments data for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<GetAttachmentsData>}
   * @memberof SurveyService
   */
  async getAttachmentsData(surveyId: number): Promise<GetAttachmentsData> {
    return this.surveyRepository.getAttachmentsData(surveyId);
  }

  /**
   * Get survey report attachments for a given survey ID
   *
   * @param {number} surveyId
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
   * @param {number} surveyId
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
   * @param {number} surveyId
   * @returns {*} {Promise<number>}
   * @memberof SurveyService
   */
  async insertFocalSpecies(focal_species_id: number, surveyId: number): Promise<number> {
    return this.surveyRepository.insertFocalSpecies(focal_species_id, surveyId);
  }

  /**
   * Inserts a new focal species record and associates it with ecological units for a survey.
   *
   * @param {ITaxonomyWithEcologicalUnits[]} taxonWithUnits - Array of species with ecological unit objects to associate.
   * @param {number} surveyId - ID of the survey.
   * @returns {Promise<number>} - The ID of the newly created focal species.
   * @memberof SurveyService
   */
  async insertFocalSpeciesWithUnits(taxonWithUnits: ITaxonomyWithEcologicalUnits, surveyId: number): Promise<number> {
    // Insert the new focal species and get its ID
    const studySpeciesId = await this.surveyRepository.insertFocalSpecies(taxonWithUnits.tsn, surveyId);

    // Insert ecological units associated with the newly created focal species
    await Promise.all(
      taxonWithUnits.ecological_units.map((unit) => this.surveyRepository.insertFocalSpeciesUnits(unit, studySpeciesId))
    );

    return studySpeciesId;
  }

  /**
   * Inserts proprietor data for a survey
   *
   * @param {PostProprietorData} survey_proprietor
   * @param {number} surveyId
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
   * @returns {*} {Promise<void>}
   */
  async insertUpdateDeleteSurveyLocation(surveyId: number, data: PostSurveyLocationData[]): Promise<void> {
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

    const features = flatten(data.map((item) => item.geojson));

    await Promise.all([
      // Patch survey locations
      insertPromises,
      updatePromises,
      deletePromises,
      // Insert regions into survey - maps to NRM regions
      this.regionService.insertRegionsIntoSurveyFromFeatures(surveyId, features)
    ]);
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
   * @param {number} surveyId
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
   * @param {number} surveyId
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
   * @param {number} surveyId
   * @param {PutSurveyObject} surveyData
   * @returns {*} {Promise<any[]>}
   * @memberof SurveyService
   */
  async updateSurveySpeciesData(surveyId: number, surveyData: PutSurveyObject) {
    // Delete any ecological units associated with the focal species record
    await this.deleteSurveySpeciesUnitData(surveyId);
    await this.deleteSurveySpeciesData(surveyId);

    const promises: Promise<any>[] = [];

    surveyData.species.focal_species.forEach((focalSpecies: ITaxonomyWithEcologicalUnits) =>
      promises.push(this.insertFocalSpeciesWithUnits(focalSpecies, surveyId))
    );

    return Promise.all(promises);
  }

  /**
   * Delete species data for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async deleteSurveySpeciesData(surveyId: number) {
    return this.surveyRepository.deleteSurveySpeciesData(surveyId);
  }

  /**
   * Delete focal ecological units for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async deleteSurveySpeciesUnitData(surveyId: number) {
    return this.surveyRepository.deleteSurveySpeciesUnitData(surveyId);
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
          this.surveyParticipationService.deleteSurveyParticipationRecord(surveyId, participant.survey_participation_id)
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
          this.surveyParticipationService.updateSurveyParticipantJob(
            surveyId,
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
   * @param {number} surveyId
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async unassociatePermitFromSurvey(surveyId: number): Promise<void> {
    return this.surveyRepository.unassociatePermitFromSurvey(surveyId);
  }

  /**
   * Updates proprietor data on a survey
   *
   * @param {number} surveyId
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
   * @param {number} surveyId
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
   * Deletes a survey for a given ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<void>}
   * @memberof SurveyService
   */
  async deleteSurvey(surveyId: number): Promise<void> {
    return this.surveyRepository.deleteSurvey(surveyId);
  }
}
