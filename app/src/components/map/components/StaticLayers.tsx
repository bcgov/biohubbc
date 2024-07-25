import { Feature } from 'geojson';
import { Marker } from 'leaflet';
import { PropsWithChildren, ReactElement, useMemo } from 'react';
import { FeatureGroup, GeoJSON, GeoJSONProps, LayersControl } from 'react-leaflet';
import { coloredCustomPointMarker, coloredPoint } from 'utils/mapUtils';

export type IStaticLayerFeature = {
  /**
   * Unique Id of the feature.
   */
  id: string | number;
  /**
   * Unique key of the feature.
   *
   * @type {string}
   */
  key: string;
  /**
   * The GeoJSON feature to be displayed.
   */
  geoJSON: Feature;
  /**
   * Additional props to be passed to the `GeoJSON` component.
   */
  GeoJSONProps?: Partial<GeoJSONProps>;
  /**
   * A custom marker icon to use when displaying point features.
   */
  markerIcon?: Marker<any>;
};

export type IStaticLayer = {
  layerName: string;
  layerColors?: {
    color: string;
    fillColor: string;
    opacity?: number;
  };
  features: IStaticLayerFeature[];
  popup?: (feature: IStaticLayerFeature) => ReactElement;
  tooltip?: (feature: IStaticLayerFeature) => ReactElement;
};

export type IStaticLayersProps = {
  layers: IStaticLayer[];
};

/**
 * Returns static map layers to be displayed in leaflet
 *
 * @param props {PropsWithChildren<IStaticLayersProps>}
 * @returns
 */
const StaticLayers = (props: PropsWithChildren<IStaticLayersProps>) => {
  const layerControls: ReactElement[] = useMemo(
    () =>
      props.layers
        .filter((layer) => Boolean(layer.features?.length))
        .map((layer, index) => {
          const layerColors = layer.layerColors || { color: '#1f7dff', fillColor: '#1f7dff' };
          return (
            <LayersControl.Overlay
              checked={true}
              name={layer.layerName}
              key={`static-layer-${layer.layerName}-${index}`}>
              <FeatureGroup key={`static-feature-group-${layer.layerName}-${index}`}>
                {layer.features.map((feature, index) => {
                  const id = feature.id || feature.geoJSON.id || index;

                  return (
                    <GeoJSON
                      key={`static-feature-${id}`}
                      style={{ ...layerColors }}
                      pointToLayer={(_, latlng) =>
                        layer.layerName === 'Observations'
                          ? coloredCustomPointMarker({ latlng, fillColor: layer.layerColors?.fillColor })
                          : coloredPoint({ latlng, fillColor: layer.layerColors?.fillColor })
                      }
                      data={feature.geoJSON}
                      {...feature.GeoJSONProps}>
                      {layer.tooltip?.(feature) ?? null}
                      {layer.popup?.(feature) ?? null}
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
