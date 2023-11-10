import { expect } from 'chai';
import { describe } from 'mocha';
import { PutIUCNData, PutObjectivesData, PutProjectData } from './project-update';

describe('PutProjectData', () => {
  describe('No values provided', () => {
    let data: PutProjectData;

    before(() => {
      data = new PutProjectData();
    });

    it('sets name', () => {
      expect(data.name).to.equal(null);
    });

    it('sets type', () => {
      expect(data.project_programs).to.eql([]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      project_name: 'project name',
      project_programs: [1],
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1
    };

    let data: PutProjectData;

    before(() => {
      data = new PutProjectData(obj);
    });

    it('sets name', () => {
      expect(data.name).to.equal('project name');
    });

    it('sets programs', () => {
      expect(data.project_programs).to.eql([1]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.eql('2020-04-20T07:00:00.000Z');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('2020-05-20T07:00:00.000Z');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});

describe('PutObjectivesData', () => {
  describe('No values provided', () => {
    let data: PutObjectivesData;

    before(() => {
      data = new PutObjectivesData(null);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal('');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      objectives: 'objectives',
      revision_count: 1
    };

    let data: PutObjectivesData;

    before(() => {
      data = new PutObjectivesData(obj);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal(obj.objectives);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(obj.revision_count);
    });
  });
});

describe('PutIUCNData', () => {
  describe('No values provided', () => {
    let data: PutIUCNData;

    before(() => {
      data = new PutIUCNData(null);
    });

    it('sets classification details', () => {
      expect(data.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    const obj = {
      classificationDetails: [
        {
          classification: 1,
          subClassification1: 2,
          subClassification2: 2
        }
      ]
    };

    let data: PutIUCNData;

    before(() => {
      data = new PutIUCNData(obj);
    });

    it('sets classification details', () => {
      expect(data.classificationDetails).to.eql(obj.classificationDetails);
    });
  });
});
