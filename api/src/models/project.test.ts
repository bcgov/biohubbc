import { expect } from 'chai';
import { describe } from 'mocha';
import { PostProjectObject } from './project';

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

    it('sets results', function () {
      expect(projectPostObject.results).to.equal(null);
    });

    it('sets caveats', function () {
      expect(projectPostObject.caveats).to.equal(null);
    });

    it('sets comments', function () {
      expect(projectPostObject.comments).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectPostObject: PostProjectObject;

    const obj = {
      name: 'name_test_data',
      objectives: 'objectives_test_data',
      scientific_collection_permit_number: 'scientific_collection_permit_number_test_data',
      management_recovery_action: 'management_recovery_action_test_data',
      location_description: 'location_description_test_data',
      start_date: 'start_date_test_data',
      end_date: 'end_date_test_data',
      results: 'results_test_data',
      caveats: 'caveats_test_data',
      comments: 'comments_test_data'
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

    it('sets results', function () {
      expect(projectPostObject.results).to.equal('results_test_data');
    });

    it('sets caveats', function () {
      expect(projectPostObject.caveats).to.equal('caveats_test_data');
    });

    it('sets comments', function () {
      expect(projectPostObject.comments).to.equal('comments_test_data');
    });
  });
});
