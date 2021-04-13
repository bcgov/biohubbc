import { expect } from 'chai';
import { describe } from 'mocha';
import { PostPermitNoSamplingData, PostPermitNoSamplingObject } from './permit-no-sampling';

describe('postPermitNoSamplingObject', () => {
  describe('No values provided', () => {
    let postPermitNoSamplingObject: PostPermitNoSamplingObject;

    before(() => {
      postPermitNoSamplingObject = new PostPermitNoSamplingObject(null);
    });

    it('sets coordinator to default values', function () {
      expect(postPermitNoSamplingObject.coordinator).to.equal(null);
    });

    it('sets permit to default values', function () {
      expect(postPermitNoSamplingObject.permit).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let postPermitNoSamplingObject: PostPermitNoSamplingObject;

    const obj = {
      coordinator: {
        first_name: 'first_name',
        last_name: 'last_name',
        email_address: 'email_address',
        coordinator_agency: 'coordinator_agency',
        share_contact_details: 'true'
      },
      permit: {
        permits: [
          {
            permit_number: '123'
          },
          {
            permit_number: '456'
          }
        ]
      }
    };

    before(() => {
      postPermitNoSamplingObject = new PostPermitNoSamplingObject(obj);
    });

    it('sets coordinator', function () {
      expect(postPermitNoSamplingObject.coordinator).to.deep.equal({
        first_name: 'first_name',
        last_name: 'last_name',
        email_address: 'email_address',
        coordinator_agency: 'coordinator_agency',
        share_contact_details: true
      });
    });

    it('sets permit', function () {
      expect(postPermitNoSamplingObject.permit).to.deep.equal({
        permits: [
          {
            permit_number: '123'
          },
          {
            permit_number: '456'
          }
        ]
      });
    });
  });
});

describe('PostPermitNoSamplingData', () => {
  describe('No values provided', () => {
    let postPermitNoSamplingData: PostPermitNoSamplingData;

    before(() => {
      postPermitNoSamplingData = new PostPermitNoSamplingData(null);
    });

    it('sets permit to default values', function () {
      expect(postPermitNoSamplingData.permits).to.eql([]);
    });
  });

  describe('All values provided where permits has no length', () => {
    let postPermitNoSamplingData: PostPermitNoSamplingData;

    const obj = { permits: [] };

    before(() => {
      postPermitNoSamplingData = new PostPermitNoSamplingData(obj);
    });

    it('sets permits', function () {
      expect(postPermitNoSamplingData.permits).to.eql([]);
    });
  });

  describe('All values provided where permits is null', () => {
    let postPermitNoSamplingData: PostPermitNoSamplingData;

    const obj = { permits: null };

    before(() => {
      postPermitNoSamplingData = new PostPermitNoSamplingData(obj);
    });

    it('sets permits', function () {
      expect(postPermitNoSamplingData.permits).to.eql([]);
    });
  });

  describe('All values provided where permits is a valid array', () => {
    let postPermitNoSamplingData: PostPermitNoSamplingData;

    const obj = { permits: [{ permit_number: 1 }] };

    before(() => {
      postPermitNoSamplingData = new PostPermitNoSamplingData(obj);
    });

    it('sets permits', function () {
      expect(postPermitNoSamplingData.permits).to.eql([
        {
          permit_number: 1
        }
      ]);
    });
  });
});
