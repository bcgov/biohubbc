import { useLeafletContext } from '@react-leaflet/core';
import { Feature } from 'geojson';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

/*
 * Supported draw events.
 */
const eventHandlers = {
  onCreated: 'draw:created',
  onEdited: 'draw:edited',
  onDrawStart: 'draw:drawstart',
  onDrawStop: 'draw:drawstop',
  onDrawVertex: 'draw:drawvertex',
  onEditStart: 'draw:editstart',
  onEditMove: 'draw:editmove',
  onEditResize: 'draw:editresize',
  onEditVertex: 'draw:editvertex',
  onEditStop: 'draw:editstop',
  onDeleted: 'draw:deleted',
  onDeleteStart: 'draw:deletestart',
  onDeleteStop: 'draw:deletestop',
  onMounted: 'draw:mounted'
};

/**
 * Custom subset of `L.Control.DrawConstructorOptions` that omits `edit.Feature` as this will be added automatically
 * by `DrawControls`.
 *
 * @export
 * @interface IDrawControlsOptions
 */
export interface IDrawControlsOptions {
  position?: L.Control.DrawConstructorOptions['position'];
  draw?: L.Control.DrawConstructorOptions['draw'];
  edit?: Omit<L.Control.DrawConstructorOptions['edit'], 'Feature'>;
}

export type IDrawControlsOnChange = (features: Feature[]) => void;

export interface IDrawControlsProps {
  /**
   * Initial features to add to the map. These features will be editable.
   *
   * @type {Feature[]}
   * @memberof IDrawControlsProps
   */
  initialFeatures?: Feature[];
  /**
   * Options to control the draw/edit UI controls.
   *
   * @type {IDrawControlsOptions}
   * @memberof IDrawControlsProps
   */
  options?: IDrawControlsOptions;
  /**
   * Callback triggered anytime a feature is added or updated or removed.
   *
   * @type {IDrawControlsOnChange}
   * @memberof IDrawControlsProps
   */
  onChange?: IDrawControlsOnChange;
  /**
   * Clear any previously drawn features (layers) before drawing the next one.
   * The result is that only 1 feature will be shown at a time.
   *
   * @type {boolean}
   * @memberof IDrawControlsProps
   */
  clearOnDraw?: boolean;
}

const DrawControls: React.FC<React.PropsWithChildren<IDrawControlsProps>> = (props) => {
  const context = useLeafletContext();

  /**
   * Fetch the layer used by the draw controls.
   *
   * @return {*}  {L.FeatureGroup<any>}
   */
  const getFeatureGroup = () => {
    const container = context.layerContainer;

    if (!container || !(container instanceof L.FeatureGroup)) {
      throw new Error('Failed to get map layer');
    }

    return container;
  };

  /**
   * Collects all current feature layers, and calls `props.onChange`.
   * Adds `radius` to the properties if the source feature is a circle type.
   */
  const handleFeatureUpdate = () => {
    const container = getFeatureGroup();

    const features: Feature[] = [];

    container.getLayers().forEach((layer: any) => {
      const geoJSON = layer.toGeoJSON();

      if (layer._mRadius) {
        geoJSON.properties.radius = layer.getRadius();
      }

      features.push(geoJSON);
    });

    props.onChange?.([...features]);
  };

  /**
   * Build and return a drawing map control.
   *
   * @return {*}  {L.Control.Draw}
   */
  const getDrawControls = (): L.Control.Draw => {
    const options: L.Control.DrawConstructorOptions = {
      edit: {
        ...props.options?.edit,
        // Add FeatureGroup automatically
        featureGroup: getFeatureGroup()
      }
    };

    options.draw = { ...props.options?.draw };

    options.position = props.options?.position || 'topright';

    return new L.Control.Draw(options);
  };

  /**
   * Handle create events.
   *
   * @param {L.DrawEvents.Created} event
   */
  const onDrawCreate = (event: L.DrawEvents.Created) => {
    const container = getFeatureGroup();

    if (props.clearOnDraw) {
      // Clear previous layers
      container.clearLayers();
    }

    container.addLayer(event.layer);
    handleFeatureUpdate();
  };

  /**
   * Handle edit/delete events.
   */
  const onDrawEditDelete = () => {
    handleFeatureUpdate();
  };

  /**
   * Registers/draws features.
   *
   * @param {Feature[]} [features]
   * @return {*}
   */
  const drawFeatures = (features?: Feature[]) => {
    if (!features) {
      return;
    }

    const container = getFeatureGroup();

    container.clearLayers();

    features?.forEach((item: Feature) => {
      L.geoJSON(item, {
        pointToLayer: (feature, latlng) => {
          if (feature.properties?.radius) {
            return new L.Circle([latlng.lat, latlng.lng], feature.properties.radius);
          }

          return new L.Marker([latlng.lat, latlng.lng]);
        },
        onEachFeature: function (_feature, layer) {
          container.addLayer(layer);
        }
      });
    });
  };

  useEffect(() => {
    const { map } = context;

    // Remove any existing event handlers
    map.removeEventListener(eventHandlers.onCreated);
    map.removeEventListener(eventHandlers.onEdited);
    map.removeEventListener(eventHandlers.onDeleted);

    // Register draw event handlers
    map.on(eventHandlers.onCreated, onDrawCreate as L.LeafletEventHandlerFn);
    map.on(eventHandlers.onEdited, onDrawEditDelete);
    map.on(eventHandlers.onDeleted, onDrawEditDelete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options, props.onChange, props.clearOnDraw]);

  useDeepCompareEffect(() => {
    drawFeatures(props.initialFeatures);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.initialFeatures]);

  const drawControlsRef = useRef(getDrawControls());

  useDeepCompareEffect(() => {
    const { map } = context;
    // Update draw control
    drawControlsRef.current.remove();
    drawControlsRef.current = getDrawControls();
    drawControlsRef.current.addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.options]);

  return null;
};

export default DrawControls;
