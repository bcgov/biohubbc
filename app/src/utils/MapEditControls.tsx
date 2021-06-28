// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import { LeafletContextInterface, useLeafletContext } from '@react-leaflet/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import isEqual from 'lodash-es/isEqual';
import { Feature } from 'geojson';
import YesNoDialog from 'components/dialog/YesNoDialog';

/*
  Various types of events to listen for on map
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

export interface IMapEditControlsProps {
  draw?: any;
  edit?: any;
  position?: any;
  geometry?: Feature[];
  setGeometry?: (geometry: Feature[]) => void;
}

const MapEditControls: React.FC<IMapEditControlsProps> = (props) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const context = useLeafletContext();
  const drawRef = useRef();
  const propsRef = useRef(props);
  let deleteEvent: any;

  drawRef.current = createDrawElement(props, context);

  /*
    Used to save state of geometries based on change to layers on map
  */
  const updateGeosBasedOnLayers = (container: any) => {
    const updatedGeos: Feature[] = [];

    container.getLayers().forEach((layer: any) => {
      const layerGeoJSON = layer._mRadius
        ? { ...layer.toGeoJSON(), properties: { ...layer.toGeoJSON().properties, radius: layer.getRadius() } }
        : layer.toGeoJSON();

      updatedGeos.push(layerGeoJSON);
    });

    props.setGeometry([...updatedGeos]);
  };

  /*
    Used to draw geometries using the controls on the map
  */
  const onDrawCreate = (e: any) => {
    const container = context.layerContainer || context.map;

    container.addLayer(e.layer);
    updateGeosBasedOnLayers(container);
  };

  /*
    Used to edit/delete geometries using the controls on the map
  */
  const onDrawEditDelete = (e: any) => {
    const container = context.layerContainer || context.map;

    updateGeosBasedOnLayers(container);
  };

  const drawGeometries = (geometries: Feature[]) => {
    const container = context.layerContainer || context.map;

    container.clearLayers();

    /*
      Used to draw geometries that are passed into the map container component
    */
    geometries?.forEach((geometry: Feature) => {
      L.geoJSON(geometry, {
        onEachFeature: function (feature: any, layer: any) {
          container.addLayer(layer);
        }
      });
    });
  };

  /*
    On initial render, mount the controls and set up the event handlers
    Also, for each geometry that is passed in, draw it on the map
  */
  useEffect(() => {
    const { map } = context;

    for (const key in eventHandlers) {
      map.on(eventHandlers[key], (evt: any) => {
        let handlers = Object.keys(eventHandlers).filter((handler) => eventHandlers[handler] === evt.type);
        if (handlers.length === 1) {
          let handler = handlers[0];
          props[handler] && props[handler](evt);
        }
      });
    }

    map.on(eventHandlers.onCreated, onDrawCreate);
    map.on(eventHandlers.onEdited, onDrawEditDelete);
    map.on(eventHandlers.onDeleted, (e) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      deleteEvent = e;
      setShowDeleteModal(true);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    drawGeometries(props.geometry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.geometry]);

  useEffect(() => {
    if (
      isEqual(props.draw, propsRef.draw) &&
      isEqual(props.edit, propsRef.edit) &&
      props.position === propsRef.position
    ) {
      return;
    }

    const { map } = context;

    drawRef.current.remove(map);
    drawRef.current = createDrawElement(props, context);
    drawRef.current.addTo(map);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.edit, props.position]);

  return (
    <YesNoDialog
      dialogTitle="Delete Geometries"
      dialogText="Are you sure you want to delete the selected geometries?"
      open={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        drawGeometries(props.geometry);
      }}
      onNo={() => {
        setShowDeleteModal(false);
        drawGeometries(props.geometry);
      }}
      onYes={() => {
        setShowDeleteModal(false);
        onDrawEditDelete(deleteEvent);
      }}
    />
  );
};

/**
 * Function to create the draw/edit/remove elements on the map based on the options and props passed into the component
 *
 * @param {IMapEditControlsProps} props
 * @param {LeafletContextInterface} context
 * @return {*}
 */
function createDrawElement(props: IMapEditControlsProps, context: LeafletContextInterface) {
  const { layerContainer } = context;
  const { draw, edit, position } = props;
  const options = {
    edit: {
      ...edit,
      featureGroup: layerContainer
    }
  };

  if (draw) {
    options.draw = { ...draw };
  }

  if (position) {
    options.position = position;
  }

  return new L.Control.Draw(options);
}

export default MapEditControls;
