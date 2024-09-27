import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useUserApi from './useUserApi';

describe('useUserApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const systemUserId = 123;

  it('getUser works as expected', async () => {
    mock.onGet('/api/user/self').reply(200, {
      system_user_id: 1,
      user_identifier: 'myidirboss',
      role_names: ['role 1', 'role 2']
    });

    const result = await useUserApi(axios).getUser();

    expect(result.system_user_id).toEqual(1);
    expect(result.user_identifier).toEqual('myidirboss');
    expect(result.role_names).toEqual(['role 1', 'role 2']);
  });

  it('getUserById works as expected', async () => {
    mock.onGet(`/api/user/${systemUserId}/get`).reply(200, {
      system_user_id: 123,
      record_end_date: 'test',
      user_identifier: 'myidirboss',
      role_names: ['role 1', 'role 2']
    });

    const result = await useUserApi(axios).getUserById(123);

    expect(result.system_user_id).toEqual(123);
    expect(result.record_end_date).toEqual('test');
    expect(result.user_identifier).toEqual('myidirboss');
    expect(result.role_names).toEqual(['role 1', 'role 2']);
  });

  it('getUsersList works as expected', async () => {
    mock.onGet('/api/user/list').reply(200, [
      {
        system_user_id: 1,
        user_identifier: 'myidirboss',
        role_names: ['role 1', 'role 2']
      },
      {
        system_user_id: 2,
        user_identifier: 'myidirbossagain',
        role_names: ['role 1', 'role 4']
      }
    ]);

    const result = await useUserApi(axios).getUsersList();

    expect(result[0].system_user_id).toEqual(1);
    expect(result[0].user_identifier).toEqual('myidirboss');
    expect(result[0].role_names).toEqual(['role 1', 'role 2']);
    expect(result[1].system_user_id).toEqual(2);
    expect(result[1].user_identifier).toEqual('myidirbossagain');
    expect(result[1].role_names).toEqual(['role 1', 'role 4']);
  });

  it('getProjectList works as expected', async () => {
    mock.onGet(`/api/user/${systemUserId}/projects/get`).reply(200, [
      {
        project_participation_id: 3,
        project_id: 321,
        project_name: 'test',
        system_user_id: 1,
        project_role_ids: [2],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1']
      }
    ]);

    const result = await useUserApi(axios).getProjectList(123);

    expect(result[0]).toEqual({
      project_participation_id: 3,
      project_id: 321,
      project_name: 'test',
      system_user_id: 1,
      project_role_ids: [2],
      project_role_names: ['Role1'],
      project_role_permissions: ['Permission1']
    });
  });
});
