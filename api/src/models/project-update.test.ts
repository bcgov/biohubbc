import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetCoordinatorData,
  GetPartnershipsData,
  GetObjectivesData,
  PutCoordinatorData,
  PutPartnershipsData,
  PutSpeciesData,
  PutObjectivesData
} from './project-update';

describe('PutPartnershipsData', () => {
  describe('No values provided', () => {
    let data: PutPartnershipsData;

    before(() => {
      data = new PutPartnershipsData({});
    });

    it('sets indigenous_partnerships', () => {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', () => {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('all values provided', () => {
    const obj = {
      indigenous_partnerships: [1, 2],
      stakeholder_partnerships: ['partner 3', 'partner 4']
    };

    let data: PutPartnershipsData;

    before(() => {
      data = new PutPartnershipsData(obj);
    });

    it('sets indigenous_partnerships', () => {
      expect(data.indigenous_partnerships).to.eql(obj.indigenous_partnerships);
    });

    it('sets stakeholder_partnerships', () => {
      expect(data.stakeholder_partnerships).to.eql(obj.stakeholder_partnerships);
    });
  });
});

describe('GetPartnershipsData', () => {
  describe('No values provided', () => {
    let data: GetPartnershipsData;

    before(() => {
      data = new GetPartnershipsData([], []);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('indigenous_partnerships values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships = [{ id: 1 }, { id: 2 }];
    const stakeholder_partnerships: string[] = [];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([1, 2]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('stakeholder_partnerships values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships: string[] = [];
    const stakeholder_partnerships = [{ name: 'partner 1' }, { name: 'partner 2' }];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql(['partner 1', 'partner 2']);
    });
  });

  describe('All values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships = [{ id: 1 }, { id: 2 }];
    const stakeholder_partnerships = [{ name: 'partner 3' }, { name: 'partner 4' }];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([1, 2]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql(['partner 3', 'partner 4']);
    });
  });
});

describe('GetCoordinatorData', () => {
  describe('No values provided', () => {
    let data: GetCoordinatorData;

    before(() => {
      data = new GetCoordinatorData({});
    });

    it('sets first_name', () => {
      expect(data.first_name).to.equal(null);
    });

    it('sets last_name', () => {
      expect(data.last_name).to.equal(null);
    });

    it('sets email_address', () => {
      expect(data.email_address).to.equal(null);
    });

    it('sets coordinator_agency', () => {
      expect(data.coordinator_agency).to.equal(null);
    });

    it('sets share_contact_details', () => {
      expect(data.share_contact_details).to.equal('false');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      coordinator_first_name: 'coordinator_first_name',
      coordinator_last_name: 'coordinator_last_name',
      coordinator_email_address: 'coordinator_email_address',
      coordinator_agency_name: 'coordinator_agency_name',
      coordinator_public: true,
      revision_count: 1
    };

    let data: GetCoordinatorData;

    before(() => {
      data = new GetCoordinatorData(obj);
    });

    it('sets first_name', () => {
      expect(data.first_name).to.equal('coordinator_first_name');
    });

    it('sets last_name', () => {
      expect(data.last_name).to.equal('coordinator_last_name');
    });

    it('sets email_address', () => {
      expect(data.email_address).to.equal('coordinator_email_address');
    });

    it('sets coordinator_agency', () => {
      expect(data.coordinator_agency).to.equal('coordinator_agency_name');
    });

    it('sets share_contact_details', () => {
      expect(data.share_contact_details).to.equal('true');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});

describe('PutCoordinatorData', () => {
  describe('No values provided', () => {
    let data: PutCoordinatorData;

    before(() => {
      data = new PutCoordinatorData({});
    });

    it('sets first_name', () => {
      expect(data.first_name).to.equal(null);
    });

    it('sets last_name', () => {
      expect(data.last_name).to.equal(null);
    });

    it('sets email_address', () => {
      expect(data.email_address).to.equal(null);
    });

    it('sets coordinator_agency', () => {
      expect(data.coordinator_agency).to.equal(null);
    });

    it('sets share_contact_details', () => {
      expect(data.share_contact_details).to.equal(false);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      first_name: 'coordinator_first_name',
      last_name: 'coordinator_last_name',
      email_address: 'coordinator_email_address',
      coordinator_agency: 'coordinator_agency_name',
      share_contact_details: 'true',
      revision_count: 1
    };

    let data: PutCoordinatorData;

    before(() => {
      data = new PutCoordinatorData(obj);
    });

    it('sets first_name', () => {
      expect(data.first_name).to.equal('coordinator_first_name');
    });

    it('sets last_name', () => {
      expect(data.last_name).to.equal('coordinator_last_name');
    });

    it('sets email_address', () => {
      expect(data.email_address).to.equal('coordinator_email_address');
    });

    it('sets coordinator_agency', () => {
      expect(data.coordinator_agency).to.equal('coordinator_agency_name');
    });

    it('sets share_contact_details', () => {
      expect(data.share_contact_details).to.equal(true);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});

describe('PutSpeciesData', () => {
  describe('No values provided', () => {
    let data: PutSpeciesData;

    before(() => {
      data = new PutSpeciesData({});
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });
  });

  describe('all values provided', () => {
    const obj = {
      focal_species: ['species 1', 'species 2'],
      ancillary_species: ['species 3', 'species 4']
    };

    let data: PutSpeciesData;

    before(() => {
      data = new PutSpeciesData(obj);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql(obj.focal_species);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql(obj.ancillary_species);
    });
  });
});

describe('GetObjectivesData', () => {
  describe('No values provided', () => {
    let data: GetObjectivesData;

    before(() => {
      data = new GetObjectivesData({});
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal(null);
    });

    it('sets caveats', () => {
      expect(data.caveats).to.equal(null);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      objectives: 'objectives',
      caveats: 'caveats',
      revision_count: 1
    };

    let data: GetObjectivesData;

    before(() => {
      data = new GetObjectivesData(obj);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal(obj.objectives);
    });

    it('sets caveats', () => {
      expect(data.caveats).to.equal(obj.caveats);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(obj.revision_count);
    });
  });
});

describe('PutObjectivesData', () => {
  describe('No values provided', () => {
    let data: PutObjectivesData;

    before(() => {
      data = new PutObjectivesData({});
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal('');
    });

    it('sets caveats', () => {
      expect(data.caveats).to.equal(null);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      objectives: 'objectives',
      caveats: 'caveats',
      revision_count: 1
    };

    let data: PutObjectivesData;

    before(() => {
      data = new PutObjectivesData(obj);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal('objectives');
    });

    it('sets caveats', () => {
      expect(data.caveats).to.equal('caveats');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});
