export interface IAllTelemetryAdvancedFilters {
  /**
   * Filter results by keyword.
   *
   * @type {string}
   * @memberof IAnimalAdvancedFilters
   */
  keyword?: string;
  /**
   * Filter results by ITIS TSNs.
   *
   * @type {number[]}
   * @memberof IAnimalAdvancedFilters
   */
  itis_tsns?: number[];
  /**
   * Filter results by ITIS TSN.
   *
   * @type {number}
   * @memberof IAnimalAdvancedFilters
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
   * Filter results by system user id.
   *
   * Note: This is not the id of the user making the request.
   *
   * @type {number}
   * @memberof IAnimalAdvancedFilters
   */
  system_user_id?: number;
  /**
   * Filter results by survey ids.
   *
   * @type {number[]}
   * @memberof IAnimalAdvancedFilters
   */
  survey_ids?: number[];
}
