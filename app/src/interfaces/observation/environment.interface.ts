export type ObservationEnvironmentQualitativeObject = {
  /**
   * The primary ID for the record.
   * May be undefined if the record has not been saved to the database.
   */
  observation_environment_qualitative_id?: number;
  /**
   * The ID of the environment type definition record.
   */
  environment_qualitative_id: string;
  /**
   * The ID of the selected environment type option definition record.
   */
  environment_qualitative_option_id: string;
};

export type ObservationEnvironmentQuantitativeObject = {
  /**
   * The primary ID for the record.
   * May be undefined if the record has not been saved to the database.
   */
  observation_environment_quantitative_id?: number;
  /**
   * The ID of the environment type definition record.
   */
  environment_quantitative_id: string;
  /**
   * The numeric value selected.
   */
  value: number;
};

export type ObservationEnvironmentData = {
  qualitative_environments: ObservationEnvironmentQualitativeObject[];
  quantitative_environments: ObservationEnvironmentQuantitativeObject[];
};
