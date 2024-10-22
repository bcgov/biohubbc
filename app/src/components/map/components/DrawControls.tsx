import { useLeafletContext } from '@react-leaflet/core';
import { Feature } from 'geojson';
import L, { PathOptions } from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { coloredCustomMarker } from 'utils/mapUtils';

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
  style?: PathOptions;
  toolbar?: boolean;
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
  onLayerAdd: (event: L.DrawEvents.Created, leaflet_id: number) => void;
  /**
   * Fired each time an item (layer) is edited.
   *
   * @memberof IDrawControlsProps
   */
  onLayerEdit: (event: L.DrawEvents.Edited) => void;
  /**
   * Fired each time an item (layer) is deleted.
   *
   * @memberof IDrawControlsProps
   */
  onLayerDelete: (event: L.DrawEvents.Deleted) => void;
}

export interface IDrawControlsRef {
  /**
   * Adds a GeoJson feature to a new layer in the draw controls layer group.
   *
   * @param feature The GeoJson feature to add as a layer.
   * @param layerId A function to receive the unique ID assigned to the added layer.
   */
  addLayer: (feature: Feature, layerId: (id: number) => void) => void;

  /**
   * Deletes a layer from the draw controls layer group by its unique ID.
   *
   * @param layerId The unique ID of the layer to delete.
   */
  deleteLayer: (layerId: number) => void;

  /**
   * Clears all layers from the draw controls layer group.
   */
  clearLayers: () => void;

  /**
   * Enables polygon drawing mode.
   */
  enablePolygonDrawing?: () => void;

  /**
   * Completes polygon drawing mode.
   */
  disablePolygonDrawing?: () => void;
}

/**
 * A component to add draw controls to a map.
 * IDrawControlsRef allows other components outside of the map context to interact with layers on the map
 *
 * The props provide callbacks and options to interact with the draw controls
 */
const DrawControls = forwardRef<IDrawControlsRef | undefined, IDrawControlsProps>((props, ref) => {
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

    if (props.options?.style) {
      featureGroup.setStyle(props.options.style);
    }

    const CustomMarker = L.Icon.extend({
      // The preview icon rendered when you are in the process of adding a marker to the map
      options: {
        iconUrl: 'assets/icon/circle-medium.svg',
        iconRetinaUrl: 'assets/icon/circle-medium.svg',
        iconSize: new L.Point(36, 36),
        iconAnchor: new L.Point(18, 18),
        popupAnchor: [18, 18],
        shadowUrl: null
      }
    });

    const drawOptions: L.Control.DrawConstructorOptions = {
      draw: {
        ...options?.draw,
        marker: {
          icon: new CustomMarker()
        }
      },
      edit: {
        ...options?.edit,
        featureGroup: featureGroup
      },
      position: options?.position || 'topright'
    };

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

      onLayerAdd(event, L.stamp(event.layer));
    },
    [getFeatureGroup, onLayerAdd]
  );

  /**
   * Handle edit events.
   */
  const onDrawEdit = useCallback(
    (event: L.DrawEvents.Edited) => {
      onLayerEdit(event);
    },
    [onLayerEdit]
  );

  /**
   * Handle delete events.
   */
  const onDrawDelete = useCallback(
    (event: L.DrawEvents.Deleted) => {
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
    map.on(L.Draw.Event.EDITED, onDrawEdit as L.LeafletEventHandlerFn);
    map.on(L.Draw.Event.DELETED, onDrawDelete as L.LeafletEventHandlerFn);
  }, [map, onDrawCreate, onDrawDelete, onDrawEdit]);

  const drawControlsRef = useRef(getDrawControls());

  // Initialize the draw controls only once, when the component mounts
  useEffect(() => {
    drawControlsRef.current = getDrawControls();
    // Add the draw controls to the map here if needed
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

            return coloredCustomMarker({ latlng });
          },
          onEachFeature: function (_feature, layer) {
            featureGroup.addLayer(layer);
          }
        });
      },
      deleteLayer: (layerId: number) => {
        const featureGroup = getFeatureGroup();
        featureGroup.removeLayer(layerId);
      },
      clearLayers: () => {
        const featureGroup = getFeatureGroup();
        featureGroup.clearLayers();
      },
      enablePolygonDrawing: () => {
        // this should be enablign drawing on the ref
        const polygonDrawer = new L.Draw.Polygon(map as L.DrawMap);
        polygonDrawer.enable();
      },
      disablePolygonDrawing: () => {
        // const drawControlsRef = useRef(getDrawControls());
        // polygonDrawer.disable();
      }
    }),
    [getFeatureGroup]
  );

  return null;
});

export default DrawControls;
