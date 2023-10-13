import { gpx, kml } from '@tmcw/togeojson';
import bbox from '@turf/bbox';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import shp from 'shpjs';
import { v4 as uuidv4 } from 'uuid';

export const isZipFile = (file: File): boolean => {
  if (!file?.type.match(/zip/) || !file?.name.includes('.zip')) {
    return false;
  }

  return true;
};

/**
 * Parses a spatial shape file into an array of GeoJSON Feature objects.
 *
 * If the file is not a valid shape file, or
 *
 * @param {File} file
 * @return {*}  {Promise<Feature[]>}
 */
export const parseShapeFile = async (file: File): Promise<Feature[]> => {
  return new Promise((resolve, reject) => {
    if (!isZipFile(file)) {
      reject(new Error('Not a .zip file.'));
    }

    // Create a file reader to extract the binary data
    const reader = new FileReader();

    reader.onload = (event) => {
      // The converter wants a buffer
      const zip: Buffer = event?.target?.result as Buffer;

      // Exit out if no zip
      if (!zip) {
        reject(new Error('Failed to parse shape file.'));
      }

      // Parse the geojson features from the shape file
      shp(zip)
        .then((geojson) => {
          let features: Feature[] = [];

          if (Array.isArray(geojson)) {
            geojson.forEach((item) => {
              features = features.concat(item.features);
            });
          } else {
            features = geojson.features;
          }

          // Ensure each Feature has a non-null ID
          // This will allow the map to re render newly uploaded features properly
          features.forEach((feature) => {
            if (feature.id) {
              // Feature already specifies an id (safe to assume it is unique?)
              return;
            }

            // No feature id is present, create a UUID
            feature.id = uuidv4();
          });

          resolve(features);
        })
        .catch((error) => {
          reject(new Error(`Failed to parse shape file: ${(error as Error).message}`));
        });
    };

    reader.onerror = () => {
      reject(new Error('Failed to parse shape file.'));
    };

    // Start reading file
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Function to handle zipped shapefile spatial boundary uploads
 *
 * @template T Type of the formikProps (should be auto-determined if the incoming formikProps are properly typed)
 * @param {File} file The file to upload
 * @param {string} name The name of the formik field that the parsed geometry will be saved to
 * @param {FormikContextType<T>} formikProps The formik props
 */
export const handleShapeFileUpload = async <T>(file: File, name: string, formikProps: FormikContextType<T>) => {
  const { setFieldValue, setFieldError } = formikProps;

  try {
    const features = await parseShapeFile(file);

    setFieldValue(name, [...features]);
  } catch (error) {
    setFieldError(name, 'You must upload a valid shapefile (.zip format). Please try again.');
  }
};

/**
 * Function to handle GPX file spatial boundary uploads
 *
 * @template T Type of the formikProps (should be auto-determined if the incoming formikProps are properly typed)
 * @param {File} file The file to upload
 * @param {string} name The name of the formik field that the parsed geometry will be saved to
 * @param {FormikContextType<T>} formikProps The formik props
 * @return {*}
 */
export const handleGPXUpload = async <T>(file: File, name: string, formikProps: FormikContextType<T>) => {
  const { setFieldValue, setFieldError } = formikProps;

  const fileAsString = await file?.text().then((xmlString: string) => {
    return xmlString;
  });

  if (!file?.type.includes('gpx') && !fileAsString?.includes('</gpx>')) {
    setFieldError(name, 'You must upload a GPX file, please try again.');
    return;
  }

  try {
    const domGpx = new DOMParser().parseFromString(fileAsString, 'application/xml');
    const geoJson = gpx(domGpx);

    const sanitizedGeoJSON: Feature[] = [];
    geoJson.features.forEach((feature: Feature) => {
      if (feature.geometry) {
        sanitizedGeoJSON.push(feature);
      }
    });

    setFieldValue(name, [...sanitizedGeoJSON]);
  } catch (error) {
    setFieldError(name, 'Error uploading your GPX file, please check the file and try again.');
  }
};

/**
 * Function to handle KML file spatial boundary uploads
 *
 * @template T Type of the formikProps (should be auto-determined if the incoming formikProps are properly typed)
 * @param {File} file The file to upload
 * @param {string} name The name of the formik field that the parsed geometry will be saved to
 * @param {FormikContextType<T>} formikProps The formik props
 * @return {*}
 */
export const handleKMLUpload = async <T>(file: File, name: string, formikProps: FormikContextType<T>) => {
  const { setFieldValue, setFieldError } = formikProps;

  const fileAsString = await file?.text().then((xmlString: string) => {
    return xmlString;
  });

  if (file?.type !== 'application/vnd.google-earth.kml+xml' && !fileAsString?.includes('</kml>')) {
    setFieldError(name, 'You must upload a KML file, please try again.');
    return;
  }

  const domKml = new DOMParser().parseFromString(fileAsString, 'application/xml');
  const geojson = kml(domKml);

  const sanitizedGeoJSON: Feature[] = [];
  geojson.features.forEach((feature: Feature) => {
    if (feature.geometry) {
      sanitizedGeoJSON.push(feature);
    }
  });

  setFieldValue(name, [...sanitizedGeoJSON]);
};

/**
 * Calculates the bounding box that encompasses all of the given features
 * 
 * @param features The features used to calculate the map bounds
 * @returns The Lat/Long bounding box, or undefined if a bounding box cannot be calculated.
 */
export const calculateUpdatedMapBounds = (features: Feature[]): LatLngBoundsExpression | undefined => {
  // If no geometries, we do not need to set bounds
  if (!features || !features.length) {
    return;
  }

  /** 
   * If there is only one geometry and it is a point, we cannot automatically calculate
   * a bounding box, because leaflet does not know how to handle the scale, and tries
   * to zoom in way too much. In this case, we manually create a bounding box.
  */
  if (features.length === 1 && features[0]?.geometry?.type === 'Point') {
    const singlePoint = features[0]?.geometry;
    const [longitude, latitude] = singlePoint.coordinates;

    return [
      [latitude + 1, longitude + 1],
      [latitude - 1, longitude - 1]
    ];
  }

  /**
   * If there are multiple points or a polygon and a point, we can automatically
   * create a bouding box using Turf.
   */
  const allGeosFeatureCollection = {
    type: 'FeatureCollection',
    features: [...features]
  };

  const bboxCoords = bbox(allGeosFeatureCollection);
  return [
    [bboxCoords[1], bboxCoords[0]],
    [bboxCoords[3], bboxCoords[2]]
  ];
};

/**
 * Leaflet does not know how to draw Multipolygons or GeometryCollections
 * that are not in proper GeoJSON format so we manually convert to a Feature[]
 * of GeoJSON objects which it can draw using the <GeoJSON /> tag for
 * non-editable geometries
 *
 * We also set the bounds based on those geometries so the extent is set
 *
 * @param {*} geometry
 * @param {string} [id]
 * @return {*}
 */
export const generateValidGeometryCollection = (geometry: any, id?: string) => {
  const geometryCollection: Feature[] = [];
  const bounds: any[] = [];

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
