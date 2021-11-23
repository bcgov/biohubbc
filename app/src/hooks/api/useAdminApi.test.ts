import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useAdminApi from './useAdminApi';

describe('useAdminApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('getAccessRequests works as expected', async () => {
    const response = [
      {
        id: 1,
        type: 1,
        type_name: 'type name',
        status: 1,
        status_name: 'status name',
        description: 'description',
        notes: 'notes',
        create_date: '2020/04/04',
        data: null
      }
    ];

    mock.onGet(`/api/administrative-activities`).reply(200, response);

    const result = await useAdminApi(axios).getAccessRequests();

    expect(result).toEqual(response);
  });

  it('updateAccessRequest works as expected', async () => {
    mock.onPut(`/api/access-request`).reply(200, true);

    const result = await useAdminApi(axios).updateAccessRequest('userIdentifier', 'identitySource', 2, 2, [1, 2, 3]);

    expect(result).toEqual(true);
  });

  it('updateAdministrativeActivity works as expected', async () => {
    mock.onPut(`/api/administrative-activity`).reply(200, true);

    const result = await useAdminApi(axios).updateAdministrativeActivity(2, 2);

    expect(result).toEqual(true);
  });

  it('createAdministrativeActivity works as expected', async () => {
    mock.onPost('/api/administrative-activity').reply(200, {
      id: 2,
      date: '2020/04/04'
    });

    const result = await useAdminApi(axios).createAdministrativeActivity({ key: 'value' });

    expect(result).toEqual({
      id: 2,
      date: '2020/04/04'
    });
  });

  it('hasPendingAdministrativeActivities works as expected', async () => {
    mock.onGet('/api/administrative-activity').reply(200, 10);

    const result = await useAdminApi(axios).hasPendingAdministrativeActivities();

    expect(result).toEqual(10);
  });
});
