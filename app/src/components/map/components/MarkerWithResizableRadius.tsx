import L, { Icon, LatLng } from 'leaflet';
import { useState } from 'react';
import { Circle, Marker, useMap, useMapEvents } from 'react-leaflet';

type IconColor = 'green' | 'blue';

interface IClickMarkerProps {
  position: LatLng;
  radius: number;
  markerColor?: IconColor;
  listenForMouseEvents: boolean;
  handlePlace?: (p: LatLng) => void;
  handleResize?: (n: number) => void;
}

const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

const distanceInMetresBetweenCoordinates = (latlng1: LatLng, latlng2: LatLng): number => {
  const earthRadiusKm = 6371;
  const { lat: lat1, lng: lon1 } = latlng1;
  const { lat: lat2, lng: lon2 } = latlng2;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const l1 = degreesToRadians(lat1);
  const l2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(l1) * Math.cos(l2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c * 1000;
};

const MarkerWithResizableRadius = (props: IClickMarkerProps): JSX.Element => {
  const { handlePlace, handleResize, position, radius, listenForMouseEvents, markerColor } = props;
  const [lastMouseDown, setLastMouseDown] = useState(new LatLng(0, 0));
  const [holdingMouse, setHoldingMouse] = useState(false);
  const map = useMap();

  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const iconMap: Record<IconColor, { icon: Icon; hex: string }> = {
    blue: { icon: blueIcon, hex: '#2A81CB' },
    green: { icon: greenIcon, hex: '#2AAD27' }
  };

  useMapEvents({
    mousedown: (e) => {
      if (!listenForMouseEvents) return;
      setLastMouseDown(e.latlng);
    },
    mousemove: (e) => {
      if (!listenForMouseEvents) return;
      if (holdingMouse) {
        handleResize?.(distanceInMetresBetweenCoordinates(position, e.latlng));
      }
    },
    mouseup: (e) => {
      if (!listenForMouseEvents) return;
      if (e.latlng.equals(lastMouseDown)) {
        handlePlace?.(e.latlng);
      }
      setHoldingMouse(false);
      map.dragging.enable();
    }
  });

  return (
    <>
      <Circle
        bubblingMouseEvents={false}
        eventHandlers={{
          mousedown: (e) => {
            if (!listenForMouseEvents) return;
            map.dragging.disable();
            setHoldingMouse(true);
            setLastMouseDown(e.latlng);
          }
        }}
        color={markerColor ? iconMap[markerColor].hex : iconMap.blue.hex}
        radius={radius}
        center={position}
      />
      <Marker icon={markerColor ? iconMap[markerColor].icon : iconMap.blue.icon} position={position}></Marker>
    </>
  );
};

export { MarkerWithResizableRadius };
