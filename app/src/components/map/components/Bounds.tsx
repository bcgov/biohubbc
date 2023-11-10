import { Feature, Polygon } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { getFeatureObjectFromLatLngBounds } from 'utils/Utils';

export interface ISetMapBoundsProps {
  bounds?: LatLngBoundsExpression;
  zoom?: number;
}

export const SetMapBounds: React.FC<React.PropsWithChildren<ISetMapBoundsProps>> = (props) => {
  const map = useMap();

  useEffect(() => {
    // Set bounds if provided, ignore zoom
    if (props.bounds) {
      map.fitBounds(props.bounds);
    } else if (props.zoom) {
      // Set zoom if provided
      map.setZoom(props.zoom);
    }
  }, [map, props.bounds, props.zoom]);

  return null;
};

export type IMapBoundsOnChange = (bounds: Feature<Polygon>, zoom: number) => void;

export interface IGetMapBoundsProps {
  onChange: IMapBoundsOnChange;
}

export const GetMapBounds: React.FC<React.PropsWithChildren<IGetMapBoundsProps>> = (props) => {
  const { onChange } = props;

  const map = useMapEvents({
    zoomend() {
      const latLngBounds = map.getBounds();
      map.closePopup();

      const featureBounds = getFeatureObjectFromLatLngBounds(latLngBounds);

      onChange(featureBounds, map.getZoom());
    },
    moveend() {
      const latLngBounds = map.getBounds();
      map.closePopup();

      const featureBounds = getFeatureObjectFromLatLngBounds(latLngBounds);

      onChange(featureBounds, map.getZoom());
    }
  });

  return null;
};
