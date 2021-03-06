// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import { useLeafletContext } from '@react-leaflet/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import isEqual from 'lodash-es/isEqual';
import { Feature } from 'geojson';

/*
  Get leaflet icons working
*/
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

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
  onCreated?: Function;
  onEdited?: Function;
  onDeleted?: Function;
  onMounted?: Function;
  draw?: any;
  edit?: any;
  position?: any;
  leaflet?: any;
  geometry?: Feature[];
  setGeometry?: (geometry: Feature[]) => void;
}

const MapEditControls: React.FC<IMapEditControlsProps> = (props) => {
  const context = useLeafletContext();
  const drawRef = useRef();
  const propsRef = useRef(props);

  drawRef.current = createDrawElement(props, context);

  /*
    Used to draw geometries that are drawn using the controls on the map
  */
  const onDrawCreate = (e: any) => {
    const { onCreated } = props;
    const container = context.layerContainer || context.map;
    const updatedGeos: Feature[] = [];

    container.addLayer(e.layer);

    console.log(container.getLayers());

    container.getLayers().forEach((layer: any) => {
      updatedGeos.push(layer.toGeoJSON());
    });

    props.setGeometry([...updatedGeos]);

    onCreated && onCreated(e);
  };

  const onDrawEdit = (e: any) => {
    const { onEdited } = props;
    const container = context.layerContainer || context.map;
    const updatedGeos: Feature[] = [];

    container.getLayers().forEach((layer: any) => {
      updatedGeos.push(layer.toGeoJSON());
    });

    props.setGeometry([...updatedGeos]);

    onEdited && onEdited(e);
  };

  /*
    On initial render, mount the controls and set up the event handlers
    Also, for each geometry that is passed in, draw it on the map
  */
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
    map.on(eventHandlers.onEdited, onDrawEdit);

    onMounted && onMounted(drawRef.current);
  }, []);

  useEffect(() => {
    const container = context.layerContainer || context.map;

    container.clearLayers();

    /*
      Used to draw geometries that are passed into the map container component
    */
    props.geometry?.forEach((geometry: Feature) => {
      L.geoJSON(geometry, {
        onEachFeature: function (feature: any, layer: any) {
          container.addLayer(layer);
        }
      });
    });
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

    const { onMounted } = props;

    onMounted && onMounted(drawRef.current);
  }, [props.draw, props.edit, props.position]);

  return null;
};

/*
  Function to create the draw/edit/remove elements on the map
  based on the options and props passed into the component
*/
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
