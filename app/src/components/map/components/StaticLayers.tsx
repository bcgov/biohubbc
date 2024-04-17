import { Feature } from 'geojson';
import { PropsWithChildren, ReactElement, useMemo } from 'react';
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
import { coloredCustomPointMarker, coloredPoint } from 'utils/mapUtils';

export interface IStaticLayerFeature {
  geoJSON: Feature;
  key: string | number;
  GeoJSONProps?: Partial<GeoJSONProps>;
  popup?: ReactElement;
  PopupProps?: Partial<PopupProps>;
  tooltip?: ReactElement;
  TooltipProps?: Partial<TooltipProps>;
}

export interface IStaticLayer {
  layerName: string;
  layerColors?: {
    color: string;
    fillColor: string;
  };
  features: IStaticLayerFeature[];
}

export interface IStaticLayersProps {
  layers: IStaticLayer[];
}

const StaticLayers = (props: PropsWithChildren<IStaticLayersProps>) => {
  const layerControls: ReactElement[] = useMemo(
    () =>
      props.layers
        .filter((layer) => Boolean(layer.features?.length))
        .map((layer) => {
          const layerColors = layer.layerColors || { color: '#1f7dff', fillColor: '#1f7dff' };
          return (
            <LayersControl.Overlay checked={true} name={layer.layerName} key={`static-layer-${layer.layerName}`}>
              <FeatureGroup key={`static-feature-group-${layer.layerName}`}>
                {layer.features.map((item, index) => {
                  const id = item.key || item.geoJSON.id || index;

                  return (
                    <GeoJSON
                      key={`static-feature-${id}`}
                      style={{ ...layerColors }}
                      pointToLayer={(_, latlng) =>
                        layer.layerName === 'Observations'
                          ? coloredCustomPointMarker({ latlng, fillColor: layer.layerColors?.fillColor })
                          : coloredPoint({ latlng, fillColor: layer.layerColors?.fillColor })
                      }
                      data={item.geoJSON}
                      {...item.GeoJSONProps}>
                      {item.tooltip && (
                        <Tooltip
                          key={`static-feature-tooltip-${id}`}
                          direction="top"
                          sticky={true}
                          {...item.TooltipProps}>
                          {item.tooltip}
                        </Tooltip>
                      )}
                      {item.popup && (
                        <Popup
                          key={`static-feature-popup-${id}`}
                          keepInView={false}
                          closeButton={true}
                          autoPan={true}
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
        }),
    [props.layers]
  );

  if (!layerControls.length) {
    return null;
  }

  return <>{layerControls}</>;
};

export default StaticLayers;
