import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { PropsWithChildren } from 'react';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import useTaxonomyApi from './useTaxonomyApi';

describe('useTaxonomyApi', () => {
  let mock: MockAdapter;

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
            commonNames: ['Something'],
            scientificName: 'Something'
          },
          {
            tsn: '2',
            commonNames: ['Anything'],
            scientificName: 'Anything'
          }
        ]
      };

      mock.onGet('/api/taxonomy/species/list').reply(200, mockResponse);

      const { result } = renderHook(() => useTaxonomyApi(), { wrapper });

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

  describe('searchSpeciesByTerms', () => {
    it('searchSpeciesByTerms works as expected', async () => {
      const mockSearchTermResponse = {
        searchResponse: [
          {
            tsn: '3',
            commonNames: ['Something'],
            scientificName: 'Something'
          },
          {
            tsn: '4',
            commonNames: ['Anything'],
            scientificName: 'Anything'
          }
        ]
      };

      mock.onGet('/api/taxonomy/species').reply(200, mockSearchTermResponse);

      const { result } = renderHook(() => useTaxonomyApi(), { wrapper });

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
