/**
 * Add type definitions for `@tmcw/togeojson` while no official type definitions yet exist.
 *
 * See issue: https://github.com/placemark/togeojson/issues/46
 */
declare module '@tmcw/togeojson' {
  export function gpx(doc: Document): FeatureCollection;
  export function gpx<TProperties extends GeoJsonProperties>(doc: Document): FeatureCollection<TProperties>;

  export function kml(doc: Document): FeatureCollection;
  export function kml<TProperties extends GeoJsonProperties>(doc: Document): FeatureCollection<Geometry, TProperties>;
}
