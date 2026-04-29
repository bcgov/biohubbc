import { PUBLISH_FEATURE_TYPES, PublishFeatureType } from './publishFeatureTypes';

export const PARENTS: Partial<Record<PublishFeatureType, PublishFeatureType[]>> = {
  [PUBLISH_FEATURE_TYPES.BLOCK]: [PUBLISH_FEATURE_TYPES.SAMPLE_SITE],
  [PUBLISH_FEATURE_TYPES.CAPTURE]: [PUBLISH_FEATURE_TYPES.ANIMAL],
  [PUBLISH_FEATURE_TYPES.ECOLOGICAL_UNIT]: [PUBLISH_FEATURE_TYPES.ANIMAL],
  [PUBLISH_FEATURE_TYPES.MARKING]: [PUBLISH_FEATURE_TYPES.CAPTURE],
  [PUBLISH_FEATURE_TYPES.MEASUREMENT]: [PUBLISH_FEATURE_TYPES.CAPTURE],
  [PUBLISH_FEATURE_TYPES.MORTALITY]: [PUBLISH_FEATURE_TYPES.ANIMAL],
  [PUBLISH_FEATURE_TYPES.RELEASE]: [PUBLISH_FEATURE_TYPES.CAPTURE],
  [PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD]: [PUBLISH_FEATURE_TYPES.SAMPLE_SITE],
  [PUBLISH_FEATURE_TYPES.SAMPLE_TECHNIQUE]: [PUBLISH_FEATURE_TYPES.SAMPLE_SITE],
  [PUBLISH_FEATURE_TYPES.STRATUM]: [PUBLISH_FEATURE_TYPES.SAMPLE_SITE],
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT]: [PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE],
  [PUBLISH_FEATURE_TYPES.TELEMETRY]: [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT],
  [PUBLISH_FEATURE_TYPES.TELEMETRY_FREQUENCY]: [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT]
};

export const CHILDREN: Partial<Record<PublishFeatureType, PublishFeatureType[]>> = {
  [PUBLISH_FEATURE_TYPES.ANIMAL]: [
    PUBLISH_FEATURE_TYPES.CAPTURE,
    PUBLISH_FEATURE_TYPES.ECOLOGICAL_UNIT,
    PUBLISH_FEATURE_TYPES.MORTALITY
  ],
  [PUBLISH_FEATURE_TYPES.CAPTURE]: [
    PUBLISH_FEATURE_TYPES.MARKING,
    PUBLISH_FEATURE_TYPES.MEASUREMENT,
    PUBLISH_FEATURE_TYPES.RELEASE
  ],
  [PUBLISH_FEATURE_TYPES.SAMPLE_SITE]: [
    PUBLISH_FEATURE_TYPES.BLOCK,
    PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD,
    PUBLISH_FEATURE_TYPES.SAMPLE_TECHNIQUE,
    PUBLISH_FEATURE_TYPES.STRATUM
  ],
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT]: [
    PUBLISH_FEATURE_TYPES.TELEMETRY,
    PUBLISH_FEATURE_TYPES.TELEMETRY_FREQUENCY
  ],
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE]: [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT]
};

const addParents = (current: Set<PublishFeatureType>, featureType: PublishFeatureType) => {
  const parentFeatureTypes = PARENTS[featureType] || [];

  parentFeatureTypes.forEach((parentFeatureType) => {
    if (!current.has(parentFeatureType)) {
      current.add(parentFeatureType);
      addParents(current, parentFeatureType);
    }
  });
};

const removeChildren = (current: Set<PublishFeatureType>, featureType: PublishFeatureType) => {
  const childFeatureTypes = CHILDREN[featureType] || [];

  childFeatureTypes.forEach((childFeatureType) => {
    if (current.has(childFeatureType)) {
      current.delete(childFeatureType);
      removeChildren(current, childFeatureType);
    }
  });
};

const hasAnySelectedDescendant = (current: Set<PublishFeatureType>, featureType: PublishFeatureType): boolean => {
  const childFeatureTypes = CHILDREN[featureType] || [];

  for (const childFeatureType of childFeatureTypes) {
    if (current.has(childFeatureType) || hasAnySelectedDescendant(current, childFeatureType)) {
      return true;
    }
  }

  return false;
};

const removeOrphanedParents = (current: Set<PublishFeatureType>, featureType: PublishFeatureType) => {
  const parentFeatureTypes = PARENTS[featureType] || [];

  parentFeatureTypes.forEach((parentFeatureType) => {
    if (current.has(parentFeatureType) && !hasAnySelectedDescendant(current, parentFeatureType)) {
      current.delete(parentFeatureType);
      removeOrphanedParents(current, parentFeatureType);
    }
  });
};

export const applyFeatureToggle = (
  featureType: PublishFeatureType,
  isChecked: boolean,
  selectedFeatureTypes: PublishFeatureType[]
) => {
  const nextSelection = new Set<PublishFeatureType>(selectedFeatureTypes);

  if (isChecked) {
    nextSelection.add(featureType);
    addParents(nextSelection, featureType);
  } else {
    nextSelection.delete(featureType);
    removeChildren(nextSelection, featureType);
    removeOrphanedParents(nextSelection, featureType);
  }

  return [...nextSelection];
};
