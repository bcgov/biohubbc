import L, { BaseIconOptions, Icon, LatLng } from 'leaflet';
import { useState } from 'react';
import { Circle, Marker, useMap, useMapEvents } from 'react-leaflet';
import { distanceInMetresBetweenCoordinates } from 'utils/mapProjectionHelpers';

export type MarkerIconColor = 'green' | 'blue' | 'red';

interface IClickMarkerProps {
  position?: LatLng;
  radius?: number;
  markerColor?: MarkerIconColor;
  listenForMouseEvents: boolean; //Have this here so you can NOOP the mouse events in the case of multiple instances of this component on same mapf
  handlePlace?: (p: LatLng) => void;
  handleResize?: (n: number) => void;
}

/**
 * This component gives you a marker that can be placed on a map by left clicking.
 * There is a circle that follows the position of the marker which can be resized by clicking and dragging on the circle.
 * It will expand to match the distance between the center and the mouse cursor.
 * Make this a child of a react-leaflet MapContainer for it to work properly.
 * "listenForMouseEvents" can be used to faciliate multiple instances of this marker on the same map
 */
const MarkerWithResizableRadius = (props: IClickMarkerProps): JSX.Element => {
  const { handlePlace, handleResize, position, radius, listenForMouseEvents, markerColor } = props;
  const [lastMouseDown, setLastMouseDown] = useState(new LatLng(0, 0));
  const [holdingMouse, setHoldingMouse] = useState(false);
  const map = useMap();

  const commonIconProps: BaseIconOptions = {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  };

  //Using this open source icons from GitHub since it's not very convenient to style the markers directly.
  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    ...commonIconProps
  });

  const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    ...commonIconProps
  });

  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    ...commonIconProps
  });

  const iconMap: Record<MarkerIconColor, { icon: Icon; hex: string }> = {
    blue: { icon: blueIcon, hex: '#2A81CB' },
    green: { icon: greenIcon, hex: '#2AAD27' },
    red: { icon: redIcon, hex: '#CB2B3E' }
  };

  useMapEvents({
    mousedown: (e) => {
      if (!listenForMouseEvents) return;
      setLastMouseDown(e.latlng);
    },
    mousemove: (e) => {
      if (!listenForMouseEvents) return;
      if (holdingMouse && position) {
        //If we move mouse between mouse down and mouse up, then change radius of circle
        handleResize?.(distanceInMetresBetweenCoordinates(position, e.latlng));
      }
    },
    mouseup: (e) => {
      if (!listenForMouseEvents) return;
      if (e.latlng.equals(lastMouseDown)) {
        handlePlace?.(e.latlng); //If we release the mouse at the same coordinate we initially clicked, count that as a simple left click and place marker
      }
      setHoldingMouse(false);
      map.dragging.enable();
    }
  });

  if (!position) {
    return <></>;
  }

  return (
    <>
      {props?.radius ? (
        <Circle
          bubblingMouseEvents={false}
          eventHandlers={{
            mousedown: (e) => {
              if (!listenForMouseEvents) return;
              map.dragging.disable(); //Need to disable map drag or else resizing circle will result in map moving
              setHoldingMouse(true);
              setLastMouseDown(e.latlng);
            }
          }}
          color={markerColor ? iconMap[markerColor].hex : iconMap.blue.hex}
          radius={radius ?? 0}
          center={position}
        />
      ) : null}
      <Marker icon={markerColor ? iconMap[markerColor].icon : iconMap.blue.icon} position={position}></Marker>
    </>
  );
};

export { MarkerWithResizableRadius };
