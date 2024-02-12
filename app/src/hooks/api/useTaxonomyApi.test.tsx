import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { PropsWithChildren } from 'react';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import useTaxonomyApi from './useTaxonomyApi';

describe('useTaxonomyApi', () => {
  let mock: any;

  const authConfig: AuthProviderProps = {
    authority: 'authority',
    client_id: 'client',
    redirect_uri: 'redirect'
  };

  const wrapper = ({ children }: PropsWithChildren) => (
    <AuthProvider {...authConfig}>
      <ConfigContext.Provider
        value={
          {
            BACKBONE_PUBLIC_API_HOST: 'http://example.com',
            BIOHUB_TAXON_PATH: '/api/taxonomy/species',
            BIOHUB_TAXON_TSN_PATH: '/api/taxonomy/species/list'
          } as IConfig
        }>
        {children}
      </ConfigContext.Provider>
    </AuthProvider>
  );

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getSpeciesFromIds', () => {
    it('getSpeciesFromIds works as expected', async () => {
      const mockResponse = {
        searchResponse: [
          {
            tsn: '1',
            commonName: 'something',
            scientificName: 'something'
          },
          {
            tsn: '2',
            commonName: 'anything',
            scientificName: 'anything'
          }
        ]
      };

      mock.onGet('/api/taxonomy/species/list').reply(200, mockResponse);

      const { result, waitFor } = renderHook(() => useTaxonomyApi(), { wrapper });

      await act(async () => {
        await waitFor(
          () => {
            result.current.getSpeciesFromIds([1, 2]).then((data) => {
              expect(data).toEqual(mockResponse.searchResponse);
            });
          },
          { timeout: 2000 }
        );
      });
    });
  });

  describe('searchSpeciesByTerms', () => {
    it('searchSpeciesByTerms works as expected', async () => {
      const mockSearchTermResponse = {
        searchResponse: [
          {
            tsn: '3',
            commonName: 'something',
            scientificName: 'something'
          },
          {
            tsn: '4',
            commonName: 'anything',
            scientificName: 'anything'
          }
        ]
      };

      mock.onGet('/api/taxonomy/species').reply(200, mockSearchTermResponse);

      const { result, waitFor } = renderHook(() => useTaxonomyApi(), { wrapper });

      await act(async () => {
        await waitFor(
          () => {
            result.current.searchSpeciesByTerms(['aaaa', 'bbbb']).then((data) => {
              expect(data).toEqual(mockSearchTermResponse.searchResponse);
            });
          },
          { timeout: 2000 }
        );
      });
    });
  });
});
