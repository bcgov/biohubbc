import { Feature } from 'geojson';
import { PropsWithChildren, ReactElement, useMemo } from 'react';
import {
  FeatureGroup,
  GeoJSON,
  GeoJSONProps,
  LayersControl,
  PopupProps,
  Tooltip,
  TooltipProps
} from 'react-leaflet';
import { coloredPoint, MapPointProps } from 'utils/mapUtils';

export interface IStaticLayerFeature {
  geoJSON: Feature;
  key: string | number;
  GeoJSONProps?: Partial<GeoJSONProps>;
  popup?: ReactElement;
  PopupProps?: Partial<PopupProps>;
  tooltip?: ReactElement;
  TooltipProps?: Partial<TooltipProps>;
  /**
   * The icon representing each point
   */
  icon?: (point: MapPointProps) => L.Marker<any>;
  /**
   * Unique Id of the point
   */
  id?: string | number;
  /**
   * Optional link that renders a button to view/manage/edit the data
   * that the geometry belongs to
   */
  link?: string; //
}

export interface IStaticLayer {
  layerName: string;
  layerColors?: {
    color: string;
    fillColor: string;
    opacity?: number;
  };
  features: IStaticLayerFeature[];
  popup?: ReactElement
}

export interface IStaticLayersProps {
  layers: IStaticLayer[];
}

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
                {layer.features.map((item, index) => {
                  const id = item.key || item.geoJSON.id || index;

                  return (
                    <GeoJSON
                      key={`static-feature-${id}`}
                      style={{ ...layerColors }}
                      pointToLayer={(_, latlng) => coloredPoint({ latlng, fillColor: layer.layerColors?.fillColor })}
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
                        layer.popup
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
