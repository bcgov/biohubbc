import { expect } from 'chai';
import sinon from 'sinon';
import { getFeatureFlags, getFeatureFlagsString, isFeatureFlagPresent } from './feature-flag-utils';

describe('getFeatureFlagsString', () => {
  describe('returns the env var `FEATURE_FLAGS`', () => {
    const env = Object.assign({}, process.env);

    afterEach(() => {
      sinon.restore();
      process.env = env;
    });

    it('when the FEATURE_FLAGS env var is undefined', () => {
      process.env.FEATURE_FLAGS = undefined;

      expect(getFeatureFlagsString()).to.equal(undefined);
    });

    it('when the FEATURE_FLAGS env var is defined', () => {
      process.env.FEATURE_FLAGS = 'flag1,flag2,flag3';

      expect(getFeatureFlagsString()).to.equal('flag1,flag2,flag3');
    });
  });
});

describe('getFeatureFlags', () => {
  describe('returns an array of flags', () => {
    const env = Object.assign({}, process.env);

    afterEach(() => {
      sinon.restore();
      process.env = env;
    });

    it('when the FEATURE_FLAGS env var is undefined', () => {
      process.env.FEATURE_FLAGS = undefined;

      expect(getFeatureFlags()).to.eql([]);
    });

    it('when the FEATURE_FLAGS env var is defined', () => {
      process.env.FEATURE_FLAGS = 'flag1,flag2,flag3';

      expect(getFeatureFlags()).to.eql(['flag1', 'flag2', 'flag3']);
    });
  });
});

describe('isFeatureFlagPresent', () => {
  describe('returns true', () => {
    const env = Object.assign({}, process.env);

    afterEach(() => {
      sinon.restore();
      process.env = env;
    });

    it('when one flag matches', () => {
      process.env.FEATURE_FLAGS = 'flag1,flag2,flag3';

      expect(isFeatureFlagPresent(['flag2'])).to.equal(true);
    });

    it('when two flags match', () => {
      process.env.FEATURE_FLAGS = 'flag1,flag2,flag3';

      expect(isFeatureFlagPresent(['flag2', 'flag1'])).to.equal(true);
    });

    it('when some, but not all, flags match', () => {
      process.env.FEATURE_FLAGS = 'flag1,flag2,flag3';

      expect(isFeatureFlagPresent(['flag4', 'flag3'])).to.equal(true);
    });
  });

  describe('returns false', () => {
    const env = Object.assign({}, process.env);

    afterEach(() => {
      sinon.restore();
      process.env = env;
    });

    it('when no flags match', () => {
      process.env.FEATURE_FLAGS = 'flag1,flag2,flag3';

      expect(isFeatureFlagPresent(['flag4'])).to.equal(false);
    });

    it('when no flags specified', () => {
      process.env.FEATURE_FLAGS = 'flag1,flag2,flag3';

      expect(isFeatureFlagPresent([])).to.equal(false);
    });
  });
});
