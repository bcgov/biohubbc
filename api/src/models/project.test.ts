import { expect } from 'chai';
import { describe } from 'mocha';
import { PostProjectObject, PostProjectRegionObject } from './project';

describe('PostProjectObject', () => {
  describe('No values provided', () => {
    let projectPostObject: PostProjectObject;

    before(() => {
      projectPostObject = new PostProjectObject(null);
    });

    it('sets name', function () {
      expect(projectPostObject.name).to.equal(null);
    });

    it('sets objectives', function () {
      expect(projectPostObject.objectives).to.equal(null);
    });

    it('sets scientific_collection_permit_number', function () {
      expect(projectPostObject.scientific_collection_permit_number).to.equal(null);
    });

    it('sets management_recovery_action', function () {
      expect(projectPostObject.management_recovery_action).to.equal(null);
    });

    it('sets location_description', function () {
      expect(projectPostObject.location_description).to.equal(null);
    });

    it('sets start_date', function () {
      expect(projectPostObject.start_date).to.equal(null);
    });

    it('sets end_date', function () {
      expect(projectPostObject.end_date).to.equal(null);
    });

    it('sets caveats', function () {
      expect(projectPostObject.caveats).to.equal(null);
    });

    it('sets comments', function () {
      expect(projectPostObject.comments).to.equal(null);
    });

    it('sets coordinator_first_name', function () {
      expect(projectPostObject.coordinator_first_name).to.equal(null);
    });

    it('sets coordinator_last_name', function () {
      expect(projectPostObject.coordinator_last_name).to.equal(null);
    });

    it('sets coordinator_email_address', function () {
      expect(projectPostObject.coordinator_email_address).to.equal(null);
    });

    it('sets coordinator_agency_name', function () {
      expect(projectPostObject.coordinator_agency_name).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectPostObject: PostProjectObject;

    const obj = {
      project: {
        name: 'name_test_data',
        objectives: 'objectives_test_data',
        scientific_collection_permit_number: 'scientific_collection_permit_number_test_data',
        management_recovery_action: 'management_recovery_action_test_data',
        start_date: 'start_date_test_data',
        end_date: 'end_date_test_data',
        caveats: 'caveats_test_data',
        comments: 'comments_test_data',
        coordinator_first_name: 'coordinator_first_name',
        coordinator_last_name: 'coordinator_last_name',
        coordinator_email_address: 'coordinator_email_address',
        coordinator_agency_name: 'coordinator_agency_name'
      },
      location: {
        regions: ['South Coast', 'Cariboo', 'Northeast'],
        location_description: 'location_description_test_data'
      }
    };

    before(() => {
      projectPostObject = new PostProjectObject(obj);
    });

    it('sets name', function () {
      expect(projectPostObject.name).to.equal('name_test_data');
    });

    it('sets objectives', function () {
      expect(projectPostObject.objectives).to.equal('objectives_test_data');
    });

    it('sets scientific_collection_permit_number', function () {
      expect(projectPostObject.scientific_collection_permit_number).to.equal(
        'scientific_collection_permit_number_test_data'
      );
    });

    it('sets management_recovery_action', function () {
      expect(projectPostObject.management_recovery_action).to.equal('management_recovery_action_test_data');
    });

    it('sets location_description', function () {
      expect(projectPostObject.location_description).to.equal('location_description_test_data');
    });

    it('sets start_date', function () {
      expect(projectPostObject.start_date).to.equal('start_date_test_data');
    });

    it('sets end_date', function () {
      expect(projectPostObject.end_date).to.equal('end_date_test_data');
    });

    it('sets caveats', function () {
      expect(projectPostObject.caveats).to.equal('caveats_test_data');
    });

    it('sets comments', function () {
      expect(projectPostObject.comments).to.equal('comments_test_data');
    });
  });
});

describe('PostProjectRegionObject', () => {
  describe('No value provided', () => {
    let projectRegionPostProject: PostProjectRegionObject;

    before(() => {
      projectRegionPostProject = new PostProjectRegionObject(null);
    });

    it('sets region_name', function () {
      expect(projectRegionPostProject.region_name).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectRegionPostProject: PostProjectRegionObject;

    const obj = {
      name: 'Northeast'
    };

    before(() => {
      projectRegionPostProject = new PostProjectRegionObject(obj);
    });

    it('sets region_name', function () {
      expect(projectRegionPostProject.region_name).to.equal('Northeast');
    });
  });
});
