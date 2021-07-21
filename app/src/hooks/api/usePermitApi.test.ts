import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import usePermitApi from './usePermitApi';

describe('usePermitApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('getPermitsList works as expected', async () => {
    const res = [
      {
        id: 1,
        number: '123',
        type: 'Wildlife',
        coordinator_agency: 'agency',
        project_name: 'project 1'
      },
      {
        id: 2,
        number: '1233',
        type: 'Wildlife',
        coordinator_agency: 'agency 2',
        project_name: 'project 2'
      }
    ];

    mock.onGet(`/api/permit/list`).reply(200, res);

    const result = await usePermitApi(axios).getPermitsList();

    expect(result).toEqual(res);
  });

  it('getNonSamplingPermits works as expected', async () => {
    const res = [
      {
        permit_id: 1,
        number: '123',
        type: 'Wildlife'
      },
      {
        permit_id: 2,
        number: '1233',
        type: 'Wildlife'
      }
    ];

    mock.onGet(`/api/permit/get-no-sampling`).reply(200, res);

    const result = await usePermitApi(axios).getNonSamplingPermits();

    expect(result).toEqual(res);
  });

  it('createPermits works as expected', async () => {
    const permitData = {
      permit: {
        permits: [
          {
            permit_number: 'number',
            permit_type: 'type'
          }
        ]
      },
      coordinator: {
        first_name: 'first',
        last_name: 'last',
        email_address: 'email@example.com',
        coordinator_agency: 'agency',
        share_contact_details: 'true'
      }
    };

    mock.onPost('/api/permit/create-no-sampling').reply(200, {
      ids: [1]
    });

    const result = await usePermitApi(axios).createPermits(permitData);

    expect(result).toEqual({ ids: [1] });
  });
});
