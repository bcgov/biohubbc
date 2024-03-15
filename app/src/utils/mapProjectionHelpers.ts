import { LatLng } from 'leaflet';
import proj4 from 'proj4';

export enum PROJECTION_MODE {
  WGS = 'WGS',
  UTM = 'UTM'
}

const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Gets distance in Metres between two lat lng coordinates on the Earth's surface.
 * Takes curavture into account.
 * @param latlng1 Point A
 * @param latlng2 Point B
 * @returns A to B in metres
 */
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

const utmProjection = `+proj=utm +zone=10 +north +datum=WGS84 +units=m +no_defs`;
const wgs84Projection = `+proj=longlat +datum=WGS84 +no_defs`;

/**
 * Returns the UTM Zone 10 coords as Latitude and Longitude
 * Latitude === Northing (Y)
 * Longitude === Easting (X)
 *
 * @param northing
 * @param easting
 * @returns [latitude, longitude]
 */
const getUtmAsLatLng = (northing: /*lat*/ number, easting: /*lng*/ number) => {
  return proj4(utmProjection, wgs84Projection, [Number(easting), Number(northing)])
    .map((a) => Number(a.toFixed(5)))
    .reverse();
};

/**
 * Returns the WGS84 LatLng coords as UTM Zone 10 Northing and Easting
 * @param lat latitude, in degrees
 * @param lng longitude, in degrees
 * @returns [northing (latitude), easting (longitude)]
 */
const getLatLngAsUtm = (lat: number, lng: number) => {
  return proj4(wgs84Projection, utmProjection, [Number(lng), Number(lat)])
    .map((a) => Number(a.toFixed(0)))
    .reverse();
};

export { getLatLngAsUtm, getUtmAsLatLng, distanceInMetresBetweenCoordinates };
