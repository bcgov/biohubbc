export interface IDeploymentAdvancedFilters {
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
