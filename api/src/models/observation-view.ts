export interface IObservationAdvancedFilters {
  keyword?: string;
  /**
   * Filter results by ITIS TSNs.
   *
   * @type {number[]}
   * @memberof IObservationAdvancedFilters
   */
  itis_tsns?: number[];
  /**
   * Filter results by ITIS TSN.
   *
   * @type {number}
   * @memberof IObservationAdvancedFilters
   */
  itis_tsn?: number;
  /**
   * Filter results by start date.
   *
   * @type {string}
   * @memberof IObservationAdvancedFilters
   */
  start_date?: string;
  /**
   * Filter results by end date.
   *
   * @type {string}
   * @memberof IObservationAdvancedFilters
   */
  end_date?: string;
  /**
   * Filter results by start time.
   *
   * @type {string}
   * @memberof IObservationAdvancedFilters
   */
  start_time?: string;
  /**
   * Filter results by end time.
   *
   * @type {string}
   * @memberof IObservationAdvancedFilters
   */
  end_time?: string;
  /**
   * Filter results by minimum count.
   *
   * @type {number}
   * @memberof IObservationAdvancedFilters
   */
  min_count?: number;
  /**
   * Filter results by system user id.
   *
   * Note: This is not the id of the user making the request.
   *
   * @type {number}
   * @memberof IObservationAdvancedFilters
   */
  system_user_id?: number;
}
