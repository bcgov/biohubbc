import { gpx, kml } from '@tmcw/togeojson';
import bbox from '@turf/bbox';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { BBox, Feature, GeoJsonProperties, Geometry } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import shp from 'shpjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Returns true if the file is a zip and false if it is not
 *
 * @param {File} file
 * @returns {*} boolean
 */
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
 *  Function to handle parsing and prep work of a shape file for upload
 *
 * @param {File} file The file to process
 * @return {*}  {Promise<Feature[]>}
 */
export const handleShapeFileUpload = (file: File): Promise<Feature[]> => {
  return parseShapeFile(file).catch(() => {
    throw Error('You must upload a valid shapefile (.zip format). Please try again.');
  });
};

/**
 * Function to handle parsing and prep work of a GPX file
 *
 * @param {File} file The file to process
 * @return {*}  {Promise<Feature[]>}
 */
export const handleGPXUpload = async (file: File) => {
  const fileAsString = await file?.text().then((xmlString: string) => {
    return xmlString;
  });

  if (!file?.type.includes('gpx') && !fileAsString?.includes('</gpx>')) {
    throw Error('You must upload a GPX file, please try again.');
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

    return [...sanitizedGeoJSON];
  } catch (error) {
    throw Error('Error uploading your GPX file, please check the file and try again.');
  }
};

/**
 * Function to handle parsing and prep work of a KML file
 *
 * @param {File} file The file to process
 * @return {*}  {Promise<Feature[]>}
 */
export const handleKMLUpload = async (file: File) => {
  const fileAsString = await file?.text().then((xmlString: string) => {
    return xmlString;
  });

  if (file?.type !== 'application/vnd.google-earth.kml+xml' && !fileAsString?.includes('</kml>')) {
    throw Error('You must upload a KML file, please try again.');
  }

  const domKml = new DOMParser().parseFromString(fileAsString, 'application/xml');
  const geojson = kml(domKml);

  const sanitizedGeoJSON: Feature[] = [];
  geojson.features.forEach((feature: Feature) => {
    if (feature.geometry) {
      sanitizedGeoJSON.push(feature);
    }
  });

  return [...sanitizedGeoJSON];
};

/**
 * This function accepts a File and two call back functions onSuccess, onFailure and returns an IUploadHandler.
 * The file type is determined and processed into an array of features to be passed back in the onSuccess function.
 * Any errors during the processing are passed back in the onFailure function
 *
 * Accepted file types: zip, gpx, kml
 *
 * @param {{onSuccess: (Feature[]) => void, onFailure: (string) => void}} params
 * @returns {*} {IUploadHandler}
 */
export const boundaryUploadHelper = (params: {
  onSuccess: (features: Feature[]) => void;
  onFailure: (message: string) => void;
}): IUploadHandler => {
  const { onSuccess, onFailure } = params;
  return async (file: File) => {
    let features: Feature<Geometry, GeoJsonProperties>[] = [];
    try {
      if (file?.type.includes('zip') || file?.name.includes('.zip')) {
        features = await handleShapeFileUpload(file);
      } else if (file?.type.includes('gpx') || file?.name.includes('.gpx')) {
        features = await handleGPXUpload(file);
      } else if (file?.type.includes('kml') || file?.name.includes('.kml')) {
        features = await handleKMLUpload(file);
      } else {
        throw `${file?.type} is not supported`;
      }

      onSuccess(features);
    } catch (error) {
      onFailure(String(error));
    }
  };
};

/**
 * Calculates the bounding box that encompasses all of the given features
 *
 * @param features The features used to calculate the bounding box
 * @returns The bounding box, or undefined if a bounding box cannot be calculated.
 */
export const calculateFeatureBoundingBox = (features: Feature[]): BBox | undefined => {
  // If no geometries, we do not need to set bounds
  if (!features.length) {
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

    return [longitude + 1, latitude + 1, longitude - 1, latitude - 1];
  }

  /**
   * If there are multiple points or a polygon and a point, we can automatically
   * create a bouding box using Turf.
   */
  const allGeosFeatureCollection = {
    type: 'FeatureCollection',
    features: [...features]
  };

  return bbox(allGeosFeatureCollection);
};

/**
 * Converts a bounding box to a lat/long bounds expression
 * @param boundingBox
 * @returns
 */
export const latLngBoundsFromBoundingBox = (boundingBox: BBox): LatLngBoundsExpression => {
  return [
    [boundingBox[1], boundingBox[0]],
    [boundingBox[3], boundingBox[2]]
  ];
};

/**
 * Calculates the bounding box that encompasses all of the given features
 *
 * @param features The features used to calculate the map bounds
 * @returns The Lat/Long bounding box, or undefined if a bounding box cannot be calculated.
 */
export const calculateUpdatedMapBounds = (features: Feature[]): LatLngBoundsExpression | undefined => {
  const bboxCoords = calculateFeatureBoundingBox(features);

  if (!bboxCoords) {
    return;
  }

  return latLngBoundsFromBoundingBox(bboxCoords);
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
