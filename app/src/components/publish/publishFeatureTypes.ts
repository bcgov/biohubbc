export const PUBLISH_FEATURE_TYPES = {
  ANIMAL: 'animal',
  BLOCK: 'block',
  CAPTURE: 'capture',
  ECOLOGICAL_UNIT: 'ecological_unit',
  FILE: 'file',
  HABITAT_FEATURE: 'habitat_feature',
  MARKING: 'marking',
  MEASUREMENT: 'measurement',
  MORTALITY: 'mortality',
  OBSERVATION: 'species_observation',
  RELEASE: 'release',
  REPORT: 'report',
  SAMPLE_SITE: 'sample_site',
  SAMPLE_PERIOD: 'sample_period',
  SAMPLE_TECHNIQUE: 'sample_technique',
  STRATUM: 'stratum',
  STUDY_AREA: 'study_area',
  TELEMETRY: 'telemetry',
  TELEMETRY_DEVICE: 'telemetry_device',
  TELEMETRY_DEPLOYMENT: 'telemetry_deployment',
  TELEMETRY_FREQUENCY: 'telemetry_frequency'
} as const;

export type PublishFeatureType = (typeof PUBLISH_FEATURE_TYPES)[keyof typeof PUBLISH_FEATURE_TYPES];

export const PUBLISH_FEATURE_TYPE_LABELS: Record<PublishFeatureType, string> = {
  [PUBLISH_FEATURE_TYPES.ANIMAL]: 'Animals',
  [PUBLISH_FEATURE_TYPES.BLOCK]: 'Blocks',
  [PUBLISH_FEATURE_TYPES.CAPTURE]: 'Captures',
  [PUBLISH_FEATURE_TYPES.ECOLOGICAL_UNIT]: 'Ecological units',
  [PUBLISH_FEATURE_TYPES.FILE]: 'Attachments',
  [PUBLISH_FEATURE_TYPES.HABITAT_FEATURE]: 'Habitat features',
  [PUBLISH_FEATURE_TYPES.MARKING]: 'Markings',
  [PUBLISH_FEATURE_TYPES.MEASUREMENT]: 'Measurements',
  [PUBLISH_FEATURE_TYPES.MORTALITY]: 'Mortalities',
  [PUBLISH_FEATURE_TYPES.OBSERVATION]: 'Observations',
  [PUBLISH_FEATURE_TYPES.RELEASE]: 'Releases',
  [PUBLISH_FEATURE_TYPES.REPORT]: 'Reports',
  [PUBLISH_FEATURE_TYPES.SAMPLE_SITE]: 'Sampling sites',
  [PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD]: 'Sampling periods',
  [PUBLISH_FEATURE_TYPES.SAMPLE_TECHNIQUE]: 'Sampling techniques',
  [PUBLISH_FEATURE_TYPES.STRATUM]: 'Strata',
  [PUBLISH_FEATURE_TYPES.STUDY_AREA]: 'Study area',
  [PUBLISH_FEATURE_TYPES.TELEMETRY]: 'Telemetry',
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT]: 'Telemetry deployments',
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE]: 'Telemetry devices',
  [PUBLISH_FEATURE_TYPES.TELEMETRY_FREQUENCY]: 'Telemetry frequencies'
};
