export interface IDeploymentAdvancedFilters {
  /**
   * Filter results by keyword.
   *
   * @type {string}
   * @memberof IDeploymentAdvancedFilters
   */
  keyword?: string;
  /**
   * Filter results by species TSN.
   *
   * @type {number}
   * @memberof IDeploymentAdvancedFilters
   */
  itis_tsn?: number;
  /**
   * Filter results by start date.
   *
   * @type {string}
   * @memberof IDeploymentAdvancedFilters
   */
  start_date?: string;
  /**
   * Filter results by end date.
   *
   * @type {string}
   * @memberof IDeploymentAdvancedFilters
   */
  end_date?: string;
  /**
   * Filter results by start time.
   *
   * @type {string}
   * @memberof IDeploymentAdvancedFilters
   */
  start_time?: string;
  /**
   * Filter results by end time.
   *
   * @type {string}
   * @memberof IDeploymentAdvancedFilters
   */
  end_time?: string;
  /**
   * Filter results by system user id.
   *
   * Note: This is not the id of the user making the request.
   *
   * @type {number}
   * @memberof IDeploymentAdvancedFilters
   */
  system_user_id?: number;
  /**
   * Filter results by device serial.
   *
   * @type {string}
   * @memberof IDeploymentAdvancedFilters
   */
  device_serial?: string;
  /**
   * Filter results by species.
   *
   * @type {number}
   * @memberof IDeploymentAdvancedFilters
   */
  species?: number;
  /**
   * Filter results by animal alias.
   *
   * @type {string}
   * @memberof IDeploymentAdvancedFilters
   */
  animal_alias?: string;
  /**
   * Filter results by deployment ids.
   *
   * @type {number[]}
   * @memberof IDeploymentAdvancedFilters
   */
  deployment_ids?: number[];
  /**
   * Filter results by survey ids.
   *
   * @type {number[]}
   * @memberof IAnimalAdvancedFilters
   */
  survey_ids?: number[];
}
