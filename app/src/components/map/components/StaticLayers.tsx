import { Feature } from 'geojson';
import * as L from 'leaflet';
import React, { ReactElement } from 'react';
import {
  FeatureGroup,
  GeoJSON,
  GeoJSONProps,
  LayersControl,
  Popup,
  PopupProps,
  Tooltip,
  TooltipProps
} from 'react-leaflet';

export interface IStaticLayerFeature {
  geoJSON: Feature;
  key?: string | number;
  GeoJSONProps?: Partial<GeoJSONProps>;
  popup?: ReactElement;
  PopupProps?: Partial<PopupProps>;
  tooltip?: ReactElement;
  TooltipProps?: Partial<TooltipProps>;
}

export interface IStaticLayer {
  visible: boolean;
  layerName: string;
  features: IStaticLayerFeature[];
}

export interface IStaticLayersProps {
  layers?: IStaticLayer[];
}

const StaticLayers: React.FC<React.PropsWithChildren<IStaticLayersProps>> = (props) => {
  if (!props.layers?.length) {
    return null;
  }

  const layerControls: ReactElement[] = [];

  props.layers.forEach((layer, index) => {
    if (!layer.features?.length) {
      return;
    }

    layerControls.push(
      <LayersControl.Overlay checked={layer.visible} name={layer.layerName} key={`static-layer-${layer.layerName}`}>
        <FeatureGroup key={`static-feature-group-${layer.layerName}`}>
          {layer.features.map((item, index) => {
            const id = item.key || item.geoJSON.id || index;

            return (
              <GeoJSON
                key={`static-feature-${id}`}
                pointToLayer={(feature, latlng) => {
                  if (feature.properties?.radius) {
                    return new L.Circle([latlng.lat, latlng.lng], feature.properties.radius);
                  }

                  return new L.Marker([latlng.lat, latlng.lng]);
                }}
                data={item.geoJSON}
                {...item.GeoJSONProps}>
                {item.tooltip && (
                  <Tooltip key={`static-feature-tooltip-${id}`} direction="top" {...item.TooltipProps}>
                    {item.tooltip}
                  </Tooltip>
                )}
                {item.popup && (
                  <Popup
                    key={`static-feature-popup-${id}`}
                    keepInView={false}
                    closeButton={false}
                    autoPan={false}
                    {...item.PopupProps}>
                    {item.popup}
                  </Popup>
                )}
              </GeoJSON>
            );
          })}
        </FeatureGroup>
      </LayersControl.Overlay>
    );
  });

  return <>{layerControls}</>;
};

export default StaticLayers;
