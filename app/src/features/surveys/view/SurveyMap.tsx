import { SkeletonMap } from 'components/loading/SkeletonLoaders';
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
  isLoading: boolean;
}
// TODO: need a way to pass in the map dimensions depending on the screen size
const SurveyMap = (props: ISurveyMapProps) => {
  //TODO:  This needs to reset bounds when the data is updated
  const [bounds] = useState<LatLngBoundsExpression | undefined>(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
  return (
    <>
      {props.isLoading ? (
        <SkeletonMap />
      ) : (
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
      )}
    </>
  );
};

export default SurveyMap;
