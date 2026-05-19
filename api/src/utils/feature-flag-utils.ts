/**
 * Returns the raw feature flag string from the environment variable `VITE_APP_FEATURE_FLAGS`.
 *
 * @return {*}  {(string | undefined)}
 */
const getFeatureFlagsStringCore = (): string | undefined => {
  return process.env.FEATURE_FLAGS;
};

/**
 * Returns a parsed array of feature flag strings from the environment variable `VITE_APP_FEATURE_FLAGS`.
 *
 * @return {*}  {string[]}
 */
const getFeatureFlagsCore = (): string[] => {
  const featureFlagsString = getFeatureFlagsString();

  if (!featureFlagsString) {
    return [];
  }

  return featureFlagsString.split(',');
};

/**
 * Returns `true` if at least one of the provided `featureFlags` is present in the environment variable
 * `VITE_APP_FEATURE_FLAGS`.
 *
 * @param {string[]} featureFlags
 * @return {*}  {boolean}
 */
const isFeatureFlagPresentCore = (featureFlags: string[]): boolean => {
  return getFeatureFlags().some((flag) => featureFlags.includes(flag));
};

export const featureFlagDependencies = {
  getFeatureFlagsString: getFeatureFlagsStringCore,
  getFeatureFlags: getFeatureFlagsCore,
  isFeatureFlagPresent: isFeatureFlagPresentCore
};

export const getFeatureFlagsString = (): string | undefined => {
  return featureFlagDependencies.getFeatureFlagsString();
};

export const getFeatureFlags = (): string[] => {
  return featureFlagDependencies.getFeatureFlags();
};

export const isFeatureFlagPresent = (featureFlags: string[]): boolean => {
  return featureFlagDependencies.isFeatureFlagPresent(featureFlags);
};
