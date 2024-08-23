import { IDBConnection } from '../database/db';
import { CodeRepository, IAllCodeSets } from '../repositories/code-repository';
import { EnvironmentType } from '../repositories/observation-subcount-environment-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';
import { ObservationSubCountEnvironmentService } from './observation-subcount-environment-service';

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
      system_roles,
      project_roles,
      administrative_activity_status_type,
      intended_outcomes,
      survey_jobs,
      site_selection_strategies,
      sample_methods,
      survey_progress,
      method_response_metrics,
      attractants
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
      await this.codeRepository.getSystemRoles(),
      await this.codeRepository.getProjectRoles(),
      await this.codeRepository.getAdministrativeActivityStatusType(),
      await this.codeRepository.getIntendedOutcomes(),
      await this.codeRepository.getSurveyJobs(),
      await this.codeRepository.getSiteSelectionStrategies(),
      await this.codeRepository.getSampleMethods(),
      await this.codeRepository.getSurveyProgress(),
      await this.codeRepository.getMethodResponseMetrics(),
      await this.codeRepository.getAttractants()
    ]);

    return {
      management_action_type,
      first_nations,
      agency,
      investment_action_category,
      type,
      iucn_conservation_action_level_1_classification,
      iucn_conservation_action_level_2_subclassification,
      iucn_conservation_action_level_3_subclassification,
      proprietor_type,
      system_roles,
      project_roles,
      administrative_activity_status_type,
      intended_outcomes,
      survey_jobs,
      site_selection_strategies,
      sample_methods,
      survey_progress,
      method_response_metrics,
      attractants
    };
  }

  /**
   * Find qualitative and quantitative environments that match the given search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Promise<EnvironmentType>}
   * @memberof CodeService
   */
  async findSubcountEnvironments(searchTerms: string[]): Promise<EnvironmentType> {
    defaultLog.debug({ message: 'getEnvironments' });

    const observationSubCountEnvironmentService = new ObservationSubCountEnvironmentService(this.connection);

    const [qualitative_environments, quantitative_environments] = await Promise.all([
      await observationSubCountEnvironmentService.findQualitativeEnvironmentTypeDefinitions(searchTerms),
      await observationSubCountEnvironmentService.findQuantitativeEnvironmentTypeDefinitions(searchTerms)
    ]);

    return {
      qualitative_environments,
      quantitative_environments
    };
  }
}
