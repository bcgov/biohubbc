import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  IAccessRequestDataObject,
  IgcNotifyGenericMessage,
  IgcNotifyRecipient
} from 'interfaces/useAdminApi.interface';
import useAdminApi from './useAdminApi';

describe('useAdminApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('sendGCNotification works as expected', async () => {
    mock.onPost('/api/gcnotify/send').reply(200);

    const result = await useAdminApi(axios).sendGCNotification(
      ({ emailAddress: 'test@@email.com' } as unknown) as IgcNotifyRecipient,
      ({ body: 'test' } as unknown) as IgcNotifyGenericMessage
    );

    expect(result).toEqual(true);
  });

  it('getAdministrativeActivities works as expected', async () => {
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

    const result = await useAdminApi(axios).getAdministrativeActivities();

    expect(result).toEqual(response);
  });

  it('createAdministrativeActivity works as expected', async () => {
    mock.onPost('/api/administrative-activity').reply(200, {
      id: 2,
      date: '2020/04/04'
    });

    const result = await useAdminApi(axios).createAdministrativeActivity(({
      key: 'value'
    } as unknown) as IAccessRequestDataObject);

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

  it('addSystemUser works as expected', async () => {
    mock.onPost(`/api/user/add`).reply(200, true);

    const result = await useAdminApi(axios).addSystemUser('userGuid', 'userIdentifier', 'identitySource', 1);

    expect(result).toEqual(true);
  });
});
