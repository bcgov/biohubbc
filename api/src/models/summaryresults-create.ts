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
  parameter: string;
  stratum: string;
  parameter_value: number;
  parameter_estimate: number;
  standard_error: number;
  coefficient_variation: number;
  confidence_level_percent: number;
  confidence_limit_upper: number;
  confidence_limit_lower: number;
  area: number;
  area_flown: number;
  sightability_model: string;
  outlier_blocks_removed: string;
  analysis_method: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSummaryDetails', message: 'params', obj });

    this.study_area_id = obj?.study_area_id || null;
    this.parameter = obj?.parameter || null;
    this.stratum = obj?.stratum || null;
    this.parameter_value = obj?.parameter_value || null;
    this.parameter_estimate = obj?.parameter_estimate || null;
    this.standard_error = obj?.standard_error || null;
    this.coefficient_variation = obj?.coefficient_variation || null;
    this.confidence_level_percent = obj?.confidence_level_percent || null;
    this.confidence_limit_upper = obj?.confidence_limit_upper || null;
    this.confidence_limit_lower = obj?.confidence_limit_lower || null;
    this.area = obj?.area || null;
    this.area_flown = obj?.area_flown || null;
    this.sightability_model = obj?.sightability_model || null;
    this.outlier_blocks_removed = obj?.outlier_blocks_removed || null;
    this.analysis_method = obj?.analysis_method || null;
  }
}
