import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/summary-results-create');

/**
 * Pre-processes POST Summary details data
 *
 * @export
 * @class PostSummaryDetails
 */
export class PostSummaryDetails {
  study_area_id: string;
  population_unit: string;
  block_sample_unit_id: string;
  parameter: string;
  stratum: string;
  observed: number;
  estimated: number;
  sightability_model: string;
  sightability_correction_factor: number;
  standard_error: number;
  coefficient_variation: number;
  confidence_level_percent: number;
  confidence_limit_lower: number;
  confidence_limit_upper: number;
  total_area_survey_sqm: number;
  area_flown: number;
  total_kilometers_surveyed: number;
  best_parameter_flag: string;
  outlier_blocks_removed: string;
  total_marked_animals_observed: number;
  marked_animals_available: number;
  parameter_estimate: number;


  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSummaryDetails', message: 'params', obj });
    this.study_area_id = obj?.study_area_id || null
    this.population_unit = obj?.population_unit || null
    this.block_sample_unit_id = obj?.block_sample_unit_id || null
    this.parameter = obj?.parameter || null
    this.stratum = obj?.stratum || null
    this.observed = obj?.observed || null
    this.estimated = obj?.estimated || null
    this.sightability_model = obj?.sightability_model || null
    this.sightability_correction_factor = obj?.sightability_correction_factor || null
    this.standard_error = obj?.standard_error || null
    this.coefficient_variation = obj?.coefficient_variation || null
    this.confidence_level_percent = obj?.confidence_level_percent || null
    this.confidence_limit_lower = obj?.confidence_limit_lower || null
    this.confidence_limit_upper = obj?.confidence_limit_upper || null
    this.total_area_survey_sqm = obj?.total_area_survey_sqm || null
    this.area_flown = obj?.area_flown || null
    this.total_kilometers_surveyed = obj?.total_kilometers_surveyed || null
    this.best_parameter_flag = obj?.best_parameter_flag || null
    this.outlier_blocks_removed = obj?.outlier_blocks_removed || null
    this.total_marked_animals_observed = obj?.total_marked_animals_observed || null
    this.marked_animals_available = obj?.marked_animals_available || null
    this.parameter_estimate = obj?.parameter_estimate || null
  }
}
