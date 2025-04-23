import { IDBConnection } from '../database/db';
import { CodeRepository, IAllCodeSets } from '../repositories/code-repository';
import { ObservationEnvironments } from '../repositories/observation-repository/observation-repository.interface';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';
import { ObservationEnvironmentService } from './observation-environment-service';

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
      observation_signs: this.codeRepository.getObservationSigns(),
      telemetry_device_makes: this.codeRepository.getActiveTelemetryDeviceMakes(),
      frequency_units: this.codeRepository.getFrequencyUnits(),
      alert_types: this.codeRepository.getAlertTypes(),
      vantages: this.codeRepository.getVantages(),
      habitat_feature_types: this.codeRepository.getHabitatFeatureTypes(),
      collection_roles: this.codeRepository.getCollectionRoles()
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
   * @return {*}  {Promise<ObservationEnvironments>}
   * @memberof CodeService
   */
  async findEnvironmentReferenceData(searchTerms: string[]): Promise<ObservationEnvironments> {
    defaultLog.debug({ message: 'getEnvironments' });

    const observationEnvironmentService = new ObservationEnvironmentService(this.connection);

    const [qualitative_environments, quantitative_environments] = await Promise.all([
      await observationEnvironmentService.findQualitativeEnvironmentTypeDefinitions(searchTerms),
      await observationEnvironmentService.findQuantitativeEnvironmentTypeDefinitions(searchTerms)
    ]);

    return {
      qualitative_environments,
      quantitative_environments
    };
  }
}
