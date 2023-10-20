import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useCodesApi from './useCodesApi';

describe('useCodesApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('getAllCodeSets works as expected', async () => {
    mock.onGet('/api/codes/').reply(200, {
      system_roles: [{ id: 1, name: 'Role 1' }]
    });

    const result = await useCodesApi(axios).getAllCodeSets();

    expect(result.system_roles).toEqual([{ id: 1, name: 'Role 1' }]);
  });
});
