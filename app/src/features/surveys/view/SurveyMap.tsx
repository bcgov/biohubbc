import { mdiMapSearchOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Skeleton } from '@mui/material';
import grey from '@mui/material/colors/grey';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { LatLngBoundsExpression } from 'leaflet';
import { useState } from 'react';
import { GeoJSON, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { coloredPoint, INonEditableGeometries } from 'utils/mapUtils';
import { v4 as uuidv4 } from 'uuid';

interface ISurveyMapProps {
  mapPoints: INonEditableGeometries[];
}
// TODO: need a way to pass in the map dimensions depending on the screen size
const SurveyMap = (props: ISurveyMapProps) => {
  const [bounds] = useState<LatLngBoundsExpression | undefined>(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
  return (
    <>
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          '& svg': {
            color: grey[300]
          }
        }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }}
        />
        <Icon path={mdiMapSearchOutline} size={2} />
      </Box>

      <LeafletMapContainer
        data-testid="leaflet-survey-map"
        id="survey-map"
        center={MAP_DEFAULT_CENTER}
        scrollWheelZoom={false}
        fullscreenControl={true}
        // style={{ height: '100%', width: '800px' }}
        style={{ height: '100%' }}>
        <MapBaseCss />
        <FullScreenScrollingEventHandler bounds={bounds} scrollWheelZoom={false} />
        <SetMapBounds bounds={bounds} />

        {props.mapPoints?.map((nonEditableGeo: INonEditableGeometries) => (
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
    </>
  );
};

export default SurveyMap;
