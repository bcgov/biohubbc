import { expect } from 'chai';
import { describe } from 'mocha';
import { UserObject } from './user';

describe('UserObject', () => {
  describe('No values provided', () => {
    let data: UserObject;

    before(() => {
      data = new UserObject((null as unknown) as any);
    });

    it('sets id', function () {
      expect(data.id).to.equal(null);
    });

    it('sets user_identifier', function () {
      expect(data.user_identifier).to.equal(null);
    });

    it('sets role_names', function () {
      expect(data.role_names).to.eql([]);
    });
  });

  describe('valid values provided, no roles', () => {
    let data: UserObject;

    const userObject = { system_user_id: 1, user_identifier: 'test name', role_ids: [], role_names: [] };

    before(() => {
      data = new UserObject(userObject);
    });

    it('sets id', function () {
      expect(data.id).to.equal(1);
    });

    it('sets user_identifier', function () {
      expect(data.user_identifier).to.equal('test name');
    });

    it('sets role_ids', function () {
      expect(data.role_ids).to.eql([]);
    });

    it('sets role_names', function () {
      expect(data.role_names).to.eql([]);
    });
  });

  describe('valid values provided', () => {
    let data: UserObject;

    const userObject = {
      system_user_id: 1,
      user_identifier: 'test name',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    };

    before(() => {
      data = new UserObject(userObject);
    });

    it('sets id', function () {
      expect(data.id).to.equal(1);
    });

    it('sets user_identifier', function () {
      expect(data.user_identifier).to.equal('test name');
    });

    it('sets role_ids', function () {
      expect(data.role_ids).to.eql([1, 2]);
    });

    it('sets role_names', function () {
      expect(data.role_names).to.eql(['role 1', 'role 2']);
    });
  });
});
