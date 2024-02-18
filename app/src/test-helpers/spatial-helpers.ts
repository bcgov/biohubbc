export const geoJsonFeature: GeoJSON.Feature = {
  type: 'Feature',
  id: 'myGeo',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-128, 55],
        [-128, 55.5],
        [-128, 56],
        [-126, 58],
        [-128, 55]
      ]
    ]
  },
  properties: {
    name: 'Biohub Islands'
  }
};

export const geoJsonFeatureEPSG3005 =
  'POLYGON ((872374.3449996561 1113032.6446307488, 873950.920586759 1168822.1261821394, 875527.3688862697 1224607.1034719958, 1000000 1445935.5859771925, 872374.3449996561 1113032.6446307488))';

export const geoJsonFeatureEPSG4326 = 'POLYGON ((-128 55, -128 55.5, -128 56, -126 58, -128 55))';
