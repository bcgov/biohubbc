import { Feature, FeatureCollection, Geometry, Position } from 'geojson';
import { cloneDeep } from 'lodash-es';
import proj4 from 'proj4';

/**
 * NOTE: This file is borrowed from the `reproj-helper` library, because the polyfills for `reproj-helper` are currently broken.
 * See: https://github.com/dhlevi/reproj-helper/blob/3e0bc47d6bd9e0adb8f3bae9ba87002110665a1d/src/reprojector.ts
 */

/**
 * A simple Reprojection class that works with Proj4 for
 * simplifying reprojection of GeoJson objects.
 *
 * Defaults to BC Albers and WGS84, but any projection string
 * Proj4 supports can be included.
 *
 * Supports projecting GeoJSON Geometry, GeometryCollection, Feature and FeatureCollection objects
 *
 * Supports chaining functions together for convinience, ie:
 * projector.from().to().source().project();
 */
export class ReProjector {
  public sourceFeature: FeatureCollection | Feature | Geometry | null;
  public fromProjection: string;
  public toProjection: string;

  /**
   * Constructor for ReProjector class. This will initialize a set of proejction definitions as well.
   * Definitions include: [ EPSG:3005, EPSG:3857, EPSG:3348, EPSG:3979, EPSG:3579, EPSG:3402 ] as well as
   * UTM zones 7N through 15N (As codes UTM<zone number>)
   * Default From Projection is EGSP:3005
   * Default To projection is WGS84
   */
  constructor() {
    this.init();

    this.sourceFeature = null;
    // Defaults to projecting BC Albers into WGS 84, our most common use case
    this.fromProjection = 'EPSG:3005';
    this.toProjection = 'WGS84';
  }

  /**
   * Static initializer for a ReProjector instance
   * Useful if you intend on chaining, ie:
   * ReProjector.instance().feature({...}).from('EPSG:3005').to('EPSG:3579').project();
   */
  public static instance() {
    return new ReProjector();
  }

  private init(): void {
    // Load any preset projections
    // BC Albers
    proj4.defs(
      'EPSG:3005',
      'PROJCS["NAD83 / BC Albers", GEOGCS["NAD83", DATUM["North_American_Datum_1983", SPHEROID["GRS 1980",6378137,298.257222101, AUTHORITY["EPSG","7019"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY["EPSG","6269"]], PRIMEM["Greenwich",0, AUTHORITY["EPSG","8901"]], UNIT["degree",0.0174532925199433, AUTHORITY["EPSG","9122"]], AUTHORITY["EPSG","4269"]], PROJECTION["Albers_Conic_Equal_Area"], PARAMETER["standard_parallel_1",50], PARAMETER["standard_parallel_2",58.5], PARAMETER["latitude_of_center",45], PARAMETER["longitude_of_center",-126], PARAMETER["false_easting",1000000], PARAMETER["false_northing",0], UNIT["metre",1, AUTHORITY["EPSG","9001"]], AXIS["Easting",EAST], AXIS["Northing",NORTH], AUTHORITY["EPSG","3005"]]'
    );
    // Pseudo Mercator
    proj4.defs(
      'EPSG:3857',
      '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs'
    );
    // StatsCan Lambert
    proj4.defs(
      'EPSG:3348',
      '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=63.390675 +lon_0=-91.86666666666666 +x_0=6200000 +y_0=3000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );
    // Canada Atlas Lambert
    proj4.defs(
      'EPSG:3979',
      '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );
    // Yukon Albers
    proj4.defs(
      'EPSG:3579',
      '+proj=aea +lat_1=61.66666666666666 +lat_2=68 +lat_0=59 +lon_0=-132.5 +x_0=500000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );
    // Alberta 10-TM Forest
    proj4.defs(
      'EPSG:3402',
      '+proj=tmerc +lat_0=0 +lon_0=-115 +k=0.9992 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );
    // utms 7N through 15n
    proj4.defs('UTM7', '+proj=utm +zone=7 +datum=WGS84 +units=m +no_defs');
    proj4.defs('UTM8', '+proj=utm +zone=8 +datum=WGS84 +units=m +no_defs');
    proj4.defs('UTM9', '+proj=utm +zone=9 +datum=WGS84 +units=m +no_defs');
    proj4.defs('UTM10', '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs');
    proj4.defs('UTM11', '+proj=utm +zone=11 +datum=WGS84 +units=m +no_defs');
    proj4.defs('UTM12', '+proj=utm +zone=12 +datum=WGS84 +units=m +no_defs');
    proj4.defs('UTM13', '+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs');
    proj4.defs('UTM14', '+proj=utm +zone=14 +datum=WGS84 +units=m +no_defs');
    proj4.defs('UTM15', '+proj=utm +zone=15 +datum=WGS84 +units=m +no_defs');
  }

  /**
   * Adds a definition string to Proj4. Use the definition by specifying the
   * code set here in the to and from functions
   * @param code Your desired code
   * @param definition The proj4 definition string
   */
  public addDefinition(code: string, definition: string): this {
    proj4.defs(code, definition);
    return this;
  }

  /**
   * Set the feature you wish to project. The projected feature will be a deep copy
   * The original feature passed in will be untouched.
   * @param feature Feature Type
   */
  public feature(feature: FeatureCollection | Feature | Geometry): this {
    this.sourceFeature = feature;
    return this;
  }

  /**
   * Projection code to use on the "from" projection
   * @param from Code (usually an EPSG Code)
   */
  public from(from: string): this {
    this.fromProjection = from;
    return this;
  }

  /**
   * Projection code to use on the "To" projection
   * @param from Code (usually an EPSG Code)
   */
  public to(to: string): this {
    this.toProjection = to;
    return this;
  }

  public definitionIsRegistered(epsgCode: string): boolean {
    const def = proj4.defs(epsgCode);
    return def != null;
  }

  /**
   * Run the projection. This function is asyncronous and will
   * return a promise by default. The source feature must be set prior
   * Your source feature will be deep cloned and not modified by this process
   */
  public async project(): Promise<FeatureCollection | Feature | Geometry | null> {
    if (!this.sourceFeature) {
      console.error('No feature to project! Stopping');
      throw new Error('Invalid Source Feature');
    }

    let clonedFeature = null;

    try {
      clonedFeature = cloneDeep(this.sourceFeature);

      if (clonedFeature.type === 'FeatureCollection') {
        for (const feature of clonedFeature.features) {
          if (feature.geometry.type === 'GeometryCollection') {
            for (const geometry of feature.geometry.geometries) {
              this.projectGeometry(geometry);
            }
          } else {
            this.projectGeometry(feature.geometry as Geometry);
          }
        }
      } else if (clonedFeature.type === 'GeometryCollection') {
        for (const geometry of clonedFeature.geometries) {
          this.projectGeometry(geometry);
        }
      } else if (clonedFeature.type === 'Feature' && clonedFeature.geometry.type === 'GeometryCollection') {
        for (const geometry of clonedFeature.geometry.geometries) {
          this.projectGeometry(geometry);
        }
      } else if (clonedFeature.type === 'Feature') {
        this.projectGeometry(clonedFeature.geometry);
      } else {
        this.projectGeometry(clonedFeature as Geometry);
      }
    } catch (err) {
      console.error(`Failed to reproject feature: ${err}`);
    }

    return clonedFeature;
  }

  private projectGeometry(geometry: Geometry): void {
    switch (geometry.type) {
      case 'Point': {
        this.projectPoint(geometry.coordinates);
        break;
      }
      case 'LineString':
      case 'MultiPoint': {
        this.projectLineString(geometry.coordinates);
        break;
      }
      case 'Polygon':
      case 'MultiLineString': {
        this.projectPolygon(geometry.coordinates);
        break;
      }
      case 'MultiPolygon': {
        for (const poly of geometry.coordinates) {
          this.projectPolygon(poly);
        }
        break;
      }
      default: {
        console.error('No valid type found for this geometry. Projection cancelled');
        console.error(geometry);
        break;
      }
    }
  }

  private projectPolygon(polygon: Position[][]): void {
    for (const item of polygon) {
      this.projectLineString(item);
    }
  }

  private projectLineString(lineString: Position[]): void {
    for (const item of lineString) {
      this.projectPoint(item);
    }
  }

  private projectPoint(coords: Position): void {
    const projectedCoords = proj4(this.fromProjection, this.toProjection, coords);

    for (let i = 0; i < projectedCoords.length; i++) {
      coords[i] = projectedCoords[i];
    }
  }
}
