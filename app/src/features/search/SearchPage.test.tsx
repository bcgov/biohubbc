import { cleanup, render, waitFor } from '@testing-library/react';
import MapContainer from 'components/map/MapContainer';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetSearchResultsResponse } from 'interfaces/useSearchApi.interface';
import React from 'react';
import { Router } from 'react-router-dom';
import SearchPage from './SearchPage';

const history = createMemoryHistory();

// Mock MapContainer component
jest.mock('../../components/map/MapContainer', () => jest.fn(() => <div />));

// Mock useBioHubApi
jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  search: {
    getSearchResults: jest.fn()
  },
  external: {
    post: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('SearchPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    const mockSearchResponse: IGetSearchResultsResponse[] = [
      {
        id: '1',
        name: 'name',
        objectives: 'objectives',
        associatedtaxa: 'CODE',
        lifestage: 'lifestage',
        geometry: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {}
          }
        ]
      }
    ];

    mockBiohubApi().search.getSearchResults.mockResolvedValue(mockSearchResponse);

    const { getByText } = render(
      <Router history={history}>
        <SearchPage />
      </Router>
    );

    await waitFor(() => {
      // Assert MapBoundary was rendered with the right propsF
      expect(MapContainer).toHaveBeenCalledWith(
        {
          mapId: 'search_boundary_map',
          scrollWheelZoom: true,
          clusteredPointGeometries: [
            {
              coordinates: [0, 0],
              popupComponent: expect.anything()
            }
          ]
        },
        expect.anything()
      );
      // Assert section header
      expect(getByText('Map')).toBeInTheDocument();
    });
  });
});
