import axios from 'axios';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiGeneralError } from '../errors/api-error';
import { KeycloakService } from './keycloak-service';

chai.use(sinonChai);

describe('KeycloakService', () => {
  beforeEach(() => {
    process.env.KEYCLOAK_API_TOKEN_URL = 'https://host.com/auth/token';
    process.env.KEYCLOAK_API_CLIENT_ID = 'client-456';
    process.env.KEYCLOAK_API_CLIENT_SECRET = 'secret';
    process.env.KEYCLOAK_API_HOST = 'https://api.host.com/auth';
    process.env.KEYCLOAK_INTEGRATION_ID = '123';
    process.env.KEYCLOAK_API_ENVIRONMENT = 'dev';
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getKeycloakCssApiToken', async () => {
    it('authenticates with keycloak and returns an access token', async () => {
      const mockAxiosResponse = { data: { access_token: 'token' } };

      const axiosStub = sinon.stub(axios, 'post').resolves(mockAxiosResponse);

      const keycloakService = new KeycloakService();

      const response = await keycloakService.getKeycloakCssApiToken();

      expect(response).to.eql('token');

      expect(axiosStub).to.have.been.calledWith(
        'https://host.com/auth/token',
        'grant_type=client_credentials&client_id=client-456&client_secret=secret',
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
    });

    it('catches and re-throws an error', async () => {
      sinon.stub(axios, 'post').rejects(new Error('a test error'));

      const keycloakService = new KeycloakService();

      try {
        await keycloakService.getKeycloakCssApiToken();

        expect.fail();
      } catch (error) {
        expect((error as ApiGeneralError).message).to.equal('Failed to authenticate with keycloak');
        expect((error as ApiGeneralError).errors).to.eql(['a test error']);
      }
    });
  });

  describe('findIDIRUsers', async () => {
    it('finds matching idir users', async () => {
      sinon.stub(KeycloakService.prototype, 'getKeycloakCssApiToken').resolves('token');

      const mockAxiosResponse = {
        data: {
          data: [
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
          ]
        }
      };

      const axiosStub = sinon.stub(axios, 'get').resolves(mockAxiosResponse);

      const keycloakService = new KeycloakService();

      const response = await keycloakService.findIDIRUsers({ guid: '123456789' });

      expect(response).to.eql([
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
      ]);

      expect(axiosStub).to.have.been.calledWith('https://api.host.com/auth/dev/idir/users?guid=123456789', {
        headers: { authorization: 'Bearer token' }
      });
    });

    it('throws an error if no data is returned', async () => {
      sinon.stub(KeycloakService.prototype, 'getKeycloakCssApiToken').resolves('token');

      sinon.stub(axios, 'get').resolves({ data: null });

      const keycloakService = new KeycloakService();

      try {
        await keycloakService.findIDIRUsers({ guid: '123456789' });

        expect.fail();
      } catch (error) {
        expect((error as ApiGeneralError).message).to.equal('Failed to get user info from keycloak');
        expect((error as ApiGeneralError).errors).to.eql(['Found no matching keycloak idir users']);
      }
    });

    it('catches and re-throws an error', async () => {
      sinon.stub(KeycloakService.prototype, 'getKeycloakCssApiToken').resolves('token');

      sinon.stub(axios, 'get').rejects(new Error('a test error'));

      const keycloakService = new KeycloakService();

      try {
        await keycloakService.findIDIRUsers({ guid: '123456789' });

        expect.fail();
      } catch (error) {
        expect((error as ApiGeneralError).message).to.equal('Failed to get user info from keycloak');
        expect((error as ApiGeneralError).errors).to.eql(['a test error']);
      }
    });
  });
});
