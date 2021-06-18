import { expect } from 'chai';
import { describe } from 'mocha';
import { PostBlockObservationObject } from '../../models/block-observation-create';
import {
  postBlockObservationSQL
} from './observation-create-queries';

describe('postBlockObservationSQL', () => {
  it('returns null when null surveyId param provided', () => {
    const observation = new PostBlockObservationObject();
    const response = postBlockObservationSQL((null as unknown) as number, observation);

    expect(response).to.be.null;
  });

  it('returns a block_observation id when valid surveyId and data are provided', () => {

    const blockObservationData = {
      block_name: 'block_name',
      start_datetime: '2020/04/03',
      end_datetime: '2020/05/05',
      observation_count: 50,
      observation_data: {
      }
    };

    const postBlockObservationObject = new PostBlockObservationObject(blockObservationData);
    const response = postBlockObservationSQL(1, postBlockObservationObject);

    expect(response).to.not.be.null;
  });
});
