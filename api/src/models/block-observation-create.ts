/**
 * Processes all POST /project/{projectId}/survey/{surveyId}/observations/create request data.
 *
 * @export
 * @class PostBlockObservationObject
 */
export class PostBlockObservationObject {
  block_name: number;
  start_datetime: string;
  end_datetime: string;
  observation_count: number;
  observation_data: string;

  constructor(obj?: any) {
    //this.block_name = (obj?.block_name && Number(obj?.block_name)) || ((null as unknown) as number);
    this.block_name = obj?.block_name || null;
    this.start_datetime = obj?.start_datetime || null;
    this.end_datetime = obj?.end_datetime || null;
    this.observation_count = obj?.observation_count || null;
    this.observation_data = obj?.observation_data || null;
  }
}
