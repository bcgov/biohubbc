import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import DrawControls, { IDrawControlsRef } from 'components/map/components/DrawControls';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import { RefObject, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { CreateHabitatFeatureFormValues, UpdateHabitatFeatureFormValues } from '../HabitatFeatureFormContainer';

export interface IHabitatFeatureLocationMapControl {
  mapId: string;
  drawControlsRef: RefObject<IDrawControlsRef | undefined>;
}

/**
 * Habitat feature location map control component.
 *
 * This component can be used to record a Point location on a map for a habitat feature.
 *
 * @param {IHabitatFeatureLocationMapControl} props
 * @return {*} {JSX.Element}
 */
export const HabitatFeatureLocationMapControl = <
  FormikValuesType extends CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
>(
  props: IHabitatFeatureLocationMapControl
): JSX.Element => {
  const formikProps = useFormikContext<FormikValuesType>();

  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [leafletPointId, setLeafletPointId] = useState<number | undefined>(undefined);

  const handleLocationChange = (feature: Feature) => {
    if ('coordinates' in feature.geometry) {
      formikProps.setFieldValue('latitude', String(feature.geometry.coordinates[1]));
      formikProps.setFieldValue('longitude', String(feature.geometry.coordinates[0]));
      setUpdatedBounds(calculateUpdatedMapBounds([feature]));
    }
  };

  return (
    <Paper variant="outlined">
      <Box position="relative" height={500}>
        <LeafletMapContainer
          data-testid={`leaflet-${props.mapId}`}
          style={{ height: 500 }}
          id={props.mapId}
          center={MAP_DEFAULT_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          maxZoom={17}
          fullscreenControl={true}
          scrollWheelZoom={true}>
          <MapBaseCss />
          {/* Allow scroll wheel zoom when in full screen mode */}
          <FullScreenScrollingEventHandler bounds={updatedBounds} scrollWheelZoom={false} />

          {/* Programmatically set map bounds */}
          <SetMapBounds bounds={updatedBounds} />

          <FeatureGroup data-id="draw-control-feature-group" key="draw-control-feature-group">
            <DrawControls
              ref={props.drawControlsRef}
              options={{
                // Always disable circle, circlemarker, polygon, rectangle, and polyline
                draw: { circle: false, circlemarker: false, polygon: false, rectangle: false, polyline: false }
              }}
              onLayerAdd={(event: DrawEvents.Created, id: number) => {
                if (leafletPointId) {
                  props.drawControlsRef?.current?.deleteLayer(leafletPointId);
                }

                setLeafletPointId(id);

                handleLocationChange(event.layer.toGeoJSON());
              }}
              onLayerEdit={(event: DrawEvents.Edited) => {
                event.layers.getLayers().forEach((layer: any) => {
                  handleLocationChange(layer.toGeoJSON() as Feature);
                });
              }}
              onLayerDelete={() => {
                formikProps.setFieldValue('latitude', '');
                formikProps.setFieldValue('longitude', '');
              }}
            />
          </FeatureGroup>

          <LayersControl position="bottomright">
            <StaticLayers layers={[]} />
            <BaseLayerControls />
          </LayersControl>
        </LeafletMapContainer>
      </Box>
    </Paper>
  );
};
