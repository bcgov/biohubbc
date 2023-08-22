import { region, regional_offices } from '../constants/codes';
import { IDBConnection } from '../database/db';
import { CodeRepository, IAllCodeSets } from '../repositories/code-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';

const defaultLog = getLogger('services/code-queries');

export class CodeService extends DBService {
  codeRepository: CodeRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.codeRepository = new CodeRepository(connection);
  }
  /**
   * Function that fetches all code sets.
   *
   * @return {*}  {Promise<IAllCodeSets>} an object containing all code sets
   * @memberof CodeService
   */
  async getAllCodeSets(): Promise<IAllCodeSets> {
    defaultLog.debug({ message: 'getAllCodeSets' });

    const [
      management_action_type,
      first_nations,
      agency,
      investment_action_category,
      type,
      iucn_conservation_action_level_1_classification,
      iucn_conservation_action_level_2_subclassification,
      iucn_conservation_action_level_3_subclassification,
      proprietor_type,
      program,
      system_roles,
      project_roles,
      administrative_activity_status_type,
      field_methods,
      ecological_seasons,
      intended_outcomes,
      vantage_codes,
      survey_jobs
    ] = await Promise.all([
      await this.codeRepository.getManagementActionType(),
      await this.codeRepository.getFirstNations(),
      await this.codeRepository.getAgency(),
      await this.codeRepository.getInvestmentActionCategory(),
      await this.codeRepository.getType(),
      await this.codeRepository.getIUCNConservationActionLevel1Classification(),
      await this.codeRepository.getIUCNConservationActionLevel2Subclassification(),
      await this.codeRepository.getIUCNConservationActionLevel3Subclassification(),
      await this.codeRepository.getProprietorType(),
      await this.codeRepository.getProgram(),
      await this.codeRepository.getSystemRoles(),
      await this.codeRepository.getProjectRoles(),
      await this.codeRepository.getAdministrativeActivityStatusType(),
      await this.codeRepository.getFieldMethods(),
      await this.codeRepository.getEcologicalSeasons(),
      await this.codeRepository.getIntendedOutcomes(),
      await this.codeRepository.getVantageCodes(),
      await this.codeRepository.getSurveyJobs()
    ]);

    return {
      management_action_type: management_action_type,
      first_nations: first_nations,
      agency: agency,
      investment_action_category: investment_action_category,
      type: type,
      iucn_conservation_action_level_1_classification: iucn_conservation_action_level_1_classification,
      iucn_conservation_action_level_2_subclassification: iucn_conservation_action_level_2_subclassification,
      iucn_conservation_action_level_3_subclassification: iucn_conservation_action_level_3_subclassification,
      program: program,
      proprietor_type: proprietor_type,
      system_roles: system_roles,
      project_roles: project_roles,
      administrative_activity_status_type: administrative_activity_status_type,
      field_methods: field_methods,
      ecological_seasons: ecological_seasons,
      intended_outcomes: intended_outcomes,
      vantage_codes: vantage_codes,
      survey_jobs: survey_jobs,

      // TODO Temporarily hard coded list of code values below
      region,
      regional_offices
    };
  }
}
