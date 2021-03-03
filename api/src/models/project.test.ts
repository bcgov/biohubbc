import { expect } from 'chai';
import { describe } from 'mocha';
import { PostProjectData, PostLocationData } from './project';

describe('PostProjectData', () => {
  describe('No values provided', () => {
    let projectPostData: PostProjectData;

    before(() => {
      projectPostData = new PostProjectData(null);
    });

    it('sets name', function () {
      expect(projectPostData.name).to.equal(null);
    });

    it('sets objectives', function () {
      expect(projectPostData.objectives).to.equal('');
    });

    it('sets scientific_collection_permit_number', function () {
      expect(projectPostData.scientific_collection_permit_number).to.equal(null);
    });

    it('sets management_recovery_action', function () {
      expect(projectPostData.management_recovery_action).to.equal(null);
    });

    it('sets start_date', function () {
      expect(projectPostData.start_date).to.equal(null);
    });

    it('sets end_date', function () {
      expect(projectPostData.end_date).to.equal(null);
    });

    it('sets caveats', function () {
      expect(projectPostData.caveats).to.equal(null);
    });

    it('sets comments', function () {
      expect(projectPostData.comments).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectPostData: PostProjectData;

    const obj = {
      project_name: 'name_test_data',
      objectives: 'objectives_test_data',
      scientific_collection_permit_number: 'scientific_collection_permit_number_test_data',
      management_recovery_action: 'management_recovery_action_test_data',
      start_date: 'start_date_test_data',
      end_date: 'end_date_test_data',
      caveats: 'caveats_test_data',
      comments: 'comments_test_data'
    };

    before(() => {
      projectPostData = new PostProjectData(obj);
    });

    it('sets name', function () {
      expect(projectPostData.name).to.equal('name_test_data');
    });

    it('sets objectives', function () {
      expect(projectPostData.objectives).to.equal('objectives_test_data');
    });

    it('sets scientific_collection_permit_number', function () {
      expect(projectPostData.scientific_collection_permit_number).to.equal(
        'scientific_collection_permit_number_test_data'
      );
    });

    it('sets management_recovery_action', function () {
      expect(projectPostData.management_recovery_action).to.equal('management_recovery_action_test_data');
    });

    it('sets start_date', function () {
      expect(projectPostData.start_date).to.equal('start_date_test_data');
    });

    it('sets end_date', function () {
      expect(projectPostData.end_date).to.equal('end_date_test_data');
    });

    it('sets caveats', function () {
      expect(projectPostData.caveats).to.equal('caveats_test_data');
    });

    it('sets comments', function () {
      expect(projectPostData.comments).to.equal('comments_test_data');
    });
  });
});

describe('PostLocationData', () => {
  describe('No value provided', () => {
    let projectLocationData: PostLocationData;

    before(() => {
      projectLocationData = new PostLocationData(null);
    });

    it('sets region_name', function () {
      expect(projectLocationData.regions).to.eql([]);
    });

    it('sets location_description', function () {
      expect(projectLocationData.location_description).to.equal(null);
    });

    it('sets geometry', function () {
      expect(projectLocationData.geometry).to.equal([]);
    });
  });

  describe('All values provided', () => {
    let projectLocationData: PostLocationData;

    const obj = {
      regions: ['Northeast'],
      location_description: 'a location description',
      geometry: [
        {
          "type": "Polygon",
          "coordinates": [[
            [-128, 55],
            [-128, 55.5],
            [-128, 56],
            [-126, 58],
            [-128, 55]
          ]],
          "properties": {
            "name": "Biohub Islands"
          }
        }
      ]
    };

    before(() => {
      projectLocationData = new PostLocationData(obj);
    });

    it('sets region_name', function () {
      expect(projectLocationData.regions).to.eql(['Northeast']);
    });

    it('sets location_description', function () {
      expect(projectLocationData.location_description).to.equal('a location description');
    });

    it('sets the geometry', function () {
      expect(projectLocationData.geometry).to.eql(obj.geometry);
    });
  });
});
