import { Box, Paper, Toolbar } from '@mui/material';
import Button from '@mui/material/Button';
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

export enum SurveyMapData {
  OBSERVATIONS = 'Observations',
  TELEMETRY = 'Telemetry',
  MARKED_ANIMALS = 'Marked Animals'
}

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

  const [mapPoints, setMapPoints] = useState<INonEditableGeometries[]>(surveyObservations);

  const setCurrentDataSet = (dataset: SurveyMapData) => {
    console.log(`Current Data Selected: ${dataset}`);
    switch (dataset) {
      case SurveyMapData.OBSERVATIONS:
        setMapPoints(surveyObservations);
        break;
      case SurveyMapData.TELEMETRY:
        setMapPoints([]);
        break;
      case SurveyMapData.MARKED_ANIMALS:
        setMapPoints([]);
        break;

      default:
        setMapPoints([]);
        break;
    }
  };

  return (
    <Paper elevation={0}>
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
        <Box>
          <Button onClick={() => setCurrentDataSet(SurveyMapData.OBSERVATIONS)}>Observations</Button>
          <Button onClick={() => setCurrentDataSet(SurveyMapData.TELEMETRY)}>Telemetry</Button>
          <Button onClick={() => setCurrentDataSet(SurveyMapData.MARKED_ANIMALS)}>Marked Animals</Button>
        </Box>
        <Button variant="contained" color="primary" title="Manage Map">
          Manage
        </Button>
      </Toolbar>
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
