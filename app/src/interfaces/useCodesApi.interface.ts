/**
 * A single code value.
 *
 * @interface ICode
 */
interface ICode {
  id: number;
  name: string;
}

/**
 * A code set (an array of ICode values).
 *
 * @interface CodeSet
 */
type CodeSet<T extends ICode = ICode> = T[];

/**
 * Get all codes response object.
 *
 * @export
 * @interface IGetAllCodeSetsResponse
 */
export interface IGetAllCodeSetsResponse {
  coordinator_agency: CodeSet;
  management_action_type: CodeSet;
  climate_change_initiative: CodeSet;
  first_nations: CodeSet;
  funding_source: CodeSet;
  investment_action_category: CodeSet<{ id: number; fs_id: number; name: string }>;
  activity: CodeSet;
  project_type: CodeSet;
  region: CodeSet;
  species: CodeSet;
  iucn_conservation_action_level_1_classification: CodeSet;
  iucn_conservation_action_level_2_subclassification: CodeSet<{ id: number; iucn_id: number; name: string }>;
  iucn_conservation_action_level_3_subclassification: CodeSet<{ id: number; iucn1_id: number; name: string }>;
}
