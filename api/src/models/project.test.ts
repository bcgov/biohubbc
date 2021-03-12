import { expect } from 'chai';
import { describe } from 'mocha';
import { PostProjectData, PostLocationData, PostObjectivesData, PostIUCNData } from './project';

describe('PostProjectData', () => {
  describe('No values provided', () => {
    let projectPostData: PostProjectData;

    before(() => {
      projectPostData = new PostProjectData(null);
    });

    it('sets name', function () {
      expect(projectPostData.name).to.equal(null);
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

    it('sets comments', function () {
      expect(projectPostData.comments).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectPostData: PostProjectData;

    const obj = {
      project_name: 'name_test_data',
      management_recovery_action: 'management_recovery_action_test_data',
      start_date: 'start_date_test_data',
      end_date: 'end_date_test_data',
      comments: 'comments_test_data'
    };

    before(() => {
      projectPostData = new PostProjectData(obj);
    });

    it('sets name', function () {
      expect(projectPostData.name).to.equal('name_test_data');
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

    it('sets comments', function () {
      expect(projectPostData.comments).to.equal('comments_test_data');
    });
  });
});

describe('PostObjectivesData', () => {
  describe('No values provided', () => {
    let projectObjectivesData: PostObjectivesData;

    before(() => {
      projectObjectivesData = new PostObjectivesData(null);
    });

    it('sets objectives', function () {
      expect(projectObjectivesData.objectives).to.equal('');
    });

    it('sets caveats', function () {
      expect(projectObjectivesData.caveats).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectObjectivesData: PostObjectivesData;

    const obj = {
      objectives: 'these are the project objectives',
      caveats: 'these are some interesting caveats'
    };

    before(() => {
      projectObjectivesData = new PostObjectivesData(obj);
    });

    it('sets objectives', function () {
      expect(projectObjectivesData.objectives).to.equal(obj.objectives);
    });

    it('sets caveats', function () {
      expect(projectObjectivesData.caveats).to.equal(obj.caveats);
    });
  });
});

describe('PostIUCNData', () => {
  describe('No values provided', () => {
    let projectIUCNData: PostIUCNData;

    before(() => {
      projectIUCNData = new PostIUCNData(null);
    });

    it('sets classification details', function () {
      expect(projectIUCNData.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectIUCNData: PostIUCNData;

    const obj = {
      classificationDetails: [{
        classification: 1,
        subClassification1: 2,
        subClassification2: 3
      }]
    };

    before(() => {
      projectIUCNData = new PostIUCNData(obj);
    });

    it('sets classification details', function () {
      expect(projectIUCNData.classificationDetails).to.eql(obj.classificationDetails);
    });
  });
});

describe('PostLocationData', () => {
  describe('No values provided', () => {
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
      expect(projectLocationData.geometry).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectLocationData: PostLocationData;

    const obj = {
      regions: ['Northeast'],
      location_description: 'a location description',
      geometry: [
        {
          type: 'Polygon',
          coordinates: [
            [
              [-128, 55],
              [-128, 55.5],
              [-128, 56],
              [-126, 58],
              [-128, 55]
            ]
          ],
          properties: {
            name: 'Biohub Islands'
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
