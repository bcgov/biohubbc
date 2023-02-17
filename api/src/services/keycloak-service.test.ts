import axios from 'axios';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiGeneralError } from '../errors/api-error';
import { KeycloakService } from './keycloak-service';

chai.use(sinonChai);

describe('KeycloakService', () => {
  beforeEach(() => {
    process.env.KEYCLOAK_REALM = 'realm';
    process.env.KEYCLOAK_API_HOST = 'api-host';
    process.env.KEYCLOAK_ADMIN_USERNAME = 'admin';
    process.env.KEYCLOAK_ADMIN_PASSWORD = 'password';
    process.env.KEYCLOAK_INTEGRATION_ID = '1234';
    process.env.KEYCLOAK_ENVIRONMENT = 'test-env';
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getKeycloakToken', async () => {
    it('authenticates with keycloak and returns an access token', async () => {
      const mockAxiosResponse = { data: { access_token: 'token' } };

      const axiosStub = sinon.stub(axios, 'post').resolves(mockAxiosResponse);

      const keycloakService = new KeycloakService();

      const response = await keycloakService.getKeycloakToken();

      expect(response).to.eql('token');

      expect(axiosStub).to.have.been.calledWith(
        `${'host'}/realms/${'realm'}/protocol/openid-connect/token`,
        `${'grant_type=client_credentials'}&${'client_id=admin'}&${'client_secret=password'}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
    });

    it('catches and re-throws an error', async () => {
      sinon.stub(axios, 'post').rejects(new Error('a test error'));

      const keycloakService = new KeycloakService();

      try {
        await keycloakService.getKeycloakToken();

        expect.fail();
      } catch (error) {
        expect((error as ApiGeneralError).message).to.equal('Failed to authenticate with keycloak');
        expect((error as ApiGeneralError).errors).to.eql(['a test error']);
      }
    });
  });

  describe('getUserByUsername', async () => {
    it('authenticates with keycloak and returns an access token', async () => {
      sinon.stub(KeycloakService.prototype, 'getKeycloakToken').resolves('token');

      const mockAxiosResponse = {
        data: {
          users: [
            {
              username: 'username',
              email: 'email',
              firstName: 'firstName',
              lastName: 'lastName',
              attributes: {
                idir_user_guid: ['string1'],
                idir_userid: ['string2'],
                idir_guid: ['string3'],
                displayName: ['string4']
              }
            }
          ],
          roles: []
        }
      };

      const axiosStub = sinon.stub(axios, 'get').resolves(mockAxiosResponse);

      const keycloakService = new KeycloakService();

      const response = await keycloakService.getUserByUsername('test@idir');

      expect(response).to.eql({
        username: 'username',
        email: 'email',
        firstName: 'firstName',
        lastName: 'lastName',
        attributes: {
          idir_user_guid: ['string1'],
          idir_userid: ['string2'],
          idir_guid: ['string3'],
          displayName: ['string4']
        }
      });

      expect(axiosStub).to.have.been.calledWith(
        `${'api-host'}/integrations/${'1234'}/test-env/user-role-mappings?${'username=test%40idir'}`,
        {
          headers: { authorization: 'Bearer token' }
        }
      );
    });

    it('throws an error if no users are found', async () => {
      sinon.stub(KeycloakService.prototype, 'getKeycloakToken').resolves('token');

      sinon.stub(axios, 'get').resolves({ data: { users: [], roles: [] } });

      const keycloakService = new KeycloakService();

      try {
        await keycloakService.getUserByUsername('test@idir');

        expect.fail();
      } catch (error) {
        expect((error as ApiGeneralError).message).to.equal('Failed to get user info from keycloak');
        expect((error as ApiGeneralError).errors).to.eql(['Found no matching keycloak users']);
      }
    });

    it('throws an error if more than 1 user is  found', async () => {
      sinon.stub(KeycloakService.prototype, 'getKeycloakToken').resolves('token');

      sinon.stub(axios, 'get').resolves({
        data: {
          users: [
            {
              username: 'user1'
            },
            {
              username: 'user2'
            }
          ],
          roles: []
        }
      });

      const keycloakService = new KeycloakService();

      try {
        await keycloakService.getUserByUsername('test@idir');

        expect.fail();
      } catch (error) {
        expect((error as ApiGeneralError).message).to.equal('Failed to get user info from keycloak');
        expect((error as ApiGeneralError).errors).to.eql(['Found too many matching keycloak users']);
      }
    });

    it('catches and re-throws an error', async () => {
      sinon.stub(KeycloakService.prototype, 'getKeycloakToken').resolves('token');

      sinon.stub(axios, 'get').rejects(new Error('a test error'));

      const keycloakService = new KeycloakService();

      try {
        await keycloakService.getUserByUsername('test@idir');

        expect.fail();
      } catch (error) {
        expect((error as ApiGeneralError).message).to.equal('Failed to get user info from keycloak');
        expect((error as ApiGeneralError).errors).to.eql(['a test error']);
      }
    });
  });
});
