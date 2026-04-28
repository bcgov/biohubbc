import { PUBLISH_FEATURE_TYPES, PublishFeatureType } from './publishFeatureTypes';

export const PARENTS: Partial<Record<PublishFeatureType, PublishFeatureType[]>> = {
  [PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD]: [PUBLISH_FEATURE_TYPES.SAMPLE_SITE],
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT]: [PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE],
  [PUBLISH_FEATURE_TYPES.TELEMETRY]: [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT]
};

export const CHILDREN: Partial<Record<PublishFeatureType, PublishFeatureType[]>> = {
  [PUBLISH_FEATURE_TYPES.SAMPLE_SITE]: [PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD],
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE]: [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT],
  [PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT]: [PUBLISH_FEATURE_TYPES.TELEMETRY]
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
  }

  return [...nextSelection];
};
