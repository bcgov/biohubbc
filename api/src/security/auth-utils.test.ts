import { expect } from 'chai';
import { describe } from 'mocha';
import { userHasValidSystemRoles } from './auth-utils';

describe('userHasValidSystemRoles', () => {
  describe('validSystemRoles is a string', () => {
    describe('userSystemRoles is a string', () => {
      it('returns false if the user has no roles', () => {
        const response = userHasValidSystemRoles('admin', '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles('admin', 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = userHasValidSystemRoles('admin', 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles('admin', []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles('admin', ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = userHasValidSystemRoles('admin', ['admin']);

        expect(response).to.be.true;
      });
    });
  });

  describe('validSystemRoles is an array', () => {
    describe('userSystemRoles is a string', () => {
      it('returns false if the user has no roles', () => {
        const response = userHasValidSystemRoles(['admin'], '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles(['admin'], 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = userHasValidSystemRoles(['admin'], 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles(['admin'], []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles(['admin'], ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = userHasValidSystemRoles(['admin'], ['admin']);

        expect(response).to.be.true;
      });
    });
  });
});
