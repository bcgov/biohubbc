import { expect } from 'chai';
import { describe } from 'mocha';
import { GetBlockObservationListData } from './observation-view';

describe('GetBlockObservationListData', () => {
  describe('No values provided', () => {
    let result: any;

    before(() => {
      result = new GetBlockObservationListData(null);
    });

    it('sets blockObservations to empty array', () => {
      expect(result.blockObservations).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let result: any;

    const obj = [
      {
        id: 1,
        b_id: 2,
        observation_cnt: 3,
        start_datetime: 'Mon 03-Jul-2017, 11:00 AM',
        end_datetime: 'Mon 03-Jul-2017, 11:10 AM'
      }
    ];

    before(() => {
      result = new GetBlockObservationListData(obj);
    });

    it('sets blockObservations', function () {
      expect(result).to.deep.equal({
        blockObservations: [
          {
            id: 1,
            block_id: 2,
            number_of_observations: 3,
            start_time: 'Mon 03-Jul-2017, 11:00 AM',
            end_time: 'Mon 03-Jul-2017, 11:10 AM'
          }
        ]
      });
    });
  });
});
