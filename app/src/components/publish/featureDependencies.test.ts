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
      PUBLISH_FEATURE_TYPES.TELEMETRY,
      PUBLISH_FEATURE_TYPES.TELEMETRY_FREQUENCY
    ]);

    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY_FREQUENCY);
  });

  it('removes parent sampling site when sampling period is unselected', () => {
    const selection = applyFeatureToggle(PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD, false, [
      PUBLISH_FEATURE_TYPES.SAMPLE_SITE,
      PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD
    ]);

    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.SAMPLE_PERIOD);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.SAMPLE_SITE);
  });

  it('removes transitive telemetry parents when telemetry is unselected', () => {
    const selection = applyFeatureToggle(PUBLISH_FEATURE_TYPES.TELEMETRY, false, [
      PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE,
      PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT,
      PUBLISH_FEATURE_TYPES.TELEMETRY
    ]);

    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY_DEPLOYMENT);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.TELEMETRY_DEVICE);
  });

  it('adds transitive animal parents when marking is selected', () => {
    const selection = applyFeatureToggle(PUBLISH_FEATURE_TYPES.MARKING, true, []);

    expect(selection).toContain(PUBLISH_FEATURE_TYPES.MARKING);
    expect(selection).toContain(PUBLISH_FEATURE_TYPES.CAPTURE);
    expect(selection).toContain(PUBLISH_FEATURE_TYPES.ANIMAL);
  });

  it('removes animal subtree when animal is unselected', () => {
    const selection = applyFeatureToggle(PUBLISH_FEATURE_TYPES.ANIMAL, false, [
      PUBLISH_FEATURE_TYPES.ANIMAL,
      PUBLISH_FEATURE_TYPES.CAPTURE,
      PUBLISH_FEATURE_TYPES.MARKING,
      PUBLISH_FEATURE_TYPES.MEASUREMENT,
      PUBLISH_FEATURE_TYPES.RELEASE,
      PUBLISH_FEATURE_TYPES.MORTALITY,
      PUBLISH_FEATURE_TYPES.ECOLOGICAL_UNIT
    ]);

    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.ANIMAL);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.CAPTURE);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.MARKING);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.MEASUREMENT);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.RELEASE);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.MORTALITY);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.ECOLOGICAL_UNIT);
  });

  it('removes sample site when last sample site child is unselected', () => {
    const selection = applyFeatureToggle(PUBLISH_FEATURE_TYPES.BLOCK, false, [
      PUBLISH_FEATURE_TYPES.SAMPLE_SITE,
      PUBLISH_FEATURE_TYPES.BLOCK
    ]);

    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.BLOCK);
    expect(selection).not.toContain(PUBLISH_FEATURE_TYPES.SAMPLE_SITE);
  });
});
