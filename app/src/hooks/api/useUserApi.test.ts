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

  const userId = 123;

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

  it('getUserById works as expected', async () => {
    mock.onGet(`/api/user/${userId}/get`).reply(200, {
      id: 123,
      user_record_end_date: 'test',
      user_identifier: 'myidirboss',
      role_names: ['role 1', 'role 2']
    });

    const result = await useUserApi(axios).getUserById(123);

    expect(result.id).toEqual(123);
    expect(result.user_record_end_date).toEqual('test');
    expect(result.user_identifier).toEqual('myidirboss');
    expect(result.role_names).toEqual(['role 1', 'role 2']);
  });

  it('getUsersList works as expected', async () => {
    mock.onGet('/api/user/list').reply(200, [
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

  it('addSystemUserRoles works as expected', async () => {
    const userId = 1;

    mock.onPost(`/api/user/${userId}/system-roles/create`).reply(200, 3);

    const result = await useUserApi(axios).addSystemUserRoles(1, [1, 2, 3]);

    expect(result).toEqual(3);
  });
});
