//@ts-ignore
import { kml, gpx } from '@tmcw/togeojson';
import shp from 'shpjs';
import { Feature } from 'geojson';
import bbox from '@turf/bbox';
import { v4 as uuidv4 } from 'uuid';

/**
 * Convert a zipped shapefile to geojson
 * @param file The file to upload
 * @param values current form values
 * @param setFieldValue change form values
 * @param setUploadError change state of upload error
 */
export const handleShapefileUpload = (
  file: File,
  values: any,
  setFieldValue: (key: string, value: any) => void,
  setUploadError: (uploadError: string) => void
) => {
  // Back out if not a zipped file
  if (!file?.type.match(/zip/) || !file?.name.includes('.zip')) {
    setUploadError('You must upload a valid shapefile (.zip format). Please try again.');
    return;
  }

  // Create a file reader to extract the binary data
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);

  // When the file is loaded run the conversion
  reader.onload = async (event: any) => {
    // The converter wants a buffer
    const zip: Buffer = event?.target?.result as Buffer;

    // Exit out if no zip
    if (!zip) {
      return;
    }

    // Run the conversion
    const geojson = await shp(zip);
    const features = (geojson as any).features;
    setFieldValue('geometry', [...features, ...values.geometry]);
  };
};

/**
 * Function to handle GPX file spatial boundary uploads
 *
 * @param file The file to upload
 * @param setUploadError change state of upload error
 * @param values current form values
 * @param setFieldValue change form values
 */
export const handleGPXUpload = async (
  file: File,
  setUploadError: (uploadError: string) => void,
  values: any,
  setFieldValue: (key: string, value: any) => void
) => {
  const fileAsString = await file?.text().then((xmlString: string) => {
    return xmlString;
  });

  if (!file?.type.includes('gpx') && !fileAsString?.includes('</gpx>')) {
    setUploadError('You must upload a GPX file, please try again.');
    return;
  }

  try {
    const domGpx = new DOMParser().parseFromString(fileAsString, 'application/xml');
    const geoJson = gpx(domGpx);

    let sanitizedGeoJSON: Feature[] = [];
    geoJson.features.forEach((feature: Feature) => {
      if (feature.geometry) {
        sanitizedGeoJSON.push(feature);
      }
    });

    setFieldValue('geometry', [...sanitizedGeoJSON, ...values.geometry]);
  } catch (error) {
    setUploadError('Error uploading your GPX file, please check the file and try again.');
    return;
  }
};

/**
 * Function to handle KML file spatial boundary uploads
 *
 * @param file The file to upload
 * @param setUploadError change state of upload error
 * @param values current form values
 * @param setFieldValue change form values
 */
export const handleKMLUpload = async (
  file: File,
  setUploadError: (uploadError: string) => void,
  values: any,
  setFieldValue: (key: string, value: any) => void
) => {
  const fileAsString = await file?.text().then((xmlString: string) => {
    return xmlString;
  });

  if (file?.type !== 'application/vnd.google-earth.kml+xml' && !fileAsString?.includes('</kml>')) {
    setUploadError('You must upload a KML file, please try again.');
    return;
  }

  const domKml = new DOMParser().parseFromString(fileAsString, 'application/xml');
  const geojson = kml(domKml);

  let sanitizedGeoJSON: Feature[] = [];
  geojson.features.forEach((feature: Feature) => {
    if (feature.geometry) {
      sanitizedGeoJSON.push(feature);
    }
  });

  setFieldValue('geometry', [...sanitizedGeoJSON, ...values.geometry]);
};

/**
 * @param geometries geometry values on map
 */
export const calculateUpdatedMapBounds = (geometries: Feature[]): any[][] | undefined => {
  /*
    If no geometries, we do not need to set bounds

    If there is only one geometry and it is a point, we cannot do the bound setting
    because leaflet does not know how to handle that and tries to zoom in way too much

    If there are multiple points or a polygon and a point, this is not an issue
  */
  if (!geometries || !geometries.length || (geometries.length === 1 && geometries[0]?.geometry?.type === 'Point')) {
    return;
  }

  const allGeosFeatureCollection = {
    type: 'FeatureCollection',
    features: [...geometries]
  };
  const bboxCoords = bbox(allGeosFeatureCollection);

  return [
    [bboxCoords[1], bboxCoords[0]],
    [bboxCoords[3], bboxCoords[2]]
  ];
};

/*
  Leaflet does not know how to draw Multipolygons or GeometryCollections
  that are not in proper GeoJSON format so we manually convert to a Feature[]
  of GeoJSON objects which it can draw using the <GeoJSON /> tag for
  non-editable geometries

  We also set the bounds based on those geometries so the extent is set
*/
export const generateValidGeometryCollection = (geometry: any, id?: string) => {
  let geometryCollection: Feature[] = [];
  let bounds: any[] = [];

  if (!geometry || !geometry.length) {
    return { geometryCollection, bounds };
  }

  if (geometry[0]?.type === 'MultiPolygon') {
    geometry[0].coordinates.forEach((geoCoords: any) => {
      geometryCollection.push({
        id: id || uuidv4(),
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: geoCoords
        },
        properties: {}
      });
    });
  } else if (geometry[0]?.type === 'GeometryCollection') {
    geometry[0].geometries.forEach((geometry: any) => {
      geometryCollection.push({
        id: id || uuidv4(),
        type: 'Feature',
        geometry,
        properties: {}
      });
    });
  } else if (geometry[0]?.type !== 'Feature') {
    geometryCollection.push({
      id: id || uuidv4(),
      type: 'Feature',
      geometry: geometry[0],
      properties: {}
    });
  } else {
    geometryCollection.push(geometry[0]);
  }

  const allGeosFeatureCollection = {
    type: 'FeatureCollection',
    features: geometryCollection
  };

  if (geometry[0]?.type !== 'Point') {
    const bboxCoords = bbox(allGeosFeatureCollection);

    bounds.push([bboxCoords[1], bboxCoords[0]], [bboxCoords[3], bboxCoords[2]]);

    return { geometryCollection, bounds };
  }

  return { geometryCollection };
};
