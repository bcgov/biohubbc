export enum SURVEY_ACTIVE_VIEW_VALUE {
  overview = 'overview',
  sampling = 'sampling',
  data = 'data',
  attachments = 'attachments',
  permissions = 'permissions'
}

export enum SAMPLING_ACTIVE_VIEW_VALUE {
  sites = 'sites',
  techniques = 'techniques',
  periods = 'periods'
}

export enum DATA_ACTIVE_VIEW_VALUE {
  observations = 'observations',
  telemetry = 'telemetry',
  devices = 'devices',
  locations = 'locations',
  deployments = 'deployments',
  animals = 'animals',
  habitat = 'habitat'
}

export type SURVEY_VIEW_VALUE = SURVEY_ACTIVE_VIEW_VALUE | SAMPLING_ACTIVE_VIEW_VALUE | DATA_ACTIVE_VIEW_VALUE;

interface ViewNode {
  key: SURVEY_VIEW_VALUE;
  parent?: SURVEY_VIEW_VALUE;
  children?: SURVEY_VIEW_VALUE[];
}

export const viewHierarchy: Record<SURVEY_VIEW_VALUE, ViewNode> = {
  // Top-level views
  [SURVEY_ACTIVE_VIEW_VALUE.overview]: {
    key: SURVEY_ACTIVE_VIEW_VALUE.overview
  },
  [SURVEY_ACTIVE_VIEW_VALUE.sampling]: {
    key: SURVEY_ACTIVE_VIEW_VALUE.sampling,
    children: [
      SAMPLING_ACTIVE_VIEW_VALUE.sites,
      SAMPLING_ACTIVE_VIEW_VALUE.techniques,
      SAMPLING_ACTIVE_VIEW_VALUE.periods
    ]
  },
  [SURVEY_ACTIVE_VIEW_VALUE.data]: {
    key: SURVEY_ACTIVE_VIEW_VALUE.data,
    children: [
      DATA_ACTIVE_VIEW_VALUE.observations,
      DATA_ACTIVE_VIEW_VALUE.telemetry,
      DATA_ACTIVE_VIEW_VALUE.devices,
      DATA_ACTIVE_VIEW_VALUE.locations,
      DATA_ACTIVE_VIEW_VALUE.deployments,
      DATA_ACTIVE_VIEW_VALUE.animals,
      DATA_ACTIVE_VIEW_VALUE.habitat
    ]
  },
  [SURVEY_ACTIVE_VIEW_VALUE.attachments]: {
    key: SURVEY_ACTIVE_VIEW_VALUE.attachments
  },
  [SURVEY_ACTIVE_VIEW_VALUE.permissions]: {
    key: SURVEY_ACTIVE_VIEW_VALUE.permissions
  },

  // Sampling subviews
  [SAMPLING_ACTIVE_VIEW_VALUE.sites]: {
    key: SAMPLING_ACTIVE_VIEW_VALUE.sites,
    parent: SURVEY_ACTIVE_VIEW_VALUE.sampling
  },
  [SAMPLING_ACTIVE_VIEW_VALUE.techniques]: {
    key: SAMPLING_ACTIVE_VIEW_VALUE.techniques,
    parent: SURVEY_ACTIVE_VIEW_VALUE.sampling
  },
  [SAMPLING_ACTIVE_VIEW_VALUE.periods]: {
    key: SAMPLING_ACTIVE_VIEW_VALUE.periods,
    parent: SURVEY_ACTIVE_VIEW_VALUE.sampling
  },

  // Data subviews
  [DATA_ACTIVE_VIEW_VALUE.observations]: {
    key: DATA_ACTIVE_VIEW_VALUE.observations,
    parent: SURVEY_ACTIVE_VIEW_VALUE.data
  },
  [DATA_ACTIVE_VIEW_VALUE.telemetry]: {
    key: DATA_ACTIVE_VIEW_VALUE.telemetry,
    parent: SURVEY_ACTIVE_VIEW_VALUE.data
  },
  [DATA_ACTIVE_VIEW_VALUE.devices]: {
    key: DATA_ACTIVE_VIEW_VALUE.devices,
    parent: SURVEY_ACTIVE_VIEW_VALUE.data
  },
  [DATA_ACTIVE_VIEW_VALUE.locations]: {
    key: DATA_ACTIVE_VIEW_VALUE.locations,
    parent: SURVEY_ACTIVE_VIEW_VALUE.data
  },
  [DATA_ACTIVE_VIEW_VALUE.deployments]: {
    key: DATA_ACTIVE_VIEW_VALUE.deployments,
    parent: SURVEY_ACTIVE_VIEW_VALUE.data
  },
  [DATA_ACTIVE_VIEW_VALUE.animals]: {
    key: DATA_ACTIVE_VIEW_VALUE.animals,
    parent: SURVEY_ACTIVE_VIEW_VALUE.data
  },
  [DATA_ACTIVE_VIEW_VALUE.habitat]: {
    key: DATA_ACTIVE_VIEW_VALUE.habitat,
    parent: SURVEY_ACTIVE_VIEW_VALUE.data
  }
};
