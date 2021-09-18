import { expect } from 'chai';
import { COMPLETION_STATUS } from '../../constants/status';
import { GetPublicCoordinatorData, GetPublicProjectData } from './project';
import { describe } from 'mocha';

describe('GetPublicProjectData', () => {
  describe('No values provided', () => {
    let data: GetPublicProjectData;

    before(() => {
      data = new GetPublicProjectData();
    });

    it('sets name', () => {
      expect(data.project_name).to.equal('');
    });

    it('sets type', () => {
      expect(data.project_type).to.equal('');
    });

    it('sets project_activities', () => {
      expect(data.project_activities).to.eql([]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('');
    });

    it('sets completion_status', () => {
      expect(data.completion_status).to.equal(COMPLETION_STATUS.ACTIVE);
    });
  });

  describe('all values provided', () => {
    const projectData = {
      name: 'project name',
      type: 'type',
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1
    };

    const activityData = [{ name: 'activity1' }, { name: 'activity2' }];

    let data: GetPublicProjectData;

    before(() => {
      data = new GetPublicProjectData(projectData, activityData);
    });

    it('sets name', () => {
      expect(data.project_name).to.equal(projectData.name);
    });

    it('sets type', () => {
      expect(data.project_type).to.equal(projectData.type);
    });

    it('sets project_activities', () => {
      expect(data.project_activities).to.eql(['activity1', 'activity2']);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('2020-04-20T07:00:00.000Z');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('2020-05-20T07:00:00.000Z');
    });

    it('sets completion_status', () => {
      expect(data.completion_status).to.equal(COMPLETION_STATUS.COMPLETED);
    });
  });
});

describe('GetPublicCoordinatorData', () => {
  describe('No values provided', () => {
    let projectCoordinatorData: GetPublicCoordinatorData;

    before(() => {
      projectCoordinatorData = new GetPublicCoordinatorData(null);
    });

    it('sets first_name', function () {
      expect(projectCoordinatorData.first_name).to.equal('');
    });

    it('sets last_name', function () {
      expect(projectCoordinatorData.last_name).to.equal('');
    });

    it('sets email_address', function () {
      expect(projectCoordinatorData.email_address).to.equal('');
    });

    it('sets coordinator_agency', function () {
      expect(projectCoordinatorData.coordinator_agency).to.equal('');
    });

    it('sets share_contact_details', function () {
      expect(projectCoordinatorData.share_contact_details).to.equal('false');
    });
  });

  describe('All values provided where coordinator public is true', () => {
    let projectCoordinatorData: GetPublicCoordinatorData;

    const obj = {
      coordinator_first_name: 'first',
      coordinator_last_name: 'last',
      coordinator_email_address: 'email@example.com',
      coordinator_agency_name: 'agency',
      coordinator_public: true
    };

    before(() => {
      projectCoordinatorData = new GetPublicCoordinatorData(obj);
    });

    it('sets first_name', function () {
      expect(projectCoordinatorData.first_name).to.equal(obj.coordinator_first_name);
    });

    it('sets last_name', function () {
      expect(projectCoordinatorData.last_name).to.equal(obj.coordinator_last_name);
    });

    it('sets email_address', function () {
      expect(projectCoordinatorData.email_address).to.equal(obj.coordinator_email_address);
    });

    it('sets coordinator_agency', function () {
      expect(projectCoordinatorData.coordinator_agency).to.equal(obj.coordinator_agency_name);
    });

    it('sets share_contact_details', function () {
      expect(projectCoordinatorData.share_contact_details).to.equal('true');
    });
  });

  describe('All values provided where coordinator public is false', () => {
    let projectCoordinatorData: GetPublicCoordinatorData;

    const obj = {
      coordinator_first_name: 'first',
      coordinator_last_name: 'last',
      coordinator_email_address: 'email@example.com',
      coordinator_agency_name: 'agency',
      coordinator_public: false
    };

    before(() => {
      projectCoordinatorData = new GetPublicCoordinatorData(obj);
    });

    it('sets first_name', function () {
      expect(projectCoordinatorData.first_name).to.equal('');
    });

    it('sets last_name', function () {
      expect(projectCoordinatorData.last_name).to.equal('');
    });

    it('sets email_address', function () {
      expect(projectCoordinatorData.email_address).to.equal('');
    });

    it('sets coordinator_agency', function () {
      expect(projectCoordinatorData.coordinator_agency).to.equal(obj.coordinator_agency_name);
    });

    it('sets share_contact_details', function () {
      expect(projectCoordinatorData.share_contact_details).to.equal('false');
    });
  });
});
