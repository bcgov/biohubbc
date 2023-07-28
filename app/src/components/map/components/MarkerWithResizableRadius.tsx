import { LatLng } from 'leaflet';
import { useState } from 'react';
import { Circle, Marker, useMap, useMapEvents } from 'react-leaflet';

interface IClickMarkerProps {
  position: LatLng;
  radius: number;
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
  const { handlePlace, handleResize, position, radius } = props;
  const [lastMouseDown, setLastMouseDown] = useState(new LatLng(0, 0));
  const [holdingMouse, setHoldingMouse] = useState(false);
  const map = useMap();

  useMapEvents({
    mousedown: (e) => {
      setLastMouseDown(e.latlng);
    },
    mousemove: (e) => {
      if (holdingMouse) {
        handleResize?.(distanceInMetresBetweenCoordinates(position, e.latlng));
      }
    },
    mouseup: (e) => {
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
            map.dragging.disable();
            setHoldingMouse(true);
            setLastMouseDown(e.latlng);
          }
        }}
        radius={radius}
        center={position}
      />
      <Marker position={position}></Marker>
    </>
  );
};

export { MarkerWithResizableRadius };
