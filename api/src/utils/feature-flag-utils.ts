/**
 * Returns the raw feature flag string from the environment variable `VITE_APP_FEATURE_FLAGS`.
 *
 * @return {*}  {(string | undefined)}
 */
export const getFeatureFlagsString = (): string | undefined => {
  return process.env.FEATURE_FLAGS;
};

/**
 * Returns a parsed array of feature flag strings from the environment variable `VITE_APP_FEATURE_FLAGS`.
 *
 * @return {*}  {string[]}
 */
export const getFeatureFlags = (): string[] => {
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
export const isFeatureFlagPresent = (featureFlags: string[]): boolean => {
  return getFeatureFlags().some((flag) => featureFlags.includes(flag));
};
