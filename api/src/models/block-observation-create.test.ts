import { expect } from 'chai';
import { describe } from 'mocha';
import { PostBlockObservationObject } from './block-observation-create';

describe('PostBlockObservationObject', () => {
  describe('No values provided', () => {
    let data: PostBlockObservationObject;

    before(() => {
      data = new PostBlockObservationObject(null);
    });

    it('sets block_name', () => {
      expect(data.block_name).to.equal(null);
    });

    it('sets start_datetime', () => {
      expect(data.start_datetime).to.equal(null);
    });

    it('sets end_datetime', () => {
      expect(data.end_datetime).to.equal(null);
    });

    it('sets observation_count', () => {
      expect(data.observation_count).to.equal(null);
    });

    it('sets observation_data', () => {
      expect(data.observation_data).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: PostBlockObservationObject;

    const blockObservationObj = {
      block_name: 'block_name',
      start_datetime: '2021-06-01T01:06:00.000Z',
      end_datetime: '2021-06-01T02:06:00.000Z',
      observation_count: 50,
      observation_data: {
        metaData: { block_name: 'block_name' },
        tableData: {
          data: [['1', '2']]
        }
      }
    };

    before(() => {
      data = new PostBlockObservationObject(blockObservationObj);
    });

    it('sets block_name', () => {
      expect(data.block_name).to.equal(blockObservationObj.block_name);
    });

    it('sets start_datetime', () => {
      expect(data.start_datetime).to.equal(blockObservationObj.start_datetime);
    });

    it('sets end_datetime', () => {
      expect(data.end_datetime).to.eql(blockObservationObj.end_datetime);
    });

    it('sets observation_count', () => {
      expect(data.observation_count).to.eql(blockObservationObj.observation_count);
    });

    it('sets observation_data', () => {
      expect(data.observation_data).to.equal(blockObservationObj.observation_data);
    });
  });
});
