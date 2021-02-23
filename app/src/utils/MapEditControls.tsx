// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import { useLeafletContext } from '@react-leaflet/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import isEqual from 'lodash-es/isEqual';

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
  onDeleteStop: 'draw:deletestop'
};

export interface IMapEditControlsProps {
  onCreated?: Function;
  onEdited?: Function;
  onDeleted?: Function;
  onMounted?: Function;
  draw?: any;
  edit?: any;
  position?: any;
  leaflet?: any;
}

const MapEditControls: React.FC<IMapEditControlsProps> = (props) => {
  const context = useLeafletContext();
  const drawRef = useRef();
  const propsRef = useRef(props);

  drawRef.current = createDrawElement(props, context);

  const onDrawCreate = (e: any) => {
    const { onCreated } = props;
    const container = context.layerContainer || context.map;
    container.addLayer(e.layer);
    onCreated && onCreated(e);
  };

  useEffect(() => {
    const { map } = context;
    const { onMounted } = props;

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

    onMounted && onMounted(drawRef.current);

    return () => {
      const { mapContainer } = props.leaflet;

      mapContainer.off(eventHandlers.onCreated, onDrawCreate);

      for (const key in eventHandlers) {
        if (props[key]) {
          mapContainer.off(eventHandlers[key], props[key]);
        }
      }
    };
  }, [context, onDrawCreate, props]);

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

    const { onMounted } = props;
    onMounted && onMounted(drawRef.current);
  }, [context, props, props.draw, props.edit, props.position]);

  return null;
};

function createDrawElement(props: any, context: any) {
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
