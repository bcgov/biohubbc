import { LatLng } from 'leaflet';
import { useState } from 'react';
import { Circle, Marker, useMapEvents } from 'react-leaflet';

interface IClickMarkerProps {
  position: LatLng;
  radius: number;
  handlePlace?: (p: LatLng) => void;
  handleResize?: (n: number) => void;
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function distanceInKmBetweenEarthCoordinates(latlng1: LatLng, latlng2: LatLng) {
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
}

const ClickMarker = (props: IClickMarkerProps): JSX.Element => {
  const { handlePlace, handleResize, position, radius } = props;
  const [isResizing, setIsResizing] = useState(false);
  //const [lastMouseDown, setLastMouseDown] = useState(new LatLng(0,0));
  // const [radius, setRadius] = useState(9000);
  // const [position, setPosition] = useState<LatLng>(new LatLng(0, 0));
  useMapEvents({
    click(e) {
      e.originalEvent.preventDefault();
      if (!isResizing) {
        // setPosition(e.latlng);
        handlePlace?.(e.latlng);
      }
    },
    mousemove(e) {
      if (isResizing) {
        // setRadius(distanceInKmBetweenEarthCoordinates(position, e.latlng));
        handleResize?.(distanceInKmBetweenEarthCoordinates(position, e.latlng));
      }
    }
  });

  return (
    <>
      <Circle
        bubblingMouseEvents={false}
        eventHandlers={{
          click: (e) => {
            // if (isResizing) {
            //   handleResize?.(radius);
            // } else {
            //   setRadius(distanceInKmBetweenEarthCoordinates(position, e.latlng));
            // }
            setIsResizing(!isResizing);
          }
        }}
        radius={radius}
        center={position}
      />
      <Marker position={position}></Marker>
    </>
  );
};

export { ClickMarker };
