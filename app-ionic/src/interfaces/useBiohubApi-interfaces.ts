import { ActivityType, ActivitySubtype } from 'constants/activities';
import { PointOfInterestSubtype, PointOfInterestType } from 'constants/pointsOfInterest';
import { Feature } from 'geojson';

/**
 * Activity search filter criteria.
 *
 * @export
 * @interface IActivitySearchCriteria
 */
export interface IActivitySearchCriteria {
  /**
   * The page of results to return. Starts at 0.
   *
   * Note: Most UI's start at page 1, but this filter starts at page 0, so adjust accordingly when converting between
   * the two.
   *
   * @type {number}
   * @memberof IActivitySearchCriteria
   */
  page?: number;
  /**
   * The number of results to return.
   *@
   * @type {number}
   * @memberof IActivitySearchCriteria
   */
  limit?: number;
  /**
   * Column name to sort by.
   *
   * @type {string}
   * @memberof IActivitySearchCriteria
   */
  sort_by?: string;
  /**
   * Direction to sort by.
   *
   * @type {SORT_DIRECTION}
   * @memberof IActivitySearchCriteria
   */
  sort_direction?: SORT_DIRECTION;
  /**
   * Columns to return.
   *
   * @type {string[]}
   * @memberof IActivitySearchCriteria
   */
  column_names?: string[];
  /**
   * Activity type filter.
   *
   * @type {string[]}
   * @memberof IActivitySearchCriteria
   */
  activity_type?: string[];
  /**
   * Activity sub type filter.
   *
   * @type {string[]}
   * @memberof IActivitySearchCriteria
   */
  activity_subtype?: string[];
  /**
   * Date start filter. Defaults time to start of day.
   *
   * @type {string} iso date string
   * @memberof IActivitySearchCriteria
   */
  date_range_start?: string;
  /**
   * Date end filter. Defaults time to end of day.
   *
   * @type {string} iso date string
   * @memberof IActivitySearchCriteria
   */
  date_range_end?: string;
  /**
   * GeoJSON feature (of type polygon) to search in.
   *
   * @type {Feature}
   * @memberof IActivitySearchCriteria
   */
  search_feature?: Feature;
}

/**
 * Create or Update activity endpoint post body.
 *
 * @export
 * @interface ICreateOrUpdateActivity
 */
export interface ICreateOrUpdateActivity {
  activity_id: string;
  created_timestamp: string;
  activity_type: ActivityType;
  activity_subtype: ActivitySubtype;
  geometry: Feature[];
  media: IMedia[];
  form_data: any;
}

/**
 * Media object.
 *
 * @export
 * @interface IMedia
 */
export interface IMedia {
  media_date?: string;
  description?: string;
  file_name: string;
  encoded_file: string;
}

/**
 * PointOfInterest search filter criteria.
 *
 * @export
 * @interface IPointOfInterestSearchCriteria
 */
export interface IPointOfInterestSearchCriteria {
  /**
   * The page of results to return. Starts at 0.
   *
   * @type {number}
   * @memberof IPointOfInterestSearchCriteria
   */
  page?: number;
  /**
   * The number of results to return.
   *@
   * @type {number}
   * @memberof IPointOfInterestSearchCriteria
   */
  limit?: number;
  /**
   * PointOfInterest type filter.
   *
   * @type {string}
   * @memberof IPointOfInterestSearchCriteria
   */
  point_of_interest_type?: string;
  /**
   * PointOfInterest sub type filter.
   *
   * @type {string}
   * @memberof IPointOfInterestSearchCriteria
   */
  point_of_interest_subtype?: string;
  /**
   * Date start filter. Defaults time to start of day.
   *
   * @type {Date}
   * @memberof IPointOfInterestSearchCriteria
   */
  date_range_start?: Date;
  /**
   * Date end filter. Defaults time to end of day.
   *
   * @type {Date}
   * @memberof IPointOfInterestSearchCriteria
   */
  date_range_end?: Date;
  /**
   * GeoJSON feature (of type polygon) to search in.
   *
   * @type {Feature}
   * @memberof IPointOfInterestSearchCriteria
   */
  search_feature?: Feature;
}

/**
 * Create point_of_interest endpoint post body.
 *
 * @export
 * @interface ICreatePointOfInterest
 */
export interface ICreatePointOfInterest {
  point_of_interest_type: PointOfInterestType;
  point_of_interest_subtype: PointOfInterestSubtype;
  geometry: Feature[];
  media: IMedia[];
  form_data: any;
}

/**
 * Supported search sort directions.
 *
 * @export
 * @enum {number}
 */
export enum SORT_DIRECTION {
  ASC = 'ASC',
  DESC = 'DESC'
}
