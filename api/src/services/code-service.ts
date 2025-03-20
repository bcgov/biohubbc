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

    // All code sets to fetch
    const codePromises: Record<keyof IAllCodeSets, Promise<IAllCodeSets[keyof IAllCodeSets]>> = {
      management_action_type: this.codeRepository.getManagementActionType(),
      first_nations: this.codeRepository.getFirstNations(),
      agency: this.codeRepository.getAgency(),
      investment_action_category: this.codeRepository.getInvestmentActionCategory(),
      survey_data_type: this.codeRepository.getSurveyDataType(),
      iucn_conservation_action_level_1_classification:
        this.codeRepository.getIUCNConservationActionLevel1Classification(),
      iucn_conservation_action_level_2_subclassification:
        this.codeRepository.getIUCNConservationActionLevel2Subclassification(),
      iucn_conservation_action_level_3_subclassification:
        this.codeRepository.getIUCNConservationActionLevel3Subclassification(),
      proprietor_type: this.codeRepository.getProprietorType(),
      system_roles: this.codeRepository.getSystemRoles(),
      project_roles: this.codeRepository.getProjectRoles(),
      administrative_activity_status_type: this.codeRepository.getAdministrativeActivityStatusType(),
      intended_outcomes: this.codeRepository.getIntendedOutcomes(),
      survey_jobs: this.codeRepository.getSurveyJobs(),
      site_selection_strategies: this.codeRepository.getSiteSelectionStrategies(),
      sample_methods: this.codeRepository.getSampleMethods(),
      survey_progress: this.codeRepository.getSurveyProgress(),
      method_response_metrics: this.codeRepository.getMethodResponseMetrics(),
      attractants: this.codeRepository.getAttractants(),
      observation_subcount_signs: this.codeRepository.getObservationSubcountSigns(),
      telemetry_device_makes: this.codeRepository.getActiveTelemetryDeviceMakes(),
      frequency_units: this.codeRepository.getFrequencyUnits(),
      alert_types: this.codeRepository.getAlertTypes(),
      vantages: this.codeRepository.getVantages(),
      habitat_feature_types: this.codeRepository.getHabitatFeatureTypes()
    };

    // Fetch all code sets in parallel
    const codes = await Promise.all(Object.values(codePromises));
    const keys = Object.keys(codePromises);

    // Generate the final code sets object
    const codeSets = {} as IAllCodeSets;
    for (let i = 0; i < keys.length; i++) {
      // Add the code set to the final object
      codeSets[keys[i]] = codes[i];
    }

    return codeSets;
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
