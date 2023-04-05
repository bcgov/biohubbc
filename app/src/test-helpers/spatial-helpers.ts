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
