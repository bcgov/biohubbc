import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import React, { useState, useContext } from 'react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { APIError } from 'hooks/api/useAxios';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DialogContext } from 'contexts/dialogContext';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';
import MapContainer, { IClusteredPointGeometries } from 'components/map/MapContainer';
import centroid from '@turf/centroid';
import Grid from '@material-ui/core/Grid';
import { useEffect } from 'react';
import { SearchFeaturePopup } from 'components/map/SearchFeaturePopup';

/**
 * Page to search for and display a list of records spatially.
 *
 * @return {*}
 */
const SearchPage: React.FC = () => {
  const biohubApi = useBiohubApi();

  const [geometries, setGeometries] = useState<IClusteredPointGeometries[]>([]);

  const dialogContext = useContext(DialogContext);

  const showFilterErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
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
  };

  useEffect(() => {
    const fetchResults = async () => {
      await getSearchResults();
    };

    fetchResults();
  }, []);

  const getSearchResults = async () => {
    try {
      const response = await biohubApi.search.getSearchResults();

      if (!response) {
        return;
      }

      let clusteredPointGeometries: IClusteredPointGeometries[] = [];

      response.forEach((result: any) => {
        const feature = generateValidGeometryCollection(result.geometry, result.id).geometryCollection[0];

        clusteredPointGeometries.push({
          coordinates: centroid(feature as any).geometry.coordinates,
          popupComponent: <SearchFeaturePopup featureData={result} />
        });
      });

      setGeometries(clusteredPointGeometries);
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Searching For Results',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  /**
   * Displays search results visualized on a map spatially.
   */
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography variant="h1">Search</Typography>
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
