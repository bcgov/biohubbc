import { useLeafletContext } from '@react-leaflet/core';
import { Feature } from 'geojson';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Custom subset of `L.Control.DrawConstructorOptions` that omits `edit.featureGroup` as this will be added automatically
 * by `DrawControls`.
 *
 * @export
 * @interface IDrawControlsOptions
 */
export interface IDrawControlsOptions {
  position?: L.ControlPosition;
  draw?: L.Control.DrawOptions;
  edit?: Omit<L.Control.EditOptions, 'featureGroup'>;
}

export interface IDrawControlsProps {
  /**
   * Options to control the draw/edit UI controls.
   *
   * @type {IDrawControlsOptions}
   * @memberof IDrawControlsProps
   */
  options?: IDrawControlsOptions;
  /**
   * Fired each time an item is drawn (a layer is added).
   *
   * @memberof IDrawControlsProps
   */
  onLayerAdd: (event: L.DrawEvents.Created) => void;
  /**
   * Fired each time an item (layer) is edited.
   *
   * @memberof IDrawControlsProps
   */
  onLayerEdit: (event: L.LeafletEvent) => void;
  /**
   * Fired each time an item (layer) is deleted.
   *
   * @memberof IDrawControlsProps
   */
  onLayerDelete: (event: L.LeafletEvent) => void;
}

export interface IDrawControlsRef {
  /**
   * Adds a GeoJson feature to a new layer in the draw controls layer group.
   *
   * @memberof IDrawControlsRef
   */
  addLayer: (feature: Feature) => void;
}

const DrawControls2 = forwardRef<IDrawControlsRef | undefined, IDrawControlsProps>((props, ref) => {
  const { options, onLayerDelete, onLayerEdit, onLayerAdd } = props;

  const { map, layerContainer } = useLeafletContext();

  /**
   * Fetch the layer used by the draw controls.
   *
   * @return {*}  {L.FeatureGroup<any>}
   */
  const getFeatureGroup = useCallback(() => {
    if (!layerContainer || !(layerContainer instanceof L.FeatureGroup)) {
      throw new Error('Failed to get draw feature group');
    }

    return layerContainer;
  }, [layerContainer]);

  /**
   * Build and return a drawing map control.
   *
   * @return {*}  {L.Control.Draw}
   */
  const getDrawControls = (): L.Control.Draw => {
    const featureGroup = getFeatureGroup();

    const drawOptions: L.Control.DrawConstructorOptions = {
      edit: {
        ...options?.edit,
        featureGroup: featureGroup
      }
    };

    drawOptions.draw = { ...options?.draw };

    drawOptions.position = drawOptions?.position || 'topright';

    return new L.Control.Draw(drawOptions);
  };

  /**
   * Handle create events.
   *
   * @param {L.DrawEvents.Created} event
   */
  const onDrawCreate = useCallback(
    (event: L.DrawEvents.Created) => {
      const featureGroup = getFeatureGroup();

      featureGroup.addLayer(event.layer);

      onLayerAdd(event);
    },
    [getFeatureGroup, onLayerAdd]
  );

  /**
   * Handle edit events.
   */
  const onDrawEdit = useCallback(
    (event: L.LeafletEvent) => {
      onLayerEdit(event);
    },
    [onLayerEdit]
  );

  /**
   * Handle delete events.
   */
  const onDrawDelete = useCallback(
    (event: L.LeafletEvent) => {
      onLayerDelete(event);
    },
    [onLayerDelete]
  );

  useEffect(() => {
    // Remove any existing draw control event handlers
    map.removeEventListener(L.Draw.Event.CREATED);
    map.removeEventListener(L.Draw.Event.EDITED);
    map.removeEventListener(L.Draw.Event.DELETED);

    // Register draw control event handlers
    map.on(L.Draw.Event.CREATED, onDrawCreate as L.LeafletEventHandlerFn);
    map.on(L.Draw.Event.EDITED, onDrawEdit);
    map.on(L.Draw.Event.DELETED, onDrawDelete);
  }, [map, onDrawCreate, onDrawDelete, onDrawEdit]);

  const drawControlsRef = useRef(getDrawControls());

  useEffect(() => {
    // Add draw controls to the map
    drawControlsRef.current.addTo(map);
  }, [map]);

  // Populate the forward ref
  useImperativeHandle(
    ref,
    () => ({
      addLayer: (feature: Feature) => {
        const featureGroup = getFeatureGroup();

        L.geoJSON(feature, {
          pointToLayer: (feature, latlng) => {
            if (feature.properties?.radius) {
              return new L.Circle([latlng.lat, latlng.lng], feature.properties.radius);
            }

            return new L.Marker([latlng.lat, latlng.lng]);
          },
          onEachFeature: function (_feature, layer) {
            featureGroup.addLayer(layer);
          }
        });
      }
    }),
    [getFeatureGroup]
  );

  return null;
});

export default DrawControls2;
