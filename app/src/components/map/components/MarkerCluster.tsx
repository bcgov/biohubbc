import { createLayerComponent } from '@react-leaflet/core';
import L, { LatLngTuple } from 'leaflet';
import React, { ReactElement } from 'react';
import { FeatureGroup, LayersControl, MarkerProps, Popup, PopupProps, Tooltip, TooltipProps } from 'react-leaflet';

export interface IMarker {
  position: LatLngTuple;
  count: number;
  key: string | number;
  MarkerProps?: Partial<MarkerProps>;
  popup?: ReactElement;
  PopupProps?: Partial<PopupProps>;
  tooltip?: ReactElement;
  TooltipProps?: Partial<TooltipProps>;
}

export interface IMarkerLayer {
  layerName: string;
  markers: IMarker[];
}

export interface IMarkerLayersProps {
  layers?: IMarkerLayer[];
}

const makeCountIcon = (count: number) => {
  return L.divIcon({
    html: `<div><span>${count}</span></div>`,
    className: 'marker-cluster marker-cluster-small',
    iconSize: new L.Point(24, 24)
  });
};

const CountMarker: any = L.Marker.extend({
  options: {
    count: 1
  },

  setCount(s: number) {
    this.options.count = s;
  },

  initialize(latlng: number[], { count, ...options }: { count: number }) {
    L.Util.setOptions(this, {
      count,
      ...options
    });

    (L.CircleMarker.prototype as any).initialize.call(this, latlng, {
      count,
      ...options,
      icon: makeCountIcon(count)
    });
  }
});

const Marker = createLayerComponent<L.Marker & { setCount: (count: number) => void }, MarkerProps & { count: number }>(
  ({ position, ...options }: MarkerProps & { count: number }, ctx) => {
    const instance = new CountMarker(position, options);
    return {
      instance,
      context: { ...ctx, overlayContainer: instance }
    };
  },
  (marker, props, prevProps) => {
    if (props.count !== prevProps.count) {
      marker.setCount(props.count);
    }
    if (props.position !== prevProps.position) {
      marker.setLatLng(props.position);
    }

    if (props.icon != null && props.icon !== prevProps.icon) {
      marker.setIcon(props.icon);
    }

    if (props.zIndexOffset != null && props.zIndexOffset !== prevProps.zIndexOffset) {
      marker.setZIndexOffset(props.zIndexOffset);
    }

    if (props.opacity != null && props.opacity !== prevProps.opacity) {
      marker.setOpacity(props.opacity);
    }

    if (marker.dragging != null && props.draggable !== prevProps.draggable) {
      if (props.draggable === true) {
        marker.dragging.enable();
      } else {
        marker.dragging.disable();
      }
    }
  }
);

const MarkerCluster: React.FC<React.PropsWithChildren<IMarkerLayersProps>> = (props) => {
  if (!props.layers?.length) {
    return null;
  }

  const layerControls: ReactElement[] = [];

  props.layers.forEach((layer) => {
    if (!layer.markers?.length) {
      return;
    }

    layerControls.push(
      <LayersControl.Overlay checked={true} name={layer.layerName} key={`marker-layer-${layer.layerName}}`}>
        <FeatureGroup>
          {layer.markers.map((item) => {
            const id = item.key;
            return (
              <Marker
                count={item.count || 0}
                key={`marker-cluster-${id}`}
                position={[item.position[1], item.position[0]]}
                {...item.MarkerProps}>
                {item.tooltip && (
                  <Tooltip key={`marker-cluster-tooltip-${id}`} direction="top" {...item.TooltipProps}>
                    {item.tooltip}
                  </Tooltip>
                )}
                {item.popup && (
                  <Popup
                    key={`marker-cluster-popup-${id}`}
                    keepInView={false}
                    closeButton={false}
                    autoPan={false}
                    {...item.PopupProps}>
                    {item.popup}
                  </Popup>
                )}
              </Marker>
            );
          })}
        </FeatureGroup>
      </LayersControl.Overlay>
    );
  });

  return <>{layerControls}</>;
};

export default MarkerCluster;
