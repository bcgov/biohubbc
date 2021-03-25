import { expect } from 'chai';
import { describe } from 'mocha';
import { GetPartnershipsData } from './project-update';

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
