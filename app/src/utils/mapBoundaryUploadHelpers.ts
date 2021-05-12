//@ts-ignore
import { kml } from '@tmcw/togeojson';
import shp from 'shpjs';
import { Feature } from 'geojson';
import bbox from '@turf/bbox';

/**
 * Convert a zipped shapefile to geojson
 * @param e The file upload event
 */
export const handleShapefileUpload = (e: any, values: any, setFieldValue: (key: string, value: any) => void) => {
  // Only accept one file
  const file = e.target.files[0];

  // Back out if not a zipped file
  if (!file?.type.match(/zip/)) {
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
 *
 * @param e The file upload event
 * @param setIsLoading change state of isLoading
 * @param setUploadError change state of upload error
 * @param values current form values
 * @param setFieldValue change form values
 */
export const handleKMLUpload = async (
  e: any,
  setIsLoading: (isLoading: boolean) => void,
  setUploadError: (uploadError: string) => void,
  values: any,
  setFieldValue: (key: string, value: any) => void
) => {
  setIsLoading(true);

  const file = e.target.files[0];
  const fileAsString = await file?.text().then((xmlString: string) => {
    return xmlString;
  });

  if (file?.type !== 'application/vnd.google-earth.kml+xml' && !fileAsString?.includes('</kml>')) {
    setUploadError('You must upload a KML file, please try again.');
    setIsLoading(false);
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
 * @param values current form values
 * @param setBounds change bounds on map
 */
export const updateMapBounds = (values: any, setBounds: (bounds: any[]) => void) => {
  /*
    If no geometries, we do not need to set bounds

    If there is only one geometry and it is a point, we cannot do the bound setting
    because leaflet does not know how to handle that and tries to zoom in way too much

    If there are multiple points or a polygon and a point, this is not an issue
  */
  if (
    !values ||
    !values.geometry ||
    !values.geometry.length ||
    (values.geometry.length === 1 && values.geometry[0].geometry.type === 'Point')
  ) {
    return;
  }

  const allGeosFeatureCollection = {
    type: 'FeatureCollection',
    features: [...values.geometry]
  };
  const bboxCoords = bbox(allGeosFeatureCollection);

  setBounds([
    [bboxCoords[1], bboxCoords[0]],
    [bboxCoords[3], bboxCoords[2]]
  ]);
};
