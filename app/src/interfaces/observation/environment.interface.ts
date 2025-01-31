export type ObservationEnvironmentQualitativeObject = {
  observation_environment_qualitative_id: number;
  environment_qualitative_id: string;
  environment_qualitative_option_id: string;
};

export type ObservationEnvironmentQuantitativeObject = {
  observation_environment_quantitative_id: number;
  environment_quantitative_id: string;
  value: number;
};

export type ObservationEnvironmentQualitative = {
  environment_qualitative_id: string;
  environment_qualitative_option_id: string;
};

export type ObservationEnvironmentQuantitative = {
  environment_quantitative_id: string;
  value: number;
};

export type ObservationEnvironmentData = {
  qualitative_environments: ObservationEnvironmentQualitativeObject[];
  quantitative_environments: ObservationEnvironmentQuantitativeObject[];
};
