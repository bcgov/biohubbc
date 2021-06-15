import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/observation-view');

interface IBlockObservations {
  id: number;
  block_id: number;
  number_of_observations: number;
  start_time: string;
  end_time: string;
}

/**
 * Processes GET block observation list data
 *
 * @export
 * @class GetBlockObservationListData
 */
export class GetBlockObservationListData {
  blockObservations: IBlockObservations[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'GetBlockObservationListData', message: 'params', obj });

    this.blockObservations =
      (obj?.length &&
        obj.map((item: any) => {
          return {
            id: item.id,
            block_id: item.b_id,
            number_of_observations: item.observation_cnt,
            start_time: item.start_datetime,
            end_time: item.end_datetime
          };
        })) ||
      [];
  }
}
