import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useExternalApi from './useExternalApi';

describe('useExternalApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('`get` works as expected', async () => {
    mock.onGet('www.test-url.com').reply(200, { testData: 'success' });

    const result = await useExternalApi(axios).get('www.test-url.com');

    expect(result.testData).toEqual('success');
  });
});
