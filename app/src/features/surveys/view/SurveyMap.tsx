import { Box, Paper } from '@mui/material';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { ObservationsContext } from 'contexts/observationsContext';
import { Position } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useContext, useMemo, useState } from 'react';
import { GeoJSON, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { coloredPoint, INonEditableGeometries } from 'utils/mapUtils';
import { v4 as uuidv4 } from 'uuid';
import NoSurveySectionData from '../components/NoSurveySectionData';
import SurveyMapToolBar from './components/SurveyMapToolBar';

const SurveyMap = () => {
  const observationsContext = useContext(ObservationsContext);
  // set default bounds to encompass all of BC
  const [bounds] = useState<LatLngBoundsExpression | undefined>(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));

  const surveyObservations: INonEditableGeometries[] = useMemo(() => {
    const observations = observationsContext.observationsDataLoader.data?.surveyObservations;

    if (!observations) {
      return [];
    }

    return observations
      .filter((observation) => observation.latitude !== undefined && observation.longitude !== undefined)
      .map((observation) => {
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
        };
      });
  }, [observationsContext.observationsDataLoader.data]);

  const [mapPoints] = useState<INonEditableGeometries[]>(surveyObservations);

  return (
    <Paper elevation={0}>
      <SurveyMapToolBar />
      <Box position="relative" height={{ sm: 400, md: 600 }}>
        <LeafletMapContainer
          data-testid="leaflet-survey-map"
          id="survey-map"
          center={MAP_DEFAULT_CENTER}
          scrollWheelZoom={false}
          fullscreenControl={true}
          style={{ height: '100%' }}>
          <MapBaseCss />
          <FullScreenScrollingEventHandler bounds={bounds} scrollWheelZoom={false} />
          <SetMapBounds bounds={bounds} />

          {mapPoints?.map((nonEditableGeo: INonEditableGeometries) => (
            <GeoJSON
              key={uuidv4()}
              data={nonEditableGeo.feature}
              pointToLayer={(_, latlng) => coloredPoint({ latlng, fillColor: '#1f7dff', borderColor: '#ffffff' })}>
              {nonEditableGeo.popupComponent}
            </GeoJSON>
          ))}

          <LayersControl position="bottomright">
            <BaseLayerControls />
          </LayersControl>
        </LeafletMapContainer>
      </Box>
      <Box>
        <Box p={3}>
          <NoSurveySectionData text="No data available" paperVariant="outlined" />
        </Box>
      </Box>
    </Paper>
  );
};

export default SurveyMap;
