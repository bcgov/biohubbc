import { describe, expect, it } from 'vitest';
import { applyFeatureToggle } from './featureDependencies';
import { PUBLISH_FEATURE_TYPES } from './publishFeatureTypes';

describe('applyFeatureToggle', () => {
  it('adds parent sampling site when sampling period is selected', () => {
    const selection = applyFeatureToggle(PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD, true, []);

    expect(selection).toContain(PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD);
    expect(selection).toContain(PUBLISH_FEATURE_TYPES.SAMPLE_SITE);
  });

  it('adds transitive telemetry parents when telemetry is selected', () => {
    const selection = applyFeatureToggle(PUBLISH_FEATURE_TYPES.TELEMETRY, true, []);

    expect(selection).toContain(PUBLISH_FEATURE_TYPES.TELEMETRY);
    expect(selection).toContain(PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT);
    expect(selection).toContain(PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE);
  });

  it('removes telemetry children when telemetry device is unselected', () => {
    const selection = applyFeatureToggle(PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE, false, [
      PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE,
      PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT,
      PUBLISH_FEATURE_TYPES.TELEMETRY
    ]);

    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY);
  });
});
