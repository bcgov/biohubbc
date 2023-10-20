import MapContainer from 'components/map/MapContainer';
import { createMemoryHistory } from 'history';
import { GetRegionsResponse } from 'hooks/api/useSpatialApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetSearchResultsResponse } from 'interfaces/useSearchApi.interface';
import { Router } from 'react-router-dom';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import SearchPage from './SearchPage';

const history = createMemoryHistory();

// Mock MapContainer component
jest.mock('../../components/map/MapContainer');
const mockMapContainer = MapContainer as jest.Mock;

// Mock useBioHubApi
jest.mock('../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  search: {
    getSearchResults: jest.fn()
  },
  spatial: {
    getRegions: jest.fn<Promise<GetRegionsResponse>, []>()
  }
};

describe('SearchPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockMapContainer.mockImplementation(() => <div />);
    mockUseApi.spatial.getRegions.mockClear();

    mockUseApi.spatial.getRegions.mockResolvedValue({
      regions: []
    });
  });

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

    mockUseApi.search.getSearchResults.mockResolvedValue(mockSearchResponse);

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
