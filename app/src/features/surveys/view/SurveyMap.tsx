import { SkeletonMap } from 'components/loading/SkeletonLoaders';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { LatLngBoundsExpression } from 'leaflet';
import { useMemo } from 'react';
import { GeoJSON, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { coloredPoint, INonEditableGeometries } from 'utils/mapUtils';

interface ISurveyMapProps {
  mapPoints: INonEditableGeometries[];
  isLoading: boolean;
}

// TODO: need a way to pass in the map dimensions depending on the screen size
const SurveyMap = (props: ISurveyMapProps) => {
  const bounds: LatLngBoundsExpression | undefined = useMemo(() => {
    if (props.mapPoints.length > 0) {
      return calculateUpdatedMapBounds(props.mapPoints.map((item) => item.feature));
    } else {
      return calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]);
    }
  }, [props.mapPoints]);

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

          {props.mapPoints?.map((nonEditableGeo: INonEditableGeometries, index: number) => {
            const key = nonEditableGeo.feature.id ?? index;

            return (
              <GeoJSON
                key={key}
                data={nonEditableGeo.feature}
                pointToLayer={(_, latlng) => coloredPoint({ latlng, fillColor: '#1f7dff', borderColor: '#ffffff' })}>
                {nonEditableGeo.popupComponent}
              </GeoJSON>
            );
          })}

          <LayersControl position="topright">
            <BaseLayerControls />
          </LayersControl>
        </LeafletMapContainer>
      )}
    </>
  );
};

export default SurveyMap;
