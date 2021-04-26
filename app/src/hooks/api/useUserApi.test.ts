import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useUserApi from './useUserApi';

describe('useUserApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('getUser works as expected', async () => {
    mock.onGet('/api/user/self').reply(200, {
      id: 1,
      user_identifier: 'myidirboss',
      role_names: ['role 1', 'role 2']
    });

    const result = await useUserApi(axios).getUser();

    expect(result.id).toEqual(1);
    expect(result.user_identifier).toEqual('myidirboss');
    expect(result.role_names).toEqual(['role 1', 'role 2']);
  });

  it('getUsersList works as expected', async () => {
    mock.onGet('/api/users').reply(200, [
      {
        id: 1,
        user_identifier: 'myidirboss',
        role_names: ['role 1', 'role 2']
      },
      {
        id: 2,
        user_identifier: 'myidirbossagain',
        role_names: ['role 1', 'role 4']
      }
    ]);

    const result = await useUserApi(axios).getUsersList();

    expect(result[0].id).toEqual(1);
    expect(result[0].user_identifier).toEqual('myidirboss');
    expect(result[0].role_names).toEqual(['role 1', 'role 2']);
    expect(result[1].id).toEqual(2);
    expect(result[1].user_identifier).toEqual('myidirbossagain');
    expect(result[1].role_names).toEqual(['role 1', 'role 4']);
  });
});
