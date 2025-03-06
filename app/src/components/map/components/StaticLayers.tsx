import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { Feature } from 'geojson';
import { Marker } from 'leaflet';
import { PropsWithChildren, ReactElement, useMemo } from 'react';
import { FeatureGroup, GeoJSON, GeoJSONProps, LayersControl } from 'react-leaflet';
import { coloredCustomMarker, ColoredCustomMarkerProps } from 'utils/mapUtils';

export type IStaticLayerFeature = {
  /**
   * Unique Id of the feature.
   */
  id: string | number;
  /**
   * Unique key of the feature.
   * Must be unique across all features in the map.
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
  /**
   * The name of the layer.
   * This will be displayed in the layer control.
   */
  layerName: string;
  /**
   * The features to be displayed in the layer.
   */
  features: IStaticLayerFeature[];
  /**
   * Additional layer options.
   */
  layerOptions?: {
    /**
     * The color of the layer.
     *
     * @example
     * '#1f7dff'
     */
    color?: string;
    /**
     * The fill color of the layer.
     *
     * @example
     * '#1f7dff'
     */
    fillColor?: string;
    /**
     * The opacity of the layer.
     *
     * @example
     * 0.5
     */
    opacity?: number;
    /**
     * A function that returns a custom marker to use for the layer for `Point` features.
     */
    marker?: (ColoredCustomMarkerProps: ColoredCustomMarkerProps) => L.Marker<any>;
  };
  /**
   * A function that returns a custom popup to be displayed for the feature.
   * Returned component must be wrapped in a `Popup` component from `react-leaflet`.
   */
  popup?: (feature: IStaticLayerFeature) => ReactElement;
  /**
   * A function that returns a custom tooltip to be displayed for the feature.
   * Returned component must be wrapped in a `Tooltip` component from `react-leaflet`.
   */
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
          return (
            <LayersControl.Overlay
              checked={true}
              name={layer.layerName}
              key={`static-layer-${layer.layerName}-${index}`}>
              <FeatureGroup key={`static-feature-group-${layer.layerName}-${index}`}>
                {layer.features.map((feature) => {
                  return (
                    <GeoJSON
                      key={feature.key}
                      style={{
                        color: layer.layerOptions?.color ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
                        fillColor: layer.layerOptions?.fillColor ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
                        opacity: layer.layerOptions?.opacity ?? 1
                      }}
                      pointToLayer={(_, latlng) =>
                        layer.layerOptions?.marker?.({ latlng, fillColor: layer.layerOptions?.fillColor }) ??
                        coloredCustomMarker({ latlng, fillColor: layer.layerOptions?.fillColor })
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
