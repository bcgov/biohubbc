import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { v4 } from 'uuid';
import { useAuthentication } from './useAuthenticationApi';

describe('useAuthenticationApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const mockUuid = v4();

  it('basic success case', async () => {
    mock.onPost('/api/critter-data/signup').reply(200, {
      user_id: mockUuid
    });

    const result = await useAuthentication(axios).signUp();

    expect(result?.user_id).toBe(mockUuid);
  });
});
