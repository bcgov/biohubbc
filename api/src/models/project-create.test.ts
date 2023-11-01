import { expect } from 'chai';
import { describe } from 'mocha';
import { PostIUCNData, PostObjectivesData, PostProjectData, PostProjectObject } from './project-create';

describe('PostProjectObject', () => {
  describe('No values provided', () => {
    let projectPostObject: PostProjectObject;

    before(() => {
      projectPostObject = new PostProjectObject(null);
    });

    it('sets project', function () {
      expect(projectPostObject.project).to.equal(null);
    });

    it('sets objectives', function () {
      expect(projectPostObject.objectives).to.equal(null);
    });

    it('sets iucn', function () {
      expect(projectPostObject.iucn).to.equal(null);
    });
  });
});

describe('PostProjectData', () => {
  describe('No values provided', () => {
    let projectPostData: PostProjectData;

    before(() => {
      projectPostData = new PostProjectData(null);
    });

    it('sets name', function () {
      expect(projectPostData.name).to.equal(null);
    });

    it('sets programs', function () {
      expect(projectPostData.project_programs).to.have.length(0);
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
      project_programs: [1],
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

    it('sets type', function () {
      expect(projectPostData.project_programs).to.eql([1]);
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
  });

  describe('All values provided', () => {
    let projectObjectivesData: PostObjectivesData;

    const obj = {
      objectives: 'these are the project objectives'
    };

    before(() => {
      projectObjectivesData = new PostObjectivesData(obj);
    });

    it('sets objectives', function () {
      expect(projectObjectivesData.objectives).to.equal(obj.objectives);
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
      classificationDetails: [
        {
          classification: 1,
          subClassification1: 2,
          subClassification2: 3
        }
      ]
    };

    before(() => {
      projectIUCNData = new PostIUCNData(obj);
    });

    it('sets classification details', function () {
      expect(projectIUCNData.classificationDetails).to.eql(obj.classificationDetails);
    });
  });
});
