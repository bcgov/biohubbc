import { Feature } from 'geojson';
import L from 'leaflet';
import { PropsWithChildren, ReactElement, useMemo } from 'react';
import {
  FeatureGroup,
  GeoJSON,
  GeoJSONProps,
  LayersControl,
  Pane,
  Popup,
  PopupProps,
  Tooltip,
  TooltipProps
} from 'react-leaflet';
import { coloredPoint } from 'utils/mapUtils';
import { v4 as uuidv4 } from 'uuid';

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
  paneZIndex?: number;
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

                  /**
                   * In Leaflet, all layer content is rendered in a "pane". By creating our own pane
                   * and assigning it to a GeoJSON feature, it allows us to control the z-index for
                   * rendering layers. See: https://leafletjs.com/examples/map-panes/
                   * 
                   * The reason we give the pane a random UUID as a name is because if React is running
                   * in strict mode, the pane will double render, and a pane cannot be assigned the
                   * same name twice.
                   */
                  const paneName = uuidv4();

                  return (
                    <>
                      <Pane name={paneName} style={{ zIndex: layer.paneZIndex }} />
                      <GeoJSON
                        pane={paneName}
                        key={`static-feature-${id}`}
                        style={{ ...layerColors }}
                        pointToLayer={(feature, latlng) => {
                          if (feature.properties?.radius) {
                            return new L.Circle([latlng.lat, latlng.lng], feature.properties.radius);
                          }

                          return coloredPoint({ latlng });
                        }}
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
                          <Pane name={uuidv4()} style={{ zIndex: 1000 }}>
                            <Popup
                              key={`static-feature-popup-${id}`}
                              keepInView={false}
                              closeButton={true}
                              autoPan={true}
                              {...item.PopupProps}>
                              {item.popup}
                            </Popup>
                          </Pane>
                        )}
                      </GeoJSON>
                  </>
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
