export const PUBLISH_FEATURE_TYPES = {
  SAMPLE_SITE: 'sample_site',
  SAMPLE_PERIOD: 'sample_period',
  SAMPLE_TECHNIQUE: 'sample_technique',
  OBSERVATION: 'species_observation',
  TELEMETRY: 'telemetry',
  TELEMETRY_DEVICE: 'telemetry_device',
  TELEMETRY_DEPLOYMENT: 'telemetry_deployment',
  HABITAT_FEATURE: 'habitat_feature',
  FILE: 'file'
} as const;

export type PublishFeatureType = (typeof PUBLISH_FEATURE_TYPES)[keyof typeof PUBLISH_FEATURE_TYPES];

export const PUBLISH_FEATURE_TYPE_LABELS: Record<PublishFeatureType, string> = {
  [PUBLISH_FEATURE_TYPES.SAMPLE_SITE]: 'Sampling sites',
  [PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD]: 'Sampling periods',
  [PUBLISH_FEATURE_TYPES.SAMPLE_TECHNIQUE]: 'Techniques',
  [PUBLISH_FEATURE_TYPES.OBSERVATION]: 'Observations',
  [PUBLISH_FEATURE_TYPES.TELEMETRY]: 'Telemetry',
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE]: 'Devices',
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT]: 'Deployments',
  [PUBLISH_FEATURE_TYPES.HABITAT_FEATURE]: 'Habitat features',
  [PUBLISH_FEATURE_TYPES.FILE]: 'Attachments'
};

export const PUBLISH_FEATURE_GROUPS: { title: string; featureTypes: PublishFeatureType[] }[] = [
  {
    title: 'Sampling',
    featureTypes: [
      PUBLISH_FEATURE_TYPES.SAMPLE_SITE,
      PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD,
      PUBLISH_FEATURE_TYPES.SAMPLE_TECHNIQUE
    ]
  },
  {
    title: 'Data',
    featureTypes: [PUBLISH_FEATURE_TYPES.OBSERVATION, PUBLISH_FEATURE_TYPES.HABITAT_FEATURE]
  },
  {
    title: 'Telemetry',
    featureTypes: [
      PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE,
      PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT,
      PUBLISH_FEATURE_TYPES.TELEMETRY
    ]
  },
  {
    title: 'Attachments',
    featureTypes: [PUBLISH_FEATURE_TYPES.FILE]
  }
];
