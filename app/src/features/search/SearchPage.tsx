import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import centroid from '@turf/centroid';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MapContainer, { IClusteredPointGeometries } from 'components/map/MapContainer';
import { SearchFeaturePopup } from 'components/map/SearchFeaturePopup';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { isAuthenticated } from 'utils/authUtils';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';

/**
 * Page to search for and display a list of records spatially.
 *
 * @return {*}
 */
const SearchPage: React.FC = () => {
  const biohubApi = useBiohubApi();

  const [performSearch, setPerformSearch] = useState<boolean>(true);
  const [geometries, setGeometries] = useState<IClusteredPointGeometries[]>([]);

  const dialogContext = useContext(DialogContext);
  const { keycloakWrapper } = useContext(AuthStateContext);

  const showFilterErrorDialog = useCallback(
    (textDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        ...textDialogProps,
        open: true
      });
    },
    [dialogContext]
  );

  const getSearchResults = useCallback(async () => {
    try {
      const response = isAuthenticated(keycloakWrapper)
        ? await biohubApi.search.getSearchResults()
        : await biohubApi.public.search.getSearchResults();

      if (!response) {
        setPerformSearch(false);
        return;
      }

      const clusteredPointGeometries: IClusteredPointGeometries[] = [];

      response.forEach((result: any) => {
        const feature = generateValidGeometryCollection(result.geometry, result.id).geometryCollection[0];

        clusteredPointGeometries.push({
          coordinates: centroid(feature as any).geometry.coordinates,
          popupComponent: <SearchFeaturePopup featureData={result} />
        });
      });

      setPerformSearch(false);
      setGeometries(clusteredPointGeometries);
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Searching For Results',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  }, [biohubApi.search, biohubApi.public.search, showFilterErrorDialog, keycloakWrapper]);

  useEffect(() => {
    if (performSearch) {
      getSearchResults();
    }
  }, [performSearch, getSearchResults]);

  /**
   * Displays search results visualized on a map spatially.
   */
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography variant="h1">Map</Typography>
        </Box>
        <Box>
          <Box mb={4}>
            <Grid item xs={12}>
              <Box mt={2} height={750}>
                <MapContainer
                  mapId="search_boundary_map"
                  scrollWheelZoom={true}
                  hideDrawControls={true}
                  clusteredPointGeometries={geometries}
                />
              </Box>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SearchPage;
