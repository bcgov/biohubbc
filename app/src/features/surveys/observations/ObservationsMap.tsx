import { useContext, useMemo } from 'react';
import Box from '@mui/material/Box';
import MapContainer, { INonEditableGeometries } from 'components/map/MapContainer';
import { ObservationsContext } from 'contexts/observationsContext';
import { Position } from 'geojson';

const ObservationsMap = () => {
  const observationsContext = useContext(ObservationsContext);

  const surveyObservations: INonEditableGeometries[] = useMemo(() => {
    const observations = observationsContext.observationsDataLoader.data?.surveyObservations;

    if (!observations) {
      return [];
    }

    return observations
      .filter((observation) => observation.latitude !== undefined && observation.longitude !== undefined)
      .map((observation) => ({
        feature: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [observation.longitude, observation.latitude] as Position
          }
        }
      }));
  }, [observationsContext.observationsDataLoader.data])

  return (
    <Box position="relative" height={600} sx={{ px: 3, pb: 3 }}>
      <MapContainer
        mapId="survey_observations_map"
        scrollWheelZoom={true}
        nonEditableGeometries={surveyObservations}
      />
    </Box>
  );
};

export default ObservationsMap;
