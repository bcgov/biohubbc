import { useContext, useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import MapContainer, { INonEditableGeometries } from 'components/map/MapContainer';
import { ObservationsContext } from 'contexts/observationsContext';
import { Position } from 'geojson';
import { IconButton } from '@mui/material';
import Icon from '@mdi/react';
import { makeStyles } from '@mui/styles';
import { mdiRefresh } from '@mdi/js';
import { LatLngBoundsExpression } from 'leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

const useStyles = makeStyles(() => ({
  zoomToBoundaryExtentBtn: {
    padding: '3px',
    borderRadius: '4px',
    background: '#ffffff',
    color: '#000000',
    border: '2px solid rgba(0,0,0,0.2)',
    backgroundClip: 'padding-box',
    '&:hover': {
      backgroundColor: '#eeeeee'
    }
  }
}));

const ObservationsMap = () => {
  const classes = useStyles();
  const observationsContext = useContext(ObservationsContext);

  const surveyObservations: INonEditableGeometries[] = useMemo(() => {
    const observations = observationsContext.observationsDataLoader.data?.surveyObservations;

    if (!observations) {
      return [];
    }

    return observations
      .filter((observation) => observation.latitude !== undefined && observation.longitude !== undefined)
      .map((observation) => {
        /*
        const link = observation.survey_observation_id
          ? `observations/#view-${observation.survey_observation_id}`
          : 'observations'
        */

        return {
          feature: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [observation.longitude, observation.latitude] as Position
            }
          },
          popupComponent: undefined
          /*(
            <Popup>
              <div>{JSON.stringify(observation)}</div>
              <Button component={RouterLink} to={link}>
                Check 'er Out
              </Button>
            </Popup>
          )*/
        }
      });
  }, [observationsContext.observationsDataLoader.data]);

  const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>(calculateUpdatedMapBounds(surveyObservations.map((observation) => observation.feature)));

  const zoomToBoundaryExtent = useCallback(() => {
    const features = surveyObservations.map((observation) => observation.feature);
    const updatedBounds = calculateUpdatedMapBounds(features)
    setBounds(updatedBounds);
  }, [surveyObservations]);

  return (
    <Box position="relative" height={600}>
      <MapContainer
        mapId="survey_observations_map"
        bounds={bounds}
        scrollWheelZoom={true}
        nonEditableGeometries={surveyObservations}
        zoom={6}
      />
      {surveyObservations.length > 0 && (
        <Box position="absolute" top="126px" left="10px" zIndex="999">
          <IconButton
            aria-label="zoom to initial extent"
            title="Zoom to initial extent"
            className={classes.zoomToBoundaryExtentBtn}
            onClick={() => zoomToBoundaryExtent()}>
            <Icon size={1} path={mdiRefresh} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default ObservationsMap;
